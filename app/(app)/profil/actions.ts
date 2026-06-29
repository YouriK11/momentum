"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReactionType } from "@/lib/types";

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

export async function upsertReaction(
  eventId: string,
  reactionType: ReactionType,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Derive subject_user_id server-side to prevent client manipulation
  const { data: event } = await supabase
    .from("activity_events")
    .select("user_id")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Événement introuvable." };
  if (event.user_id === user.id) return { error: "Tu ne peux pas réagir à tes propres événements." };

  const { error } = await supabase.from("reactions").upsert(
    {
      event_id: eventId,
      subject_user_id: event.user_id,
      reactor_id: user.id,
      type: reactionType,
    },
    { onConflict: "event_id,reactor_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/profil");
  revalidatePath(`/profil/${event.user_id}`);
  return {};
}

export async function removeReaction(eventId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("event_id", eventId)
    .eq("reactor_id", user.id);

  if (error) return { error: error.message };

  const { data: event } = await supabase
    .from("activity_events")
    .select("user_id")
    .eq("id", eventId)
    .single();

  revalidatePath("/profil");
  if (event) revalidatePath(`/profil/${event.user_id}`);
  return {};
}
