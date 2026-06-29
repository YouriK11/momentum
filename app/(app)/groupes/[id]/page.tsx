import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupById, getGroupLeaderboard } from "@/lib/data/groups";
import { Leaderboard } from "@/components/groups/leaderboard";
import { GroupActions, type GroupMember } from "@/components/groups/group-actions";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: group }, { data: lb }] = await Promise.all([
    getGroupById(supabase, id),
    getGroupLeaderboard(supabase, id, today),
  ]);
  if (!group) notFound();

  const rows = (lb ?? []).map((r) => ({
    userId: r.user_id, username: r.username, avatarUrl: r.avatar_url,
    streak: r.streak, today: r.today_score, weekAvg: r.week_score,
  }));

  const members: GroupMember[] = rows.map((r) => ({
    userId: r.userId,
    username: r.username,
    avatarUrl: r.avatarUrl,
  }));

  return (
    <main>
      <div className="mx-auto max-w-xl px-4 pb-24 pt-10">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-black">{group.name}</h1>
          {group.description && (
            <p className="mt-1 text-[14px] text-muted">{group.description}</p>
          )}
        </header>

        <GroupActions
          groupId={group.id}
          groupName={group.name}
          inviteCode={group.invite_code}
          isOwner={group.owner_id === userId}
          members={members}
          meId={userId}
        />

        <h2 className="mb-4 mt-10 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Classement du groupe
        </h2>
        <Leaderboard rows={rows} meId={userId} />
      </div>
    </main>
  );
}
