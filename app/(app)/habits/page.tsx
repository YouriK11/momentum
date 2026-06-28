import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HabitManager } from "@/components/habit-manager";
import type { Habit } from "@/lib/types";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: habits } = await supabase
    .from("habits")
    .select("id,name,description,icon,color,level,weight,scope,owner_id")
    .eq("is_active", true)
    .order("scope")
    .order("name");

  const { data: groups } = await supabase.from("groups").select("id,name").order("name");

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Gestion
        </p>
        <h1
          className="mt-1 font-display font-black tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          Mes habitudes
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Configure et organise tes habitudes personnelles et de groupe.
        </p>
      </header>
      <HabitManager userId={userId} habits={(habits ?? []) as Habit[]} groups={groups ?? []} />
    </div>
  );
}
