import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserGroups } from "@/lib/data/groups";
import { getFeedEvents } from "@/lib/data/social";
import { GroupsPanel } from "@/components/groups/groups-panel";
import { CircleFeed } from "@/components/social/circle-feed";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function GroupesPage({ searchParams }: Props) {
  const { view } = await searchParams;
  const isCercle = view === "cercle";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: groups }, feedEvents] = await Promise.all([
    getUserGroups(supabase),
    isCercle ? getFeedEvents(supabase, userId, 30) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Communauté
        </p>
        <h1
          className="mt-1 font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          {isCercle ? "Le cercle" : "Mes groupes"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {isCercle
            ? "Les progrès de tes amis, en temps réel."
            : "Crée un cercle ou rejoins celui d'un ami."}
        </p>
      </header>

      {/* Tab switcher */}
      <div
        className="flex gap-1 self-start rounded-[14px] p-1"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <TabLink href="/groupes" active={!isCercle}>Mes groupes</TabLink>
        <TabLink href="/groupes?view=cercle" active={isCercle}>Le cercle</TabLink>
      </div>

      {isCercle ? (
        <CircleFeed events={feedEvents} currentUserId={userId} today={today} />
      ) : (
        <GroupsPanel groups={groups ?? []} />
      )}
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[10px] px-4 py-2 text-[13px] font-semibold transition-all duration-150"
      style={{
        background: active ? "var(--color-primary)" : "transparent",
        color: active ? "#fff" : "var(--color-muted)",
      }}
    >
      {children}
    </Link>
  );
}
