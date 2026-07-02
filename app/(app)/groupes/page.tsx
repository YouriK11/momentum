import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Groupes" };
import { getUserGroups } from "@/lib/data/groups";
import { getFeedEvents } from "@/lib/data/social";
import { getProfile } from "@/lib/data/profile";
import { getGoalsV2, computeGoalProgress } from "@/lib/data/goals";
import { getActiveHabits } from "@/lib/data/habits";
import { GroupsPanel } from "@/components/groups/groups-panel";
import { CircleFeed } from "@/components/social/circle-feed";
import { GoalsManager } from "@/components/goals/goals-manager";
import type { Habit, GoalV2 } from "@/lib/types";
import { todayBrussels } from "@/lib/date";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function GroupesPage({ searchParams }: Props) {
  const { view } = await searchParams;
  const isCercle    = view === "cercle";
  const isObjectifs = view === "objectifs";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const today = todayBrussels();

  // Always fetch groups (used in "Mes groupes" tab)
  const [{ data: groups }, feedEvents, profileResult, rawGoals, habitsResult] = await Promise.all([
    getUserGroups(supabase),
    isCercle    ? getFeedEvents(supabase, userId, 30)  : Promise.resolve([]),
    isObjectifs ? getProfile(supabase, userId)          : Promise.resolve({ data: null }),
    isObjectifs ? getGoalsV2(supabase, userId)          : Promise.resolve([] as GoalV2[]),
    isObjectifs ? getActiveHabits(supabase)             : Promise.resolve({ data: null }),
  ]);

  const goals = isObjectifs
    ? await computeGoalProgress(
        supabase,
        userId,
        rawGoals as GoalV2[],
        today,
        (profileResult as { data: { current_streak: number } | null }).data?.current_streak ?? 0,
      )
    : [];

  const habits = ((habitsResult as { data: unknown[] | null } | null)?.data ?? []) as Habit[];

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
          {isCercle ? "Le cercle" : isObjectifs ? "Mes intentions" : "Mes groupes"}
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          {isCercle    ? "Les progrès de tes amis, en temps réel."
           : isObjectifs ? "Qu'est-ce que tu veux ancrer ?"
           : "Tes cercles et tes intentions, réunis."}
        </p>
      </header>

      {/* Tab switcher */}
      <div
        className="flex gap-1 self-start rounded-[14px] p-1"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <TabLink href="/groupes"                active={!isCercle && !isObjectifs}>Mes groupes</TabLink>
        <TabLink href="/groupes?view=objectifs" active={isObjectifs}>Objectifs</TabLink>
        <TabLink href="/groupes?view=cercle"    active={isCercle}>Le cercle</TabLink>
      </div>

      {isCercle ? (
        <CircleFeed events={feedEvents as Parameters<typeof CircleFeed>[0]["events"]} currentUserId={userId} today={today} />
      ) : isObjectifs ? (
        <GoalsManager goals={goals} habits={habits} />
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
