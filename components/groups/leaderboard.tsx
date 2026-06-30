"use client";

import { useState } from "react";
import Link from "next/link";

type Row = { userId: string; username: string; streak: number; today: number; weekAvg: number };
type Ranked = Row & { rank: number; value: number };

const bandColor = (s: number) =>
  s >= 80 ? "var(--color-success)" : s >= 50 ? "var(--color-warning)" : "var(--color-danger)";
const medal = (r: number) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `${r}`);

export function Leaderboard({ rows, meId }: { rows: Row[]; meId: string }) {
  const [mode, setMode] = useState<"today" | "week">("today");

  const ranked: Ranked[] = [...rows]
    .map((r) => ({ ...r, value: mode === "today" ? r.today : r.weekAvg }))
    .sort((a, b) => b.value - a.value || b.streak - a.streak)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) as Ranked[];
  const podiumHeight: Record<number, number> = { 1: 112, 2: 96, 3: 80 };

  return (
    <div className="flex flex-col gap-8">

      {/* Mode toggle */}
      <div
        className="mx-auto grid w-full max-w-xs grid-cols-2 gap-1 rounded-full p-1 text-sm"
        role="group"
        aria-label="Période du classement"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        {(["today", "week"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={active}
              className="rounded-full py-1.5 font-medium transition-colors duration-150"
              style={{
                background: active ? "var(--color-primary)" : "transparent",
                color: active ? "#ffffff" : "var(--color-muted)",
              }}
            >
              {m === "today" ? "Aujourd'hui" : "7 jours"}
            </button>
          );
        })}
      </div>

      {/* Podium */}
      {podiumOrder.length > 0 && (
        <div className="flex items-end justify-center gap-3">
          {podiumOrder.map((r) => (
            <div key={r.userId} className="flex flex-1 flex-col items-center">
              <div className="mb-2 text-2xl" aria-hidden="true">{medal(r.rank)}</div>
              <Link
                href={`/profil/${r.userId}`}
                className="mb-1 max-w-full truncate text-sm font-medium hover:underline underline-offset-2"
                style={{ color: r.userId === meId ? "var(--color-primary)" : "var(--color-foreground)" }}
                aria-label={`Voir le profil de ${r.username}`}
              >
                {r.username}
              </Link>
              <div
                className="flex w-full items-start justify-center rounded-t-xl pt-2"
                style={{
                  height: podiumHeight[r.rank],
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderBottom: "none",
                }}
              >
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{ color: bandColor(r.value) }}
                >
                  {r.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List (rank 4+) */}
      <div className="flex flex-col gap-2">
        {rest.map((r) => (
          <Link
            key={r.userId}
            href={`/profil/${r.userId}`}
            className="flex items-center gap-3 rounded-xl border p-3 transition-opacity hover:opacity-80"
            style={{
              background: r.userId === meId ? "rgba(203,139,106,0.05)" : "var(--color-surface-2)",
              borderColor: r.userId === meId ? "rgba(203,139,106,0.3)" : "var(--color-border)",
            }}
            aria-label={`Voir le profil de ${r.username}`}
          >
            <span className="w-6 text-center text-sm text-muted">{r.rank}</span>
            <span className="flex-1 truncate font-medium">
              {r.username}
              {r.userId === meId && (
                <span className="ml-2 text-xs" style={{ color: "var(--color-primary)" }}>toi</span>
              )}
            </span>
            <span className="text-xs text-muted" aria-label={`Série ${r.streak} jours`}>🔥 {r.streak}</span>
            <span
              className="w-10 text-right text-sm font-semibold tabular-nums"
              style={{ color: bandColor(r.value) }}
            >
              {r.value}
            </span>
          </Link>
        ))}
      </div>

      {ranked.length === 0 && (
        <p className="text-center text-sm text-muted">
          Personne n&apos;a encore de score — à toi de lancer la machine.
        </p>
      )}
    </div>
  );
}
