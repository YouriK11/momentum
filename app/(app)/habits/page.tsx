import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveHabits } from "@/lib/data/habits";
import { getUserGroups } from "@/lib/data/groups";
import { HabitManager } from "@/components/habits/habit-manager";
import type { Habit } from "@/lib/types";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const [{ data: habits }, { data: groups }] = await Promise.all([
    getActiveHabits(supabase),   // pas de filtre date : gestion de toutes les habitudes
    getUserGroups(supabase),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Gestion
        </p>
        <h1
          className="mt-1 font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          Mes habitudes
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Configure et organise tes habitudes personnelles et de groupe.
        </p>
      </header>
      <HabitManager
        userId={userId}
        habits={(habits ?? []) as Habit[]}
        groups={(groups ?? []).map((g) => ({ id: g.id, name: g.name }))}
      />
    </div>
  );
}
