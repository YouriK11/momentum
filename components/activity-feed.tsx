"use client";

import { motion } from "framer-motion";

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];

function scoreLabel(score: number) {
  if (score >= 100) return "Journée parfaite";
  if (score >= 80)  return "Belle journée";
  if (score >= 50)  return "Bonne journée";
  if (score > 0)    return "Journée tranquille";
  return "Jour de repos";
}

function scoreAccent(score: number): string {
  if (score >= 80) return "#37c97e";
  if (score >= 50) return "#ffc24b";
  if (score > 0)   return "#fc5200";
  return "#8e8e9a";
}

type Day = { score_date: string; score: number; completed: number; planned: number };

// ── Main ───────────────────────────────────────────────────────────────────────
export function ActivityFeed({ days }: { days: Day[] }) {
  if (days.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Activité récente</p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-[20px] border border-dashed p-8 text-center"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-sm font-medium text-muted">Tes journées validées apparaîtront ici.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Activité récente</p>

      <div
        className="overflow-hidden rounded-[20px]"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {days.map((d, i) => {
          const dt      = new Date(d.score_date);
          const accent  = scoreAccent(d.score);
          const pct     = d.planned > 0 ? Math.round((d.completed / d.planned) * 100) : 0;
          const perfect = d.score >= 100;
          const isLast  = i === days.length - 1;

          return (
            <motion.div
              key={d.score_date}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-12px" }}
              transition={{ delay: i * 0.055, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 px-5 py-4"
              style={{
                background: perfect
                  ? "linear-gradient(90deg, rgba(255,194,75,0.04) 0%, transparent 60%)"
                  : "transparent",
                borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.055)",
              }}
            >
              {/* Date badge */}
              <div
                className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[13px]"
                style={{
                  background: perfect ? "rgba(255,194,75,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${perfect ? "rgba(255,194,75,0.25)" : "rgba(255,255,255,0.07)"}`,
                }}
              >
                <span
                  className="font-display text-[18px] font-extrabold leading-none"
                  style={{ color: perfect ? "#ffc24b" : "var(--color-foreground)" }}
                >
                  {dt.getDate()}
                </span>
                <span
                  className="text-[8px] font-bold uppercase tracking-wide"
                  style={{ color: perfect ? "rgba(255,194,75,0.7)" : "var(--color-muted)" }}
                >
                  {MONTHS[dt.getMonth()]}
                </span>
              </div>

              {/* Middle: label + bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold leading-snug">{scoreLabel(d.score)}</p>
                  {perfect && (
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.055 + 0.2, type: "spring", stiffness: 400, damping: 18 }}
                      className="rounded-[6px] px-1.5 py-0.5 text-[9px] font-black tracking-wide"
                      style={{ background: "rgba(255,194,75,0.18)", color: "#ffc24b" }}
                    >
                      PARFAIT
                    </motion.span>
                  )}
                </div>

                {/* Animated progress bar */}
                <div
                  className="mt-2 h-[3px] overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.055 + 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      height: "100%",
                      borderRadius: "9999px",
                      background: accent,
                      boxShadow: `0 0 6px ${accent}80`,
                    }}
                  />
                </div>

                <p className="mt-1.5 text-[11px] text-muted">
                  {d.completed} / {d.planned} habitudes
                </p>
              </div>

              {/* Score */}
              <div className="shrink-0 text-right">
                <span
                  className="font-display text-2xl font-black tabular-nums leading-none"
                  style={{ color: accent }}
                >
                  {d.score}
                </span>
                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">pts</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
