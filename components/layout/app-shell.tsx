"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Flame, Home, Users, ListChecks, User, LogOut, Bell, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/profile/avatar";
import { signout } from "@/app/auth/actions";
import { PageTransition } from "@/components/layout/page-transition";

const NAV = [
  { href: "/home",    label: "Aujourd'hui", Icon: Home },
  { href: "/groupes", label: "Groupes",     Icon: Users },
  { href: "/habits",  label: "Habitudes",   Icon: ListChecks },
  { href: "/profil",  label: "Profil",      Icon: User },
] as const;

const SHORTCUTS = [
  { keys: ["G", "H"], label: "Aller à Aujourd'hui" },
  { keys: ["G", "A"], label: "Aller à Habitudes" },
  { keys: ["G", "G"], label: "Aller à Groupes" },
  { keys: ["G", "P"], label: "Aller à Profil" },
  { keys: ["?"],      label: "Afficher les raccourcis" },
] as const;

export function AppShell({
  username,
  avatarUrl,
  unreadCount = 0,
  children,
}: {
  username: string;
  avatarUrl: string | null;
  unreadCount?: number;
  children: React.ReactNode;
}) {
  const path     = usePathname();
  const router   = useRouter();
  const isActive = (href: string) => path.startsWith(href);

  const [showShortcuts, setShowShortcuts] = useState(false);
  const pendingG = useRef(false);
  const gTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (e.key === "Escape") { setShowShortcuts(false); pendingG.current = false; return; }
      if (e.key === "?") { e.preventDefault(); setShowShortcuts((v) => !v); return; }

      if (key === "g" && !pendingG.current) {
        pendingG.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => { pendingG.current = false; }, 800);
        return;
      }

      if (pendingG.current) {
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        if (key === "h") router.push("/home");
        else if (key === "a") router.push("/habits");
        else if (key === "g") router.push("/groupes");
        else if (key === "p") router.push("/profil");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="flex min-h-dvh">
      <a href="#main-content" className="skip-link">Aller au contenu</a>

      {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
      <aside
        className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col p-3 md:flex"
        style={{
          background: "rgba(22,20,15,0.94)",
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
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
          >
            <Flame size={16} className="text-white" />
          </motion.span>
          <span className="text-[15px] font-semibold">
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
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-[13px]"
                    style={{
                      background: "rgba(203,139,106,0.09)",
                      border: "1px solid rgba(203,139,106,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}

                <motion.span
                  animate={active
                    ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.04)", color: "var(--color-muted)" }
                  }
                  transition={{ duration: 0.16 }}
                  className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
                >
                  <Icon size={14} />
                </motion.span>

                <span className="relative z-10 flex-1 leading-none">{label}</span>

                {active && (
                  <motion.span
                    layoutId="sidebar-dot"
                    className="relative z-10 h-1.5 w-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Keyboard shortcut hint */}
        <button
          onClick={() => setShowShortcuts(true)}
          className="mb-3 mt-auto flex items-center gap-2 rounded-[10px] px-3 py-2 text-[12px] font-medium transition-colors hover:bg-white/5"
          style={{ color: "var(--color-muted)" }}
        >
          <Keyboard size={13} />
          <span>Raccourcis</span>
          <kbd
            className="ml-auto rounded-[5px] px-1.5 py-0.5 font-mono text-[10px]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            ?
          </kbd>
        </button>

        {/* User card */}
        <div
          className="rounded-[14px] p-3"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.065)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <Avatar url={avatarUrl} name={username} size={32} />
              <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">{username}</p>
              <p className="text-[11px] leading-tight" style={{ color: "var(--color-muted)" }}>En ligne</p>
            </div>

            {/* Notification bell — desktop */}
            <Link
              href="/notifications"
              title="Notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
              className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] transition-colors duration-150"
              style={{ color: "var(--color-muted)" }}
            >
              <Bell size={13} />
              {unreadCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <form action={signout}>
              <motion.button
                type="submit"
                title="Se déconnecter"
                aria-label="Se déconnecter"
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

        {/* Mobile top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden"
          style={{
            background: "rgba(22,20,14,0.88)",
            backdropFilter: "blur(20px) saturate(160%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Link href="/home" className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-primary"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
            >
              <Flame size={12} className="text-white" />
            </span>
            <span className="text-[14px] font-semibold">Momentum</span>
          </Link>

          <Link
            href="/notifications"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
            className="relative flex h-8 w-8 items-center justify-center rounded-full"
            style={{ color: "var(--color-muted)" }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
                style={{ background: "var(--color-primary)" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>

        <main id="main-content" className="flex-1 px-4 pb-28 pt-6 md:px-12 md:pb-12 md:pt-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* ── Keyboard shortcuts overlay ────────────────────────────────── */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="w-full max-w-sm rounded-[20px] p-6"
              style={{ background: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center gap-2.5">
                <Keyboard size={16} style={{ color: "var(--color-primary)" }} />
                <p className="font-display text-[15px] font-semibold">Raccourcis clavier</p>
              </div>
              <ul className="flex flex-col gap-2">
                {SHORTCUTS.map(({ keys, label }) => (
                  <li key={label} className="flex items-center justify-between gap-4">
                    <span className="text-[13px]" style={{ color: "var(--color-muted)" }}>{label}</span>
                    <span className="flex items-center gap-1">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded-[6px] px-2 py-0.5 font-mono text-[11px] font-semibold"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "var(--color-foreground)",
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px]" style={{ color: "var(--color-muted)" }}>
                Appuie sur <kbd className="rounded px-1 font-mono text-[10px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>Esc</kbd> pour fermer
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom nav ─────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
        aria-label="Navigation principale"
      >
        <div
          style={{
            background: "rgba(22,20,14,0.92)",
            backdropFilter: "blur(32px) saturate(180%)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingBottom: "max(env(safe-area-inset-bottom), 4px)",
          }}
        >
          <div className="flex items-stretch px-2 pt-2">
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(href);
              const isProfile = href === "/profil";
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="relative flex flex-1 flex-col items-center gap-1.5 rounded-2xl pb-2 pt-1.5"
                >
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-x-0.5 inset-y-0 rounded-2xl"
                      style={{ background: "rgba(203,139,106,0.1)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}

                  <motion.div
                    animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    className="relative z-10"
                  >
                    <Icon
                      size={22}
                      style={{ color: active ? "var(--color-primary)" : "var(--color-muted)" }}
                    />
                    {/* Badge dot on Profil when unread notifications exist */}
                    {isProfile && unreadCount > 0 && !active && (
                      <span
                        className="absolute -right-1 -top-1 h-2 w-2 rounded-full border-2"
                        style={{
                          background: "var(--color-primary)",
                          borderColor: "rgba(22,20,14,0.92)",
                        }}
                      />
                    )}
                  </motion.div>

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
