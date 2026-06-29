"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GoalType } from "@/lib/types";

export type GoalActionResult = { error?: string };

// ── Create new-style goal (v2) ─────────────────────────────────────────────────
export async function createGoalV2(data: {
  goalType: GoalType;
  habitId: string | null;
  targetCount: number;
  title: string;
}): Promise<GoalActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  if (data.targetCount < 1) return { error: "La cible doit être d'au moins 1." };

  const { error } = await supabase.from("goals").insert({
    user_id:      user.id,
    title:        data.title,
    target_value: 0,
    current_value: 0,
    goal_type:    data.goalType,
    habit_id:     data.habitId,
    target_count: data.targetCount,
  });

  if (error) return { error: error.message };
  revalidatePath("/objectifs");
  return {};
}

// ── Celebrate + mark done ──────────────────────────────────────────────────────
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

// ── Delete a goal ──────────────────────────────────────────────────────────────
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
