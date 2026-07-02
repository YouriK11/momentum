"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Flame, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { requestPasswordReset, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-14"
      style={{ background: "var(--color-background)" }}>

      <div className="w-full max-w-[390px]">

        {/* Logo */}
        <Link href="/login" className="mb-10 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
            style={{ background: "var(--color-primary)" }}
          >
            <Flame size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Momentum</span>
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="font-display text-[32px] font-semibold tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-[15px]" style={{ color: "var(--color-muted)" }}>
            Entre ton e-mail, on t&apos;envoie un lien de réinitialisation.
          </p>
        </div>

        {state.success ? (
          /* Success state */
          <div
            className="flex flex-col items-start gap-4 rounded-[16px] p-6"
            style={{ background: "rgba(143,170,126,0.06)", border: "1px solid rgba(143,170,126,0.2)" }}
          >
            <CheckCircle size={24} style={{ color: "var(--color-success)" }} />
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--color-foreground)" }}>
              {state.success}
            </p>
            <Link
              href="/login"
              className="mt-2 flex items-center gap-2 text-[14px] font-semibold"
              style={{ color: "var(--color-muted)" }}
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          /* Form */
          <form action={formAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="toi@exemple.com"
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
                "Envoi…"
              ) : (
                <>
                  Envoyer le lien
                  <ArrowRight
                    size={16}
                    className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-[14px] font-semibold"
              style={{ color: "var(--color-muted)" }}
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
