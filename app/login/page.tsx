"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Flame, ArrowRight, Zap, Users, Trophy } from "lucide-react";
import { login, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

const FEATURES = [
  { Icon: Zap,    text: "Score quotidien calculé en temps réel" },
  { Icon: Users,  text: "Challenges et classements avec tes amis" },
  { Icon: Trophy, text: "Badges, séries et records personnels" },
] as const;

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-dvh">

      {/* ── Left: Brand panel ─────────────────────────────────────────────── */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:w-[55%] flex-col justify-between p-14"
        style={{
          background: "linear-gradient(145deg, #0f0c18 0%, #0a0a0c 60%, #0c0e0a 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Ambient glow — brand orange, top-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: "-25%", left: "-15%",
            width: 700, height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(203,139,106,0.12) 0%, transparent 68%)",
            filter: "blur(56px)",
          }}
        />
        {/* Ambient glow — success green, bottom-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            bottom: "-12%", right: "-12%",
            width: 560, height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(143,170,126,0.07) 0%, transparent 68%)",
            filter: "blur(56px)",
          }}
        />
        {/* Dot-grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
            style={{
              background: "var(--color-primary)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            <Flame size={20} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Momentum</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h1
            className="font-display font-semibold leading-[1.04] tracking-tight"
            style={{ fontSize: "clamp(38px, 4vw, 56px)", letterSpacing: "-0.035em" }}
          >
            Forge tes<br />
            <span style={{ color: "var(--color-primary)" }}>habitudes.</span>
            <br />
            Change ta vie.
          </h1>
          <p
            className="mt-5 max-w-xs text-[17px] leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            Suis tes progrès, défie tes amis, construis la discipline qui te définit.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {FEATURES.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
                  style={{
                    background: "rgba(203,139,106,0.11)",
                    border: "1px solid rgba(203,139,106,0.2)",
                  }}
                >
                  <Icon size={15} style={{ color: "var(--color-primary)" }} />
                </span>
                <span className="text-[15px] font-medium leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <div
          className="relative z-10 rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.065)",
          }}
        >
          <p
            className="text-[14px] italic leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            "La discipline est le pont entre les objectifs et les accomplissements."
          </p>
          <p className="mt-2 text-xs font-bold" style={{ color: "var(--color-primary)" }}>
            — Jim Rohn
          </p>
        </div>
      </div>

      {/* ── Right: Form panel ──────────────────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-14"
        style={{ background: "var(--color-background)" }}
      >
        {/* Mobile-only logo */}
        <div className="mb-12 flex items-center gap-2.5 lg:hidden">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
            style={{
              background: "var(--color-primary)",
              boxShadow: "none",
            }}
          >
            <Flame size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Momentum</span>
        </div>

        <div className="w-full max-w-[390px]">

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="font-display text-[32px] font-semibold tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Connexion
            </h2>
            <p className="mt-2 text-[15px]" style={{ color: "var(--color-muted)" }}>
              Content de te revoir.
            </p>
          </div>

          {/* Form */}
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

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
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
                "Connexion…"
              ) : (
                <>
                  Se connecter
                  <ArrowRight
                    size={16}
                    className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
              Pas encore de compte ?
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <Link
            href="/signup"
            className="flex h-12 w-full items-center justify-center rounded-[12px] text-[15px] font-semibold transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "var(--color-foreground)",
            }}
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
