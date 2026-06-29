import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { getActiveHabits, getTodayLogs } from "@/lib/data/habits";
import { getScoresFrom } from "@/lib/data/scores";
import { TodaySession } from "@/components/today/today-session";
import { ActivityFeed } from "@/components/today/activity-feed";
import { OnboardingModal } from "@/components/profile/onboarding-modal";
import type { Habit } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);
  const day7  = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);

  const [
    { data: profile },
    { data: habits },
    { data: logs },
    { data: scores },
  ] = await Promise.all([
    getProfile(supabase, userId),
    getActiveHabits(supabase, today),
    getTodayLogs(supabase, userId, today),
    getScoresFrom(supabase, userId, day7),
  ]);

  const doneIds = (logs ?? []).filter((l) => l.status).map((l) => l.habit_id);
  const showOnboarding = !profile?.onboarded && (habits ?? []).length === 0;

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          userId={userId}
          username={profile?.username ?? "toi"}
          avatarUrl={profile?.avatar_url ?? null}
        />
      )}
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <TodaySession
          userId={userId}
          username={profile?.username ?? "toi"}
          streak={profile?.current_streak ?? 0}
          bestStreak={profile?.best_streak ?? 0}
          habits={(habits ?? []) as Habit[]}
          initialDone={doneIds}
          today={today}
        />
        <ActivityFeed days={[...(scores ?? [])].reverse()} />
      </div>
    </>
  );
}
