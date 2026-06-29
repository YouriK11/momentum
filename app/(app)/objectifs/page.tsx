import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGoals } from "@/lib/data/goals";
import { GoalsManager } from "@/components/goals/goals-manager";
import type { Goal } from "@/lib/types";

export default async function ObjectifsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const { data: goals } = await getGoals(supabase, userId);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Progression
        </p>
        <h1
          className="mt-1 font-display font-black tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          Mes objectifs
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Définis des cibles mesurables et suis ta progression.
        </p>
      </header>
      <GoalsManager goals={(goals ?? []) as Goal[]} />
    </div>
  );
}
