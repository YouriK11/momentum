"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string };

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    // 'username' est lu par ton trigger handle_new_user pour créer le profil
    options: { data: { username: String(formData.get("username")) } },
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email")).trim();
  if (!email) return { error: "Adresse e-mail requise." };

  const supabase = await createClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  if (error) return { error: "Impossible d'envoyer l'e-mail. Réessaie." };

  return {
    success:
      "Si un compte existe avec cet e-mail, tu recevras un lien de réinitialisation dans quelques secondes.",
  };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password"));
  if (password.length < 6)
    return { error: "Le mot de passe doit faire au moins 6 caractères." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: "Impossible de mettre à jour le mot de passe. Réessaie." };

  revalidatePath("/", "layout");
  redirect("/home");
}