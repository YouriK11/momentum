"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, Users, ListChecks, User, LogOut, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/avatar";
import { signout } from "@/app/auth/actions";
import { PageTransition } from "@/components/page-transition";

const NAV = [
  { href: "/home",      label: "Aujourd'hui", Icon: Home },
  { href: "/groupes",   label: "Groupes",     Icon: Users },
  { href: "/habits",    label: "Habitudes",   Icon: ListChecks },
  { href: "/objectifs", label: "Objectifs",   Icon: Target },
  { href: "/profil",    label: "Profil",      Icon: User },
] as const;

export function AppShell({
  username,
  avatarUrl,
  children,
}: {
  username: string;
  avatarUrl: string | null;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isActive = (href: string) => path.startsWith(href);

  return (
    <div className="flex min-h-dvh">

      {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside
        className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col p-3 md:flex"
        style={{
          background: "rgba(10,10,12,0.92)",
          backdropFilter: "blur(24px) saturate(160%)",
          borderRight: "1px solid rgba(255,255,255,0.055)",
        }}
      >
        {/* Logo */}
        <Link href="/home" className="mb-7 flex items-center gap-2.5 px-2 pt-3">
          <motion.span
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary"
            style={{ boxShadow: "0 0 20px rgba(252,82,0,0.48), 0 2px 6px rgba(0,0,0,0.5)" }}
          >
            <Flame size={16} className="text-white" />
          </motion.span>
          <span className="font-display text-[15px] font-black tracking-tight">
            Momentum
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5" aria-label="Navigation principale">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="relative flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150"
                style={{ color: active ? "var(--color-foreground)" : "var(--color-muted)" }}
              >
                {/* Sliding background pill */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-[13px]"
                    style={{
                      background: "rgba(252,82,0,0.09)",
                      border: "1px solid rgba(252,82,0,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}

                {/* Icon bubble */}
                <motion.span
                  animate={active
                    ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.04)", color: "var(--color-muted)" }
                  }
                  transition={{ duration: 0.16 }}
                  className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
                  style={active
                    ? { boxShadow: "0 0 10px rgba(252,82,0,0.48)" }
                    : undefined
                  }
                >
                  <Icon size={14} />
                </motion.span>

                <span className="relative z-10 flex-1 leading-none">{label}</span>

                {/* Active indicator dot */}
                {active && (
                  <motion.span
                    layoutId="sidebar-dot"
                    className="relative z-10 h-1.5 w-1.5 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 6px rgba(252,82,0,0.9)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div
          className="mt-auto rounded-[14px] p-3"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.065)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <Avatar url={avatarUrl} name={username} size={32} />
              <span
                className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-background bg-success"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">{username}</p>
              <p className="text-[11px] leading-tight" style={{ color: "var(--color-muted)" }}>En ligne</p>
            </div>
            <form action={signout}>
              <motion.button
                type="submit"
                title="Se déconnecter"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.88 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] transition-colors duration-150"
                style={{ color: "var(--color-muted)" }}
              >
                <LogOut size={13} />
              </motion.button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 pb-28 pt-8 md:px-12 md:pb-12 md:pt-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        aria-label="Navigation principale"
      >
        <div
          style={{
            background: "rgba(7,7,9,0.9)",
            backdropFilter: "blur(32px) saturate(180%)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingBottom: "max(env(safe-area-inset-bottom), 4px)",
          }}
        >
          <div className="flex items-stretch px-2 pt-2">
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="relative flex flex-1 flex-col items-center gap-1.5 rounded-2xl pb-2 pt-1.5"
                >
                  {/* Sliding pill background */}
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-x-0.5 inset-y-0 rounded-2xl"
                      style={{ background: "rgba(252,82,0,0.1)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    className="relative z-10"
                  >
                    <Icon
                      size={22}
                      style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}
                    />
                  </motion.div>

                  {/* Label */}
                  <span
                    className="relative z-10 text-[10px] font-semibold leading-none"
                    style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
