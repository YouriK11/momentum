import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { getActiveHabits, getTodayLogs } from "@/lib/data/habits";
import { getScoresFrom } from "@/lib/data/scores";
import { getFirstGroup, getGroupLeaderboard } from "@/lib/data/groups";
import { TodaySession } from "@/components/today-session";
import { WeekStats } from "@/components/week-stats";
import { ActivityFeed } from "@/components/activity-feed";
import { GroupSegment, EmptyGroup, type SegRow } from "@/components/group-segment";
import { Rewards } from "@/components/rewards";
import type { Habit, Badge } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const iso = (n = 0) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const today = iso(0), day7 = iso(6), day13 = iso(13);

  const [
    { data: profile },
    { data: habits },
    { data: logs },
    { data: scores14 },
    { data: badgeRows },
    { data: firstGroup },
  ] = await Promise.all([
    getProfile(supabase, userId),
    getActiveHabits(supabase, today),   // filtrée sur les habitudes prévues aujourd'hui
    getTodayLogs(supabase, userId, today),
    getScoresFrom(supabase, userId, day13),
    supabase.from("user_badges").select("badge:badges(code,name,description,icon)").eq("user_id", userId),
    getFirstGroup(supabase),
  ]);

  // ── Weekly stats ──────────────────────────────────────────────────────────────
  const scores   = scores14 ?? [];
  const sum      = (a: typeof scores) => a.reduce((acc, s) => acc + s.score, 0);
  const inWeek   = scores.filter((s) => s.score_date >= day7);
  const prevWeek = scores.filter((s) => s.score_date < day7);
  const weekAvg  = Math.round(sum(inWeek) / 7);
  const prevAvg  = Math.round(sum(prevWeek) / 7);
  const activeDays = inWeek.filter((s) => s.score > 0).length;
  const delta    = prevAvg > 0 ? Math.round(((weekAvg - prevAvg) / prevAvg) * 100) : null;

  // ── Group leaderboard ────────────────────────────────────────────────────────
  let segment: { name: string; id: string; rows: SegRow[] } | null = null;
  if (firstGroup) {
    const { data: lb } = await getGroupLeaderboard(supabase, firstGroup.id, today);
    segment = {
      id: firstGroup.id, name: firstGroup.name,
      rows: (lb ?? []).map((r) => ({
        userId: r.user_id, username: r.username, avatarUrl: r.avatar_url, value: r.week_score,
      })),
    };
  }

  const badges  = (badgeRows ?? []).map((r) => (r as unknown as { badge: Badge }).badge).filter(Boolean);
  const doneIds = (logs ?? []).filter((l) => l.status).map((l) => l.habit_id);

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

      {/* ── Left: session du jour ──────────────────────────────────────────────── */}
      <TodaySession
        userId={userId}
        username={profile?.username ?? "toi"}
        streak={profile?.current_streak ?? 0}
        bestStreak={profile?.best_streak ?? 0}
        habits={(habits ?? []) as Habit[]}
        initialDone={doneIds}
        today={today}
      />

      {/* ── Right: statistiques ────────────────────────────────────────────────── */}
      <aside className="flex flex-col gap-8 lg:border-l lg:border-white/[0.05] lg:pl-10">
        <WeekStats
          activeDays={activeDays}
          scoreAvg={weekAvg}
          bestStreak={profile?.best_streak ?? 0}
          delta={delta}
        />
        <ActivityFeed days={[...inWeek].reverse()} />
        {segment
          ? <GroupSegment name={segment.name} groupId={segment.id} rows={segment.rows} meId={userId} />
          : <EmptyGroup />}
        <Rewards badges={badges} />
      </aside>
    </div>
  );
}
