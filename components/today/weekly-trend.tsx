"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const barColor = (s: number) => (s >= 80 ? "#34d399" : s >= 50 ? "#fb923c" : "#f87171");

export function WeeklyTrend({ data }: { data: { date: string; score: number }[] }) {
  const chart = data.map((d) => ({ ...d, label: days[new Date(d.date).getDay()] }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chart} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label" tickLine={false} axisLine={false}
          tick={{ fill: "#737373", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{ background: "#171717", border: "1px solid #404040", borderRadius: 8 }}
          labelStyle={{ color: "#a3a3a3" }}
          formatter={(v: any) => [`${v ?? 0}/100`, "Score"]}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={36}>
          {chart.map((d, i) => <Cell key={i} fill={barColor(d.score)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}