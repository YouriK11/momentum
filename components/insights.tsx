"use client";

import { motion } from "framer-motion";

export type Insight = {
  icon: string;
  title: string;
  body: string;
  color: string;
};

const DOW_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

// ── Server-side helpers (called in page.tsx) ──────────────────────────────────

type Log  = { habit_id: string; log_date: string };
type Score = { score_date: string; score: number };
type HabitMini = { id: string; name: string; icon: string | null };

export function computeInsights(opts: {
  habits:     HabitMini[];
  recentLogs: Log[];
  scores14:   Score[];
  streak:     number;
}): Insight[] {
  const { habits, recentLogs, scores14, streak } = opts;
  const insights: Insight[] = [];

  // ── 1. Meilleure habitude (plus complétée sur 7 jours) ───────────────────
  if (habits.length > 0 && recentLogs.length > 0) {
    const counts: Record<string, number> = {};
    for (const l of recentLogs) counts[l.habit_id] = (counts[l.habit_id] ?? 0) + 1;
    const [bestId, bestCount] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0] ?? [];
    const best = habits.find((h) => h.id === bestId);
    if (best && bestCount > 0) {
      insights.push({
        icon: best.icon ?? "🏆",
        title: "Ta meilleure habitude",
        body: `${best.name} — cochée ${bestCount} fois cette semaine.`,
        color: "#ffc24b",
      });
    }
  }

  // ── 2. Meilleur jour de la semaine ──────────────────────────────────────
  if (scores14.length >= 5) {
    const byDow: Record<number, number[]> = {};
    for (const s of scores14) {
      if (s.score === 0) continue;
      const d = new Date(s.score_date + "T00:00:00").getDay();
      (byDow[d] ??= []).push(s.score);
    }
    const bestDowEntry = Object.entries(byDow)
      .map(([d, arr]) => ({ d: Number(d), avg: arr.reduce((a, b) => a + b, 0) / arr.length }))
      .sort((a, b) => b.avg - a.avg)[0];
    if (bestDowEntry) {
      insights.push({
        icon: "📅",
        title: "Meilleur jour",
        body: `Tu es le plus actif le ${DOW_FR[bestDowEntry.d]} (score moyen ${Math.round(bestDowEntry.avg)}/100).`,
        color: "#37c97e",
      });
    }
  }

  // ── 3. Motivation / série ────────────────────────────────────────────────
  if (streak >= 7) {
    insights.push({
      icon: "🔥",
      title: "Série impressionnante",
      body: `${streak} jours consécutifs — tu es dans une vraie dynamique.`,
      color: "#fc5200",
    });
  } else if (streak >= 3) {
    insights.push({
      icon: "⚡",
      title: "Série en cours",
      body: `${streak} jours de suite — continue sur ta lancée !`,
      color: "#fc5200",
    });
  } else if (streak === 0 && scores14.some((s) => s.score > 0)) {
    insights.push({
      icon: "💡",
      title: "Relancer la machine",
      body: "Tu as été actif récemment — une bonne journée aujourd'hui repart une série.",
      color: "#8e8e9a",
    });
  }

  return insights.slice(0, 3);
}

// ── InsightCards component ────────────────────────────────────────────────────
export function InsightCards({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Insights</p>
      <div className="flex flex-col gap-2.5">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="card flex items-start gap-4 p-4"
            style={{
              backgroundImage: `linear-gradient(135deg, ${ins.color}08 0%, transparent 60%)`,
              borderLeft: `3px solid ${ins.color}40`,
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-lg"
              style={{ background: ins.color + "18" }}
            >
              {ins.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-snug" style={{ color: ins.color }}>
                {ins.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{ins.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
