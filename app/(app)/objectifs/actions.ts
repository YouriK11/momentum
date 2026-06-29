"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type GoalActionResult = { error?: string };

export async function createGoal(data: {
  title: string;
  targetValue: number;
  unit: string | null;
  deadline: string | null;
}): Promise<GoalActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.from("goals").insert({
    user_id:       user.id,
    title:         data.title,
    target_value:  data.targetValue,
    current_value: 0,
    unit:          data.unit,
    deadline:      data.deadline,
  });

  if (error) return { error: error.message };
  revalidatePath("/objectifs");
  return {};
}

export async function updateGoalProgress(id: string, currentValue: number): Promise<GoalActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ current_value: currentValue })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/objectifs");
  return {};
}

export async function markGoalDone(id: string): Promise<GoalActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ is_done: true })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/objectifs");
  return {};
}
