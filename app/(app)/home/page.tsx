import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Aujourd'hui" };
import { getProfile } from "@/lib/data/profile";
import { getActiveHabits, getTodayLogs } from "@/lib/data/habits";
import { getScoresFrom } from "@/lib/data/scores";
import { getFriendActivity } from "@/lib/data/social";
import { TodaySession } from "@/components/today/today-session";
import { ActivityFeed } from "@/components/today/activity-feed";
import { FriendActivityBar } from "@/components/social/friend-activity-bar";
import { OnboardingModal } from "@/components/profile/onboarding-modal";
import type { Habit } from "@/lib/types";
import { todayBrussels, daysAgoBrussels } from "@/lib/date";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const today = todayBrussels();
  const day7  = daysAgoBrussels(6);

  const [
    { data: profile },
    { data: habits },
    { data: logs },
    { data: scores },
    friendsActive,
  ] = await Promise.all([
    getProfile(supabase, userId),
    getActiveHabits(supabase, today),
    getTodayLogs(supabase, userId, today),
    getScoresFrom(supabase, userId, day7),
    getFriendActivity(supabase, userId, today),
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

        {/* Social proof — only shows if friends are active */}
        {friendsActive.length > 0 && (
          <FriendActivityBar friends={friendsActive} currentUserId={userId} />
        )}

        <ActivityFeed days={[...(scores ?? [])].reverse()} />
      </div>
    </>
  );
}
