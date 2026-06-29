import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { getActivityEvents } from "@/lib/data/social";
import { ProfileView } from "@/components/profile/profile-view";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { ActivityTimeline } from "@/components/social/activity-timeline";
import type { Badge } from "@/lib/types";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const [{ data: profile }, { data: badgeRows }, events] = await Promise.all([
    getProfile(supabase, userId),
    supabase.from("user_badges").select("badge:badges(code,name,description,icon)").eq("user_id", userId),
    getActivityEvents(supabase, userId, 20),
  ]);

  const badges = (badgeRows ?? []).map((r) => (r as unknown as { badge: Badge }).badge).filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <ProfileView
        username={profile?.username ?? "toi"}
        streak={profile?.current_streak ?? 0}
        bestStreak={profile?.best_streak ?? 0}
        badges={badges}
      >
        <AvatarUploader
          userId={userId}
          username={profile?.username ?? "toi"}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </ProfileView>

      {/* Progrès récents — after badges section */}
      <section className="flex flex-col gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Progrès récents
        </p>
        <ActivityTimeline
          events={events}
          currentUserId={userId}
          profileUserId={userId}
        />
      </section>
    </div>
  );
}
