import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { getGoalsV2, computeGoalProgress } from "@/lib/data/goals";
import { getActiveHabits } from "@/lib/data/habits";
import { GoalsManager } from "@/components/goals/goals-manager";
import type { Habit } from "@/lib/types";

export default async function ObjectifsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: profile }, rawGoals, { data: habitsData }] = await Promise.all([
    getProfile(supabase, userId),
    getGoalsV2(supabase, userId),
    getActiveHabits(supabase),
  ]);

  const goals = await computeGoalProgress(
    supabase,
    userId,
    rawGoals,
    today,
    profile?.current_streak ?? 0,
  );

  const habits = (habitsData ?? []) as Habit[];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Intentions
        </p>
        <h1
          className="mt-1 font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          Mes objectifs
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Qu&apos;est-ce que tu veux ancrer ?
        </p>
      </header>
      <GoalsManager goals={goals} habits={habits} />
    </div>
  );
}
