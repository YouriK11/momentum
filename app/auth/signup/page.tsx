"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-neutral-100">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-semibold">Créer un compte</h1>
        <p className="mb-6 text-sm text-neutral-400">Rejoins le groupe 🚀</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Pseudo
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-orange-600 py-2 text-sm font-medium transition hover:bg-orange-500 disabled:opacity-60"
          >
            {pending ? "Création…" : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-orange-400 hover:underline">
            Connexion
          </Link>
        </p>
      </div>
    </main>
  );
}