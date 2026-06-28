"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ScoreGauge } from "@/components/score-gauge";
import { WeeklyTrend } from "@/components/weekly-trend";
import { signout } from "@/app/auth/actions";
import type { Habit, DayScore, Badge } from "@/lib/types";

const levelStyle: Record<Habit["level"], string> = {
  facile: "bg-emerald-500/15 text-emerald-300",
  moyen: "bg-orange-500/15 text-orange-300",
  difficile: "bg-rose-500/15 text-rose-300",
};

type Props = {
  userId: string;
  username: string;
  streak: number;
  bestStreak: number;
  habits: Habit[];
  initialDone: string[];
  today: string;
  week: DayScore[];
  badges: Badge[];
};

export function HabitTracker({
  userId, username, streak, bestStreak, habits, initialDone, today, week, badges,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [done, setDone] = useState<Set<string>>(new Set(initialDone));
  const [saving, setSaving] = useState<string | null>(null);
  const fired = useRef(false);

  // Score calculé en live (même formule que la fonction SQL)
  const totalWeight = habits.reduce((s, h) => s + Number(h.weight), 0);
  const earnedWeight = habits
    .filter((h) => done.has(h.id))
    .reduce((s, h) => s + Number(h.weight), 0);
  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  // Confettis au moment où on atteint 100
  useEffect(() => {
    if (score === 100 && !fired.current) {
      fired.current = true;
      confetti({
        particleCount: 140, spread: 80, origin: { y: 0.3 },
        colors: ["#fb923c", "#34d399", "#fbbf24"],
      });
    }
    if (score < 100) fired.current = false;
  }, [score]);

  async function toggle(habit: Habit) {
    const next = new Set(done);
    const wasDone = next.has(habit.id);
    wasDone ? next.delete(habit.id) : next.add(habit.id);
    setDone(next); // mise à jour optimiste : l'UI réagit instantanément
    setSaving(habit.id);

    if (wasDone) {
      await supabase.from("habit_logs").delete()
        .eq("habit_id", habit.id).eq("user_id", userId).eq("log_date", today);
    } else {
      await supabase.from("habit_logs").upsert(
        { habit_id: habit.id, user_id: userId, log_date: today, status: true },
        { onConflict: "habit_id,user_id,log_date" }
      );
    }
    setSaving(null);
  }

  // 7 derniers jours, avec le jour courant recalculé en live
  const weekData = useMemo(() => {
    const map = new Map(week.map((d) => [d.score_date, d.score]));
    map.set(today, score);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10);
      return { date: d, score: map.get(d) ?? 0 };
    });
  }, [week, today, score]);

  const persos = habits.filter((h) => h.scope === "perso");
  const commons = habits.filter((h) => h.scope === "commune");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-10">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">Salut</p>
            <h1 className="text-2xl font-semibold">{username}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500/15 px-3 py-1.5 text-sm font-medium text-orange-300">
              🔥 {streak} j
            </div>
            <Link href="/habits" className="text-sm text-neutral-400 hover:text-neutral-100">
              Gérer
            </Link>
            <form action={signout}>
              <button className="text-sm text-neutral-500 hover:text-neutral-300">
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <section className="mb-10 flex flex-col items-center">
          <ScoreGauge score={score} />
          <p className="mt-3 text-sm text-neutral-500">
            {done.size}/{habits.length} habitudes · record {bestStreak} j
          </p>
        </section>

        <section className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="mb-4 text-sm font-medium text-neutral-400">7 derniers jours</h2>
          <WeeklyTrend data={weekData} />
        </section>

        {badges.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-medium text-neutral-400">Tes trophées</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.code}
                  title={b.description ?? ""}
                  className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm"
                >
                  <span className="text-base">{b.icon}</span>
                  <span className="text-neutral-200">{b.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {persos.length > 0 && (
          <HabitList title="Mes habitudes" habits={persos} done={done} saving={saving} onToggle={toggle} />
        )}
        {commons.length > 0 && (
          <HabitList title="Habitudes du groupe" habits={commons} done={done} saving={saving} onToggle={toggle} />
        )}

        {habits.length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
            Aucune habitude pour l'instant — ajoute-en via le script SQL de test,
            le formulaire de création arrive à l'étape suivante.
          </p>
        )}
      </div>
    </main>
  );
}

function HabitList({
  title, habits, done, saving, onToggle,
}: {
  title: string;
  habits: Habit[];
  done: Set<string>;
  saving: string | null;
  onToggle: (h: Habit) => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium text-neutral-400">{title}</h2>
      <div className="space-y-2">
        {habits.map((h) => {
          const checked = done.has(h.id);
          return (
            <motion.button
              key={h.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(h)}
              disabled={saving === h.id}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                checked
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${
                  checked
                    ? "border-emerald-400 bg-emerald-400 text-neutral-950"
                    : "border-neutral-600"
                }`}
              >
                {checked && "✓"}
              </span>
              <span className="text-xl">{h.icon ?? "🎯"}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium">{h.name}</span>
                {h.description && (
                  <span className="block truncate text-xs text-neutral-500">{h.description}</span>
                )}
              </span>
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${levelStyle[h.level]}`}>
                {h.level} · {Number(h.weight)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}