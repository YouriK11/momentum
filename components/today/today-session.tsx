"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Flame, Trophy } from "lucide-react";
import { motion, animate, useSpring } from "framer-motion";
import type { Habit, HabitLevel } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

const LEVEL_LABEL: Record<HabitLevel, string> = {
  facile: "Facile", moyen: "Moyen", difficile: "Difficile",
};
const R             = 52;
const CIRCUMFERENCE = 2 * Math.PI * R;

type ToggleFn = (h: Habit) => void;

type Props = {
  userId: string;
  username: string;
  streak: number;
  bestStreak: number;
  habits: Habit[];
  initialDone: string[];
  today: string;
};

export function TodaySession({ userId, username, streak, bestStreak, habits, initialDone, today }: Props) {
  const supabase  = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [done, setDone] = useState<Set<string>>(new Set(initialDone));

  const total   = habits.reduce((a, h) => a + Number(h.weight), 0);
  const earned  = habits.filter((h) => done.has(h.id)).reduce((a, h) => a + Number(h.weight), 0);
  const score   = total > 0 ? Math.round((earned / total) * 100) : 0;
  const left    = habits.length - done.size;
  const isEmpty = habits.length === 0;
  const zone    = isEmpty ? "rgba(168,158,141,0.3)" : score >= 80 ? "#8faa7e" : score >= 50 ? "#c4a882" : "#cf8b88";

  const springOffset = useSpring(CIRCUMFERENCE, { stiffness: 72, damping: 18, mass: 1.2 });
  useEffect(() => { springOffset.set(CIRCUMFERENCE * (1 - score / 100)); }, [score, springOffset]);

  const toggle: ToggleFn = (h) => {
    const was = done.has(h.id);
    setDone(prev => { const n = new Set(prev); was ? n.delete(h.id) : n.add(h.id); return n; });

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
    <div className="flex flex-col gap-7">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted capitalize">{dateLabel}</p>
        <h1 className="mt-1 font-semibold" style={{ fontSize: "clamp(26px, 2.8vw, 38px)" }}>
          Bonjour {username}
        </h1>
      </div>

      {/* ── Progress card ─────────────────────────────────────────────── */}
      <div className="card relative overflow-hidden p-6 md:p-7">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${zone}28, transparent)`, transition: "background 0.5s ease" }}
        />

        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {isEmpty
            ? "Aucune habitude pour aujourd'hui."
            : `${done.size} habitude${done.size > 1 ? "s" : ""} sur ${habits.length} complétée${done.size > 1 ? "s" : ""}.`}
        </span>

        <div className="flex items-center gap-7">
          {/* Circular gauge */}
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="5" stroke="rgba(255,255,255,0.06)" />
              <motion.circle
                cx="60" cy="60" r={R} fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                style={{ strokeDashoffset: springOffset, stroke: zone, transition: "stroke 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatedScore value={score} color={zone} isEmpty={isEmpty} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted">score</span>
            </div>
          </div>

          {/* Right column */}
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold leading-tight">
              <motion.span
                key={done.size}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                style={{ color: zone, display: "inline-block" }}
              >
                {done.size}
              </motion.span>
              <span className="text-muted"> / {habits.length}</span>
            </p>
            <p className="text-[15px] text-muted">
              {habits.length === 0
                ? "Crée ta première habitude ↗"
                : left === 0
                ? "Toutes faites — bien joué !"
                : `${left} restante${left > 1 ? "s" : ""} aujourd'hui`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatChip icon={<Flame size={12} />} value={streak}     label="série" />
              <StatChip icon={<Trophy size={12} />} value={bestStreak} label="record" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${score}%` }}
            transition={{ type: "spring", stiffness: 55, damping: 18 }}
            style={{ background: zone, transition: "background 0.5s ease" }}
          />
        </div>
      </div>

      {/* ── Habit list ────────────────────────────────────────────────── */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col items-center gap-3 p-12 text-center"
        >
          <span className="text-3xl">🌱</span>
          <div>
            <p className="font-semibold">Aucune habitude</p>
            <p className="mt-1 text-sm text-muted">Crée ta première habitude pour commencer.</p>
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
function AnimatedScore({ value, color, isEmpty }: { value: number; color: string; isEmpty?: boolean }) {
  const ref  = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (isEmpty) return;
    const el = ref.current;
    if (!el || prev.current === value) { prev.current = value; return; }
    const from = prev.current;
    prev.current = value;
    const ctrl = animate(from, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { if (el) el.textContent = String(Math.round(v)); },
    });
    return ctrl.stop;
  }, [value, isEmpty]);

  return (
    <span
      ref={ref}
      className="font-semibold leading-none tabular-nums"
      style={{ fontSize: "clamp(32px, 4vw, 44px)", color, transition: "color 0.5s ease" }}
    >
      {isEmpty ? "—" : value}
    </span>
  );
}

// ── StatChip ──────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium text-muted"
      style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
    >
      {icon}
      <span className="tabular-nums font-semibold">{value}j</span>
      <span>{label}</span>
    </span>
  );
}

// ── HabitGroup ────────────────────────────────────────────────────────────────
function HabitGroup({ label, habits, done, onToggle }: {
  label: string; habits: Habit[]; done: Set<string>; onToggle: ToggleFn;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
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
  return (
    <motion.button
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.988 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { delay: index * 0.04, duration: 0.22 },
        y: { delay: index * 0.04, type: "spring", stiffness: 280, damping: 28 },
        scale: { type: "spring", stiffness: 500, damping: 24 },
      }}
      onClick={() => onToggle(h)}
      aria-pressed={checked}
      className="relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left"
      style={{
        backgroundColor: checked ? "rgba(143,170,126,0.06)" : "var(--color-surface)",
        borderColor: checked ? "rgba(143,170,126,0.2)" : "var(--color-border)",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* Checkbox */}
      <div
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
        style={{
          borderColor: checked ? "var(--color-success)" : "rgba(168,158,141,0.3)",
          backgroundColor: checked ? "var(--color-success)" : "transparent",
          transition: "border-color 0.2s ease, background-color 0.2s ease",
        }}
      >
        <motion.div
          initial={false}
          animate={checked ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 24 }}
        >
          <Check size={11} strokeWidth={3} className="text-white" />
        </motion.div>
      </div>

      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ background: "var(--color-surface-2)" }}
      >
        {h.icon ?? "🌱"}
      </div>

      {/* Label */}
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] font-medium leading-snug"
          style={{
            color: checked ? "var(--color-muted)" : "var(--color-foreground)",
            textDecoration: checked ? "line-through" : "none",
            textDecorationColor: "rgba(168,158,141,0.3)",
            transition: "color 0.22s ease",
          }}
        >
          {h.name}
        </p>
        {h.description && (
          <p className="mt-0.5 truncate text-[13px] text-muted">{h.description}</p>
        )}
      </div>

      {/* Level badge */}
      <span
        className="shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium"
        style={{ color: "var(--color-muted)", background: "var(--color-surface-2)" }}
      >
        {LEVEL_LABEL[h.level]}
      </span>
    </motion.button>
  );
}
