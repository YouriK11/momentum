"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import { Check, Flame, Trophy } from "lucide-react";
import { motion, animate, useSpring } from "framer-motion";
import type { Habit, HabitLevel } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

// ── Constants ──────────────────────────────────────────────────────────────────
const ACCENT: Record<HabitLevel, string> = {
  facile:    "#37c97e",
  moyen:     "#ffc24b",
  difficile: "#ec6480",
};
const LEVEL_LABEL: Record<HabitLevel, string> = {
  facile: "Facile", moyen: "Moyen", difficile: "Difficile",
};
const R            = 52;
const CIRCUMFERENCE = 2 * Math.PI * R;

// ── Props ──────────────────────────────────────────────────────────────────────
type ToggleFn = (h: Habit, origin?: { x: number; y: number }) => void;

type Props = {
  userId: string;
  username: string;
  streak: number;
  bestStreak: number;
  habits: Habit[];
  initialDone: string[];
  today: string;
};

// ── Main component ─────────────────────────────────────────────────────────────
export function TodaySession({ userId, username, streak, bestStreak, habits, initialDone, today }: Props) {
  const supabase      = useMemo(() => createClient(), []);
  const { toast }     = useToast();
  const [done, setDone] = useState<Set<string>>(new Set(initialDone));
  const prevScore     = useRef(-1);
  const burstTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const total  = habits.reduce((a, h) => a + Number(h.weight), 0);
  const earned = habits.filter((h) => done.has(h.id)).reduce((a, h) => a + Number(h.weight), 0);
  const score  = total > 0 ? Math.round((earned / total) * 100) : 0;
  const left   = habits.length - done.size;
  const zone   = score >= 80 ? "#37c97e" : score >= 50 ? "#ffc24b" : "#ec6480";

  // ── Spring gauge ─────────────────────────────────────────────────────────────
  const springOffset = useSpring(CIRCUMFERENCE, { stiffness: 72, damping: 18, mass: 1.2 });
  useEffect(() => { springOffset.set(CIRCUMFERENCE * (1 - score / 100)); }, [score, springOffset]);

  // ── Celebration at 100 % ─────────────────────────────────────────────────────
  useEffect(() => {
    if (score === 100 && prevScore.current < 100 && habits.length > 0) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        confetti({ particleCount: 150, spread: 88, origin: { y: 0.3 }, colors: ["#fc5200", "#ffc24b", "#37c97e"], ticks: 230 });
        burstTimer.current = setTimeout(() => confetti({
          particleCount: 75, spread: 115, origin: { y: 0.55, x: 0.2 },
          colors: ["#fc5200", "#ffffff"], ticks: 160,
        }), 170);
      }
    }
    prevScore.current = score;
    return () => clearTimeout(burstTimer.current);
  }, [score, habits.length]);

  // ── True optimistic toggle ───────────────────────────────────────────────────
  const toggle: ToggleFn = (h, origin) => {
    const was = done.has(h.id);
    setDone(prev => { const n = new Set(prev); was ? n.delete(h.id) : n.add(h.id); return n; });

    if (!was && origin && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      confetti({
        particleCount: 14, spread: 52, origin,
        colors: [ACCENT[h.level], "#fc5200"],
        ticks: 72, gravity: 2.2, scalar: 0.65, shapes: ["circle"],
      });
    }

    const req = was
      ? supabase.from("habit_logs").delete().eq("habit_id", h.id).eq("user_id", userId).eq("log_date", today)
      : supabase.from("habit_logs").upsert(
          { habit_id: h.id, user_id: userId, log_date: today, status: true },
          { onConflict: "habit_id,user_id,log_date" }
        );

    req.then(({ error }) => {
      if (error) {
        setDone(prev => { const rb = new Set(prev); was ? rb.add(h.id) : rb.delete(h.id); return rb; });
        toast("Erreur lors de l'enregistrement. Réessaie.", "error");
      }
    });
  };

  const dateLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const persos    = habits.filter((h) => !h.group_id);
  const commons   = habits.filter((h) =>  h.group_id);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted capitalize">{dateLabel}</p>
        <h1 className="mt-1 font-display font-black tracking-tight" style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}>
          Salut {username}
        </h1>
      </div>

      {/* ── Score hero ────────────────────────────────────────────────── */}
      <div
        className="card relative overflow-hidden p-7 md:p-8"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(252,82,0,0.09) 0%, transparent 55%),
            linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 65%)
          `,
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${zone}65, transparent)`, transition: "background 0.4s ease" }}
        />

        <div className="flex items-center gap-8">
          {/* Circular gauge — plus grande */}
          <div className="relative h-40 w-40 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="8" stroke="rgba(255,255,255,0.06)" />
              <motion.circle
                cx="60" cy="60" r={R} fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                style={{
                  strokeDashoffset: springOffset,
                  stroke: zone,
                  filter: `drop-shadow(0 0 9px ${zone}95)`,
                  transition: "stroke 0.4s ease, filter 0.4s ease",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <AnimatedScore value={score} color={zone} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">score</span>
            </div>
          </div>

          {/* Right column */}
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-black leading-tight">
              <motion.span
                key={done.size}
                initial={{ scale: 1.35, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                style={{ color: zone, display: "inline-block" }}
              >
                {done.size}
              </motion.span>
              <span className="text-muted"> / {habits.length} habitudes</span>
            </p>

            <p className="mt-2 text-[15px] text-muted">
              {habits.length === 0
                ? "Crée ta première habitude ↗"
                : left === 0
                ? "Journée parfaite — bravo !"
                : `${left} habitude${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}`}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <StatChip icon={<Flame size={13} />}   value={streak}     label="série"  color="#fc5200" />
              <StatChip icon={<Trophy size={13} />}  value={bestStreak} label="record" color="#ffc24b" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${score}%` }}
            transition={{ type: "spring", stiffness: 55, damping: 16 }}
            style={{ background: zone, boxShadow: `0 0 12px ${zone}60`, transition: "background 0.4s ease, box-shadow 0.4s ease" }}
          />
        </div>
      </div>

      {/* ── Habit list ────────────────────────────────────────────────── */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col items-center gap-3 p-12 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(252,82,0,0.1)" }}>
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <p className="font-display font-bold">Aucune habitude</p>
            <p className="mt-1 text-sm text-muted">Crée ta première habitude pour lancer ta série.</p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-5">
          {persos.length > 0 && (
            <HabitGroup label="Mes habitudes" habits={persos} done={done} onToggle={toggle} />
          )}
          {commons.length > 0 && (
            <HabitGroup label="Habitudes de groupe" habits={commons} done={done} onToggle={toggle} />
          )}
        </div>
      )}
    </div>
  );
}

// ── AnimatedScore ──────────────────────────────────────────────────────────────
function AnimatedScore({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || prev.current === value) { prev.current = value; return; }
    const from = prev.current;
    prev.current = value;
    const ctrl = animate(from, value, {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { if (el) el.textContent = String(Math.round(v)); },
    });
    return ctrl.stop;
  }, [value]);

  return (
    <span
      ref={ref}
      className="font-display font-black leading-none tabular-nums"
      style={{ fontSize: "clamp(44px, 5vw, 56px)", color, transition: "color 0.4s ease" }}
    >
      {value}
    </span>
  );
}

// ── StatChip ──────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium"
      style={{ background: color + "14", border: `1px solid ${color}24`, color }}
    >
      {icon}
      <b className="font-display font-bold tabular-nums">{value}j</b>
      <span style={{ color: "var(--color-muted)" }}>{label}</span>
    </span>
  );
}

// ── HabitGroup ────────────────────────────────────────────────────────────────
function HabitGroup({ label, habits, done, onToggle }: {
  label: string; habits: Habit[]; done: Set<string>; onToggle: ToggleFn;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      {habits.map((h, i) => (
        <HabitRow key={h.id} habit={h} checked={done.has(h.id)} onToggle={onToggle} index={i} />
      ))}
    </div>
  );
}

// ── HabitRow ──────────────────────────────────────────────────────────────────
function HabitRow({ habit: h, checked, onToggle, index }: {
  habit: Habit; checked: boolean; onToggle: ToggleFn; index: number;
}) {
  const accent = ACCENT[h.level];
  const ref    = useRef<HTMLButtonElement>(null);

  function handleClick() {
    let origin: { x: number; y: number } | undefined;
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      origin = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
    }
    onToggle(h, origin);
  }

  return (
    <motion.button
      ref={ref}
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.984 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { delay: index * 0.045, duration: 0.25 },
        y:       { delay: index * 0.045, type: "spring", stiffness: 280, damping: 28 },
        scale:   { type: "spring", stiffness: 500, damping: 22 },
      }}
      onClick={handleClick}
      aria-pressed={checked}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-[18px] border p-5 text-left"
      style={{
        backgroundColor: checked ? "rgba(252,82,0,0.07)" : "var(--color-surface)",
        borderColor:     checked ? "rgba(252,82,0,0.2)"  : "rgba(255,255,255,0.07)",
        boxShadow:       checked
          ? "inset 0 1px 0 rgba(252,82,0,0.1), 0 0 0 1px rgba(0,0,0,0.4), 0 8px 28px -8px rgba(252,82,0,0.14)"
          : "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(0,0,0,0.4)",
        transition: "background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.28s ease",
      }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 bottom-3 top-3 w-[3px] rounded-full"
        style={{ background: accent, originY: "50%" }}
        animate={{ scaleY: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
      />

      {/* Checkbox */}
      <div
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
        style={{
          borderColor:     checked ? "var(--color-primary)" : "rgba(142,142,154,0.38)",
          backgroundColor: checked ? "var(--color-primary)" : "transparent",
          boxShadow:       checked ? "0 0 12px rgba(252,82,0,0.55)" : "none",
          transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <motion.div
          initial={false}
          animate={checked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 550, damping: 22 }}
        >
          <Check size={11} strokeWidth={3.5} className="text-white" />
        </motion.div>
      </div>

      {/* Icon */}
      <motion.div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-2xl"
        animate={{ scale: checked ? 0.88 : 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        style={{ background: accent + "22" }}
      >
        {h.icon ?? "🎯"}
      </motion.div>

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] font-semibold leading-snug"
          style={{
            color:                 checked ? "var(--color-muted)" : "var(--color-foreground)",
            textDecoration:        checked ? "line-through" : "none",
            textDecorationColor:   "rgba(142,142,154,0.45)",
            transition: "color 0.22s ease",
          }}
        >
          {h.name}
        </p>
        {h.description && (
          <p className="mt-0.5 truncate text-[13px] text-muted">{h.description}</p>
        )}
      </div>

      {/* Level + weight badge */}
      <motion.span
        animate={{ opacity: checked ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
        className="shrink-0 rounded-[10px] px-2.5 py-1 text-[11px] font-semibold"
        style={{ background: accent + "1e", color: accent }}
      >
        {LEVEL_LABEL[h.level]} · {h.weight}
      </motion.span>
    </motion.button>
  );
}
