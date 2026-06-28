import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Leaderboard } from "@/components/leaderboard";
import { GroupActions } from "@/components/group-actions";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: group }, { data: lb }] = await Promise.all([
    supabase.from("groups").select("id,name,description,invite_code,owner_id").eq("id", id).single(),
    supabase.rpc("group_leaderboard", { p_group: id, p_today: today }),
  ]);
  if (!group) notFound();

  const rows = (lb ?? []).map((r: {
    user_id: string; username: string; avatar_url: string | null;
    streak: number; today_score: number; week_score: number;
  }) => ({
    userId: r.user_id, username: r.username, avatarUrl: r.avatar_url,
    streak: r.streak, today: r.today_score, weekAvg: r.week_score,
  }));

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">{group.name}</h1>
          {group.description && <p className="text-sm text-neutral-500">{group.description}</p>}
        </header>

        <GroupActions
          groupId={group.id}
          inviteCode={group.invite_code}
          isOwner={group.owner_id === userId}
          memberCount={rows.length}
        />

        <h2 className="mb-4 mt-10 text-sm font-medium text-neutral-400">Classement du groupe</h2>
        <Leaderboard rows={rows} meId={userId} />
      </div>
    </main>
  );
}