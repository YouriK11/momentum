// Server component — no "use client" needed
import { todayBrussels } from "@/lib/date";

type ScoreDay = { score_date: string; score: number };
type Cell     = { dateStr: string; score: number; isFuture: boolean };

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const DAYS_FR   = ["L","M","M","J","V","S","D"];

function scoreColor(score: number): string {
  if (score === 0)   return "rgba(255,255,255,0.05)";
  if (score < 30)    return "rgba(143,170,126,0.18)";
  if (score < 55)    return "rgba(143,170,126,0.38)";
  if (score < 80)    return "rgba(143,170,126,0.62)";
  if (score < 100)   return "rgba(143,170,126,0.84)";
  return "#8faa7e";
}

export function ProfileHeatmap({ days }: { days: ScoreDay[] }) {
  const scoreMap = new Map(days.map((d) => [d.score_date, d.score]));
  const today    = todayBrussels();

  const [ty, tm, td] = today.split("-").map(Number);
  const todayUTC  = new Date(Date.UTC(ty, tm - 1, td));
  const todayDow  = todayUTC.getDay(); // 0=Sun…6=Sat

  // Align grid: last column ends on Sunday of current week
  const daysToSunday = todayDow === 0 ? 0 : 7 - todayDow;
  const gridEnd = new Date(todayUTC);
  gridEnd.setDate(todayUTC.getDate() + daysToSunday);

  // 52 complete weeks (364 days)
  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridEnd.getDate() - 52 * 7 + 1);

  // Build weeks array (52 × 7 cells)
  const weeks: Cell[][] = [];
  const cursor = new Date(gridStart);

  for (let w = 0; w < 52; w++) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr  = cursor.toISOString().slice(0, 10);
      const isFuture = cursor > todayUTC;
      week.push({ dateStr, score: isFuture ? 0 : (scoreMap.get(dateStr) ?? 0), isFuture });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month label: mark the first column of each new month
  const monthLabels: (string | null)[] = weeks.map((week, wi) => {
    const m = new Date(week[0].dateStr).getMonth();
    if (wi === 0) return MONTHS_FR[m];
    const prevM = new Date(weeks[wi - 1][0].dateStr).getMonth();
    return m !== prevM ? MONTHS_FR[m] : null;
  });

  const totalDays    = days.filter((d) => d.score > 0).length;
  const perfectDays  = days.filter((d) => d.score === 100).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <div style={{ display: "flex", gap: 4, minWidth: "fit-content", alignItems: "flex-start" }}>

          {/* Day-of-week labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 16, marginRight: 2 }}>
            {DAYS_FR.map((label, i) => (
              <div
                key={i}
                style={{
                  height: 11,
                  width: 10,
                  fontSize: 8,
                  fontWeight: 600,
                  color: "var(--color-muted)",
                  display: "flex",
                  alignItems: "center",
                  opacity: i % 2 === 0 ? 1 : 0,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid + month labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Month labels row */}
            <div style={{ display: "flex", gap: 2 }}>
              {monthLabels.map((label, wi) => (
                <div key={wi} style={{ width: 11, fontSize: 8, fontWeight: 600, color: "var(--color-muted)", overflow: "visible", whiteSpace: "nowrap" }}>
                  {label ?? ""}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div style={{ display: "flex", gap: 2 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      title={!cell.isFuture ? `${cell.dateStr}${cell.score > 0 ? ` · ${cell.score} pts` : ""}` : undefined}
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: 2,
                        backgroundColor: cell.isFuture ? "transparent" : scoreColor(cell.score),
                        cursor: cell.score > 0 ? "default" : undefined,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: legend + stats */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted">
          {totalDays} jour{totalDays !== 1 ? "s" : ""} actif{totalDays !== 1 ? "s" : ""} · {perfectDays} parfait{perfectDays !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 9, color: "var(--color-muted)" }}>Moins</span>
          {([0, 25, 55, 80, 100] as const).map((s) => (
            <div key={s} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: scoreColor(s) }} />
          ))}
          <span style={{ fontSize: 9, color: "var(--color-muted)" }}>Plus</span>
        </div>
      </div>
    </div>
  );
}
