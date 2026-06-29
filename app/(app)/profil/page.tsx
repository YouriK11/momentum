import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { ProfileView } from "@/components/profile-view";
import { AvatarUploader } from "@/components/avatar-uploader";
import type { Badge } from "@/lib/types";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const [{ data: profile }, { data: badgeRows }] = await Promise.all([
    getProfile(supabase, userId),
    supabase.from("user_badges").select("badge:badges(code,name,description,icon)").eq("user_id", userId),
  ]);

  const badges = (badgeRows ?? []).map((r) => (r as unknown as { badge: Badge }).badge).filter(Boolean);

  return (
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
  );
}
