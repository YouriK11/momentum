import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TodaySession } from "@/components/today-session";
import { WeekStats } from "@/components/week-stats";
import { ActivityFeed } from "@/components/activity-feed";
import { GroupSegment, EmptyGroup, type SegRow } from "@/components/group-segment";
import { Rewards } from "@/components/rewards";
import type { Habit, Badge } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const iso = (n = 0) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const today = iso(0), day7 = iso(6), day13 = iso(13);

  const [
    { data: profile }, { data: habits }, { data: logs },
    { data: scores14 }, { data: badgeRows }, { data: groups },
  ] = await Promise.all([
    supabase.from("profiles").select("username,current_streak,best_streak").eq("id", userId).single(),
    supabase
      .from("habits")
      .select("id,name,description,icon,color,level,weight,scope,owner_id,group_id")
      .eq("is_active", true)
      .order("scope")
      .order("name"),
    supabase.from("habit_logs").select("habit_id,status").eq("user_id", userId).eq("log_date", today),
    supabase.from("daily_scores").select("score_date,score,completed,planned").eq("user_id", userId).gte("score_date", day13).order("score_date"),
    supabase.from("user_badges").select("badge:badges(code,name,description,icon)").eq("user_id", userId),
    supabase.from("groups").select("id,name").order("created_at").limit(1),
  ]);

  // ── Weekly stats ────────────────────────────────────────────────────────────
  const scores  = scores14 ?? [];
  const sum     = (a: typeof scores) => a.reduce((acc, s) => acc + s.score, 0);
  const inWeek  = scores.filter((s) => s.score_date >= day7);
  const prevWeek = scores.filter((s) => s.score_date < day7);
  const weekAvg  = Math.round(sum(inWeek) / 7);
  const prevAvg  = Math.round(sum(prevWeek) / 7);
  const activeDays = inWeek.filter((s) => s.score > 0).length;
  const delta = prevAvg > 0 ? Math.round(((weekAvg - prevAvg) / prevAvg) * 100) : null;

  // ── Group leaderboard ───────────────────────────────────────────────────────
  let segment: { name: string; id: string; rows: SegRow[] } | null = null;
  const group = groups?.[0];
  if (group) {
    const { data: lb } = await supabase.rpc("group_leaderboard", { p_group: group.id, p_today: today });
    segment = {
      id: group.id, name: group.name,
      rows: (lb ?? []).map((r: { user_id: string; username: string; avatar_url: string | null; week_score: number }) => ({
        userId: r.user_id, username: r.username, avatarUrl: r.avatar_url, value: r.week_score,
      })),
    };
  }

  const badges = (badgeRows ?? []).map((r) => (r as unknown as { badge: Badge }).badge).filter(Boolean);
  const doneIds = (logs ?? []).filter((l) => l.status).map((l) => l.habit_id);

  return (
    // ── Two-column layout — 2fr / 1fr ─────────────────────────────────────────
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

      {/* ── Left: habits (≈ 67 % de l'espace) ────────────────────────────────── */}
      <TodaySession
        userId={userId}
        username={profile?.username ?? "toi"}
        streak={profile?.current_streak ?? 0}
        bestStreak={profile?.best_streak ?? 0}
        habits={(habits ?? []) as Habit[]}
        initialDone={doneIds}
        today={today}
      />

      {/* ── Right: stats panel (≈ 33 %) ──────────────────────────────────────── */}
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
