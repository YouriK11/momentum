import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GroupsPanel } from "@/components/groups-panel";

export default async function GroupesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: groups } = await supabase
    .from("groups")
    .select("id,name,description")
    .order("created_at");

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Communauté
        </p>
        <h1
          className="mt-1 font-display font-black tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          Mes groupes
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Crée un cercle ou rejoins celui d&apos;un ami.
        </p>
      </header>
      <GroupsPanel groups={groups ?? []} />
    </div>
  );
}
