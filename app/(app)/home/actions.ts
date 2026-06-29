"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendEncouragement(
  toUserId: string,
  message?: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };
  if (toUserId === user.id) return { error: "Tu ne peux pas t'encourager toi-même." };

  const { error } = await supabase.from("encouragements").insert({
    from_user: user.id,
    to_user: toUserId,
    message: message?.trim() || null,
  });

  if (error) return { error: error.message };
  return {};
}
