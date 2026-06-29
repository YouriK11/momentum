"use client";

import { motion } from "framer-motion";
import type { Insight } from "@/lib/insights";

export type { Insight };

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
