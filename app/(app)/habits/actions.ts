"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { HabitLevel } from "@/lib/types";

export type HabitActionResult = { error?: string };

export async function createHabit(data: {
  userId: string;
  name: string;
  description: string | null;
  icon: string;
  level: HabitLevel;
  weight: number;
  scope: "perso" | "commune";
  groupId: string | null;
}): Promise<HabitActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("habits").insert({
    owner_id:    data.userId,
    name:        data.name,
    description: data.description,
    icon:        data.icon,
    level:       data.level,
    weight:      data.weight,
    scope:       data.scope,
    group_id:    data.groupId,
  });

  if (error) return { error: error.message };

  // Invalide les deux pages Server Components concernées
  revalidatePath("/home");
  revalidatePath("/habits");
  return {};
}

export async function archiveHabit(id: string): Promise<HabitActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("habits")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/home");
  revalidatePath("/habits");
  return {};
}
