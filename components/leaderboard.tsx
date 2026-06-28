"use client";

import { useState } from "react";

type Row = { userId: string; username: string; streak: number; today: number; weekAvg: number };
type Ranked = Row & { rank: number; value: number };

const band = (s: number) =>
  s >= 80 ? "text-emerald-400" : s >= 50 ? "text-orange-400" : "text-red-400";
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
  const podiumHeight: Record<number, string> = { 1: "h-28", 2: "h-24", 3: "h-20" };

  return (
    <div className="space-y-8">
      <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-1 rounded-full border border-neutral-800 bg-neutral-900 p-1 text-sm">
        {(["today", "week"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full py-1.5 transition ${
              mode === m ? "bg-orange-600 text-white" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {m === "today" ? "Aujourd'hui" : "7 jours"}
          </button>
        ))}
      </div>

      {podiumOrder.length > 0 && (
        <div className="flex items-end justify-center gap-3">
          {podiumOrder.map((r) => (
            <div key={r.userId} className="flex flex-1 flex-col items-center">
              <div className="mb-2 text-2xl">{medal(r.rank)}</div>
              <p className={`mb-1 max-w-full truncate text-sm font-medium ${r.userId === meId ? "text-orange-300" : ""}`}>
                {r.username}
              </p>
              <div className={`flex w-full ${podiumHeight[r.rank]} items-start justify-center rounded-t-xl border border-b-0 border-neutral-800 bg-neutral-900 pt-2`}>
                <span className={`text-xl font-bold tabular-nums ${band(r.value)}`}>{r.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {rest.map((r) => (
          <div
            key={r.userId}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              r.userId === meId ? "border-orange-500/40 bg-orange-500/5" : "border-neutral-800 bg-neutral-900"
            }`}
          >
            <span className="w-6 text-center text-sm text-neutral-500">{r.rank}</span>
            <span className="flex-1 truncate font-medium">
              {r.username}
              {r.userId === meId && <span className="ml-2 text-xs text-orange-400">toi</span>}
            </span>
            <span className="text-xs text-neutral-500">🔥 {r.streak}</span>
            <span className={`w-10 text-right font-semibold tabular-nums ${band(r.value)}`}>{r.value}</span>
          </div>
        ))}
      </div>

      {ranked.length === 0 && (
        <p className="text-center text-sm text-neutral-500">
          Personne n'a encore de score — à toi de lancer la machine.
        </p>
      )}
    </div>
  );
}