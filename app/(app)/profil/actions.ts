"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUsername(username: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const trimmed = username.trim();
  if (!trimmed)        return { error: "Le pseudo ne peut pas être vide." };
  if (trimmed.length > 30) return { error: "Le pseudo est trop long (max 30 caractères)." };

  const { error } = await supabase
    .from("profiles")
    .update({ username: trimmed })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profil");
  revalidatePath("/home");
  return {};
}
