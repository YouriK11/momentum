"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Crown, Users } from "lucide-react";
import { Avatar } from "@/components/profile/avatar";

// ── Types ──────────────────────────────────────────────────────────────────────
export type SegRow = { userId: string; username: string; avatarUrl: string | null; value: number };

// ── Top-3 styling ─────────────────────────────────────────────────────────────
const RANK_ACCENT  = ["#c4a882", "#a89e8d", "#cb8b6a"] as const;
const RANK_BG      = [
  "linear-gradient(135deg, rgba(196,168,130,0.07) 0%, transparent 65%)",
  "linear-gradient(135deg, rgba(168,158,141,0.05) 0%, transparent 65%)",
  "linear-gradient(135deg, rgba(203,139,106,0.05) 0%, transparent 65%)",
];
const RANK_BORDER  = [
  "rgba(196,168,130,0.18)",
  "rgba(168,158,141,0.1)",
  "rgba(203,139,106,0.12)",
];
const RANK_GLOW    = ["none", "none", "none"];

// ── Main ───────────────────────────────────────────────────────────────────────
export function GroupSegment({ name, groupId, rows, meId }: {
  name: string; groupId: string; rows: SegRow[]; meId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-40px" });

  const ranked = [...rows].sort((a, b) => b.value - a.value).slice(0, 5);
  const maxVal = ranked[0]?.value || 1;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Classement — {name}
        </p>
        <Link
          href={`/groupes/${groupId}`}
          className="text-xs font-semibold text-primary transition-opacity hover:opacity-70"
        >
          Voir tout →
        </Link>
      </div>

      {/* Leaderboard card */}
      <div className="card overflow-hidden">
        {ranked.map((r, i) => {
          const isMe    = r.userId === meId;
          const isTop3  = i < 3;
          const accent  = isTop3 ? RANK_ACCENT[i] : "var(--color-muted)";
          const barW    = maxVal > 0 ? Math.round((r.value / maxVal) * 100) : 0;
          const isLast  = i === ranked.length - 1;

          return (
            <motion.div
              key={r.userId}
              initial={{ opacity: 0, x: -14 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: i * 0.075,
                type: "spring",
                stiffness: 255,
                damping: 26,
              }}
              style={{
                backgroundImage: isTop3 ? RANK_BG[i] : undefined,
                backgroundColor: isMe ? "rgba(203,139,106,0.04)" : "transparent",
                borderBottom: isLast ? "none" : `1px solid var(--color-border)`,
                boxShadow: isTop3 ? RANK_GLOW[i] : "none",
              }}
            >
              <Link
                href={`/profil/${r.userId}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
              >
                {/* Rank indicator */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {i === 0 ? (
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Crown
                        size={18}
                        style={{ color: "#c4a882" }}
                      />
                    </motion.div>
                  ) : (
                    <span
                      className="font-display text-base font-semibold"
                      style={{ color: isTop3 ? RANK_ACCENT[i] : "var(--color-muted)" }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar url={r.avatarUrl} name={r.username} size={32} />
                  {i === 0 && (
                    <div
                      className="absolute -inset-[2px] rounded-full"
                      style={{ boxShadow: "0 0 0 1.5px rgba(196,168,130,0.35)", borderRadius: "50%" }}
                    />
                  )}
                </div>

                {/* Name + bar */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p
                      className="truncate text-[14px] font-semibold"
                      style={{ color: isTop3 ? "var(--color-foreground)" : "var(--color-muted)" }}
                    >
                      {r.username}
                    </p>
                    {isMe && (
                      <span
                        className="shrink-0 rounded-[5px] px-1 py-px text-[9px] font-medium"
                        style={{ background: "rgba(203,139,106,0.1)", color: "var(--color-primary)" }}
                      >
                        toi
                      </span>
                    )}
                  </div>

                  {/* Animated progress bar */}
                  <div
                    className="mt-1.5 h-[3px] overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={inView ? { width: `${barW}%` } : {}}
                      transition={{
                        delay: i * 0.075 + 0.3,
                        duration: 0.85,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        height: "100%",
                        borderRadius: "9999px",
                        background: isTop3
                          ? `linear-gradient(90deg, ${RANK_ACCENT[i]}aa, ${RANK_ACCENT[i]})`
                          : "var(--color-muted)",
                        boxShadow: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <span
                    className="font-display text-[17px] font-semibold tabular-nums"
                    style={{ color: isTop3 ? RANK_ACCENT[i] : "var(--color-muted)" }}
                  >
                    {r.value}
                  </span>
                  <span className="text-[9px] font-semibold text-muted">/100</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── EmptyGroup ────────────────────────────────────────────────────────────────
export function EmptyGroup() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">Classement</p>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/groupes"
          className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed p-8 text-center transition-colors hover:border-primary/30"
          style={{ borderColor: "rgba(255,255,255,0.09)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[14px]"
            style={{ background: "rgba(203,139,106,0.08)" }}
          >
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Pas encore de groupe</p>
            <p className="mt-1 text-[13px] text-muted">
              Crée ou rejoins un groupe pour te comparer à tes amis.
            </p>
          </div>
          <span className="text-[13px] font-semibold text-primary">Créer un groupe →</span>
        </Link>
      </motion.div>
    </div>
  );
}
