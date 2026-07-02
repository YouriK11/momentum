"use client";

import { useActionState } from "react";
import { Flame, ArrowRight, ShieldCheck } from "lucide-react";
import { updatePassword, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-14"
      style={{ background: "var(--color-background)" }}>

      <div className="w-full max-w-[390px]">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
            style={{ background: "var(--color-primary)" }}
          >
            <Flame size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Momentum</span>
        </div>

        {/* Icon + heading */}
        <div className="mb-8 flex flex-col gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[14px]"
            style={{ background: "rgba(203,139,106,0.1)" }}
          >
            <ShieldCheck size={22} style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <h1
              className="font-display text-[32px] font-semibold tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Nouveau mot de passe
            </h1>
            <p className="mt-2 text-[15px]" style={{ color: "var(--color-muted)" }}>
              Choisis un mot de passe d&apos;au moins 6 caractères.
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="6 caractères minimum"
              className="auth-input"
            />
          </div>

          {state.error && (
            <p
              className="rounded-[10px] px-4 py-3 text-sm font-medium"
              style={{
                background: "rgba(207,139,136,0.1)",
                border: "1px solid rgba(207,139,136,0.2)",
                color: "var(--color-danger)",
              }}
              role="alert"
              aria-live="polite"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="auth-submit group mt-1"
          >
            {pending ? (
              "Mise à jour…"
            ) : (
              <>
                Enregistrer le mot de passe
                <ArrowRight
                  size={16}
                  className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
