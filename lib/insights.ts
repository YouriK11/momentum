export type Insight = {
  icon: string;
  title: string;
  body: string;
  color: string;
};

type Log      = { habit_id: string; log_date: string };
type Score    = { score_date: string; score: number };
type HabitMini = { id: string; name: string; icon: string | null };

const DOW_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function computeInsights(opts: {
  habits:     HabitMini[];
  recentLogs: Log[];
  scores14:   Score[];
  streak:     number;
}): Insight[] {
  const { habits, recentLogs, scores14, streak } = opts;
  const insights: Insight[] = [];

  if (habits.length > 0 && recentLogs.length > 0) {
    const counts: Record<string, number> = {};
    for (const l of recentLogs) counts[l.habit_id] = (counts[l.habit_id] ?? 0) + 1;
    const [bestId, bestCount] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0] ?? [];
    const best = habits.find((h) => h.id === bestId);
    if (best && bestCount > 0) {
      insights.push({
        icon:  best.icon ?? "🏆",
        title: "Ta meilleure habitude",
        body:  `${best.name} — cochée ${bestCount} fois cette semaine.`,
        color: "#ffc24b",
      });
    }
  }

  if (scores14.length >= 5) {
    const byDow: Record<number, number[]> = {};
    for (const s of scores14) {
      if (s.score === 0) continue;
      const d = new Date(s.score_date + "T00:00:00").getDay();
      (byDow[d] ??= []).push(s.score);
    }
    const best = Object.entries(byDow)
      .map(([d, arr]) => ({ d: Number(d), avg: arr.reduce((a, b) => a + b, 0) / arr.length }))
      .sort((a, b) => b.avg - a.avg)[0];
    if (best) {
      insights.push({
        icon:  "📅",
        title: "Meilleur jour",
        body:  `Tu es le plus actif le ${DOW_FR[best.d]} (score moyen ${Math.round(best.avg)}/100).`,
        color: "#37c97e",
      });
    }
  }

  if (streak >= 7) {
    insights.push({ icon: "🔥", title: "Série impressionnante", body: `${streak} jours consécutifs — tu es dans une vraie dynamique.`, color: "#fc5200" });
  } else if (streak >= 3) {
    insights.push({ icon: "⚡", title: "Série en cours", body: `${streak} jours de suite — continue sur ta lancée !`, color: "#fc5200" });
  } else if (streak === 0 && scores14.some((s) => s.score > 0)) {
    insights.push({ icon: "💡", title: "Relancer la machine", body: "Tu as été actif récemment — une bonne journée aujourd'hui repart une série.", color: "#8e8e9a" });
  }

  return insights.slice(0, 3);
}
