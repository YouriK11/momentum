"use client";

import { useEffect, useRef } from "react";
import { motion, animate, useInView } from "framer-motion";
import { CalendarDays, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Animated counter — triggers once when parent says so ──────────────────────
function AnimatedNumber({ to, trigger, delay = 0 }: { to: number; trigger: boolean; delay?: number }) {
  const ref     = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!trigger || started.current) return;
    started.current = true;
    const el = ref.current;
    if (!el) return;
    const ctrl = animate(0, to, {
      duration: 1.15,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { if (el) el.textContent = String(Math.round(v)); },
    });
    return ctrl.stop;
  }, [trigger, to, delay]);

  return <span ref={ref}>0</span>;
}

// ── Main ───────────────────────────────────────────────────────────────────────
export function WeekStats({
  activeDays, scoreAvg, bestStreak, delta,
}: {
  activeDays: number;
  scoreAvg: number;
  bestStreak: number;
  delta: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-40px" });

  const isUp      = delta !== null && delta > 0;
  const isDown    = delta !== null && delta < 0;
  const deltaColor = isUp ? "#37c97e" : isDown ? "#ec6480" : "#8e8e9a";
  const DeltaIcon  = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  const hasData = scoreAvg > 0 || delta !== null;
  const zone    = !hasData ? "rgba(142,142,154,0.4)" : scoreAvg >= 80 ? "#37c97e" : scoreAvg >= 50 ? "#ffc24b" : "#ec6480";

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Cette semaine</p>

      {/* ── Hero — Score moyen ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="card relative overflow-hidden p-6"
        style={{
          backgroundImage: `
            linear-gradient(135deg, ${zone}0d 0%, transparent 55%),
            linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 65%)
          `,
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${zone}55, transparent)` }}
        />

        <div className="flex items-end justify-between gap-3">
          {/* Big number */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Score moyen</p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span
                className="font-display font-black leading-none tabular-nums"
                style={{ fontSize: "clamp(52px, 6vw, 72px)", color: zone, transition: "color 0.4s ease" }}
              >
                <AnimatedNumber to={scoreAvg} trigger={inView} delay={0.12} />
              </span>
              <span className="font-display text-xl font-bold text-muted">/100</span>
            </div>
          </div>

          {/* Delta pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.28, type: "spring", stiffness: 300, damping: 24 }}
            className="flex shrink-0 items-center gap-1.5 rounded-[10px] px-2.5 py-1.5"
            style={{ background: deltaColor + "16", border: `1px solid ${deltaColor}2a` }}
          >
            <DeltaIcon size={13} style={{ color: deltaColor }} />
            <span className="font-display text-sm font-bold tabular-nums" style={{ color: deltaColor }}>
              {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}
            </span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-[3px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: "0%" }}
            animate={inView ? { width: `${scoreAvg}%` } : {}}
            transition={{ delay: 0.22, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: `linear-gradient(90deg, ${zone}bb, ${zone})`,
              boxShadow: `0 0 10px ${zone}70`,
              transition: "background 0.4s ease, box-shadow 0.4s ease",
            }}
          />
        </div>
        <p className="mt-2 text-[10px] text-muted">
          {delta === null
            ? "Commence à tracker pour voir ta progression"
            : isUp
            ? `Tu progresses — en route vers un nouveau record.`
            : isDown
            ? `Un peu en retrait — tu vas remonter.`
            : "Rythme stable par rapport à la semaine passée."}
        </p>
      </motion.div>

      {/* ── Supporting stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat
          icon={<CalendarDays size={14} />}
          value={activeDays}
          suffix="j"
          label="Jours actifs"
          color="#fc5200"
          trigger={inView}
          delay={0.18}
        />
        <MiniStat
          icon={<Zap size={14} />}
          value={bestStreak}
          suffix="j"
          label="Série record"
          color="#37c97e"
          trigger={inView}
          delay={0.24}
        />
        {/* Delta as 3rd tile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="card flex flex-col gap-3 p-5"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-[8px]"
            style={{ background: deltaColor + "1e", color: deltaColor }}
          >
            <DeltaIcon size={14} />
          </span>
          <div>
            <p className="font-display text-3xl font-black leading-none tabular-nums" style={{ color: deltaColor }}>
              {delta === null ? "—" : `${isUp ? "+" : ""}${delta}%`}
            </p>
            <p className="mt-1.5 text-[11px] leading-tight text-muted">vs sem. préc.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── MiniStat ──────────────────────────────────────────────────────────────────
function MiniStat({ icon, value, suffix, label, color, trigger, delay }: {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  color: string;
  trigger: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={trigger ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="card flex flex-col gap-3 p-5"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-[8px]"
        style={{ background: color + "1e", color }}
      >
        {icon}
      </span>
      <div>
        <p className="font-display text-3xl font-black leading-none tabular-nums">
          <AnimatedNumber to={value} trigger={trigger} delay={delay + 0.12} />
          <span className="text-[13px] font-semibold text-muted">{suffix}</span>
        </p>
        <p className="mt-1.5 text-[11px] leading-tight text-muted">{label}</p>
      </div>
    </motion.div>
  );
}
