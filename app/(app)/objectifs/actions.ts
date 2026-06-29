"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GoalType } from "@/lib/types";

export type GoalActionResult = { error?: string };

function getWeekBounds(today: string): { start: string; end: string } {
  const d = new Date(today);
  const day = d.getDay();
  const startDiff = day === 0 ? 6 : day - 1;
  const start = new Date(d);
  start.setDate(d.getDate() - startDiff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function getMonthBounds(today: string): { start: string; end: string } {
  const [y, m] = today.slice(0, 7).split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0);
  const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
  return { start, end };
}

export async function createGoalV2(data: {
  goalType: GoalType;
  habitId: string | null;
  target: number;
  title: string;
}): Promise<GoalActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  if (data.target < 1) return { error: "La cible doit être d'au moins 1." };

  const today = new Date().toISOString().slice(0, 10);
  let start_date: string | null = null;
  let end_date: string | null = null;

  if (data.goalType === "count_week") {
    const b = getWeekBounds(today);
    start_date = b.start; end_date = b.end;
  } else if (data.goalType === "count_month" || data.goalType === "active_days_month") {
    const b = getMonthBounds(today);
    start_date = b.start; end_date = b.end;
  } else if (data.goalType === "streak") {
    start_date = today;
  }

  const { error } = await supabase.from("goals").insert({
    user_id:    user.id,
    title:      data.title,
    goal_type:  data.goalType,
    habit_id:   data.habitId,
    target:     data.target,
    start_date,
    end_date,
  });

  if (error) return { error: error.message };
  revalidatePath("/objectifs");
  return {};
}

export async function celebrateGoal(id: string): Promise<GoalActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("goals")
    .update({ is_done: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/objectifs");
  return {};
}

export async function deleteGoal(id: string): Promise<GoalActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/objectifs");
  return {};
}
