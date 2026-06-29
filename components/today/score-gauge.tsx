"use client";

import { useEffect, useRef, useState } from "react";

function colorFor(score: number) {
  if (score >= 80) return { ring: "#8faa7e", text: "text-[#8faa7e]", label: "Belle journée" };
  if (score >= 50) return { ring: "#c4a882", text: "text-[#c4a882]", label: "Bonne avancée" };
  return { ring: "#cf8b88", text: "text-[#cf8b88]", label: "À relancer" };
}

export function ScoreGauge({ score }: { score: number }) {
  const [shown, setShown] = useState(0);
  const raf = useRef<number | null>(null);

  // count-up animé vers la valeur cible
  useEffect(() => {
    const start = shown;
    const t0 = performance.now();
    const dur = 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out
      setShown(Math.round(start + (score - start) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const r = 84;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - shown / 100);
  const col = colorFor(shown);

  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#27272a" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke={col.ring} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-6xl font-bold tabular-nums ${col.text}`}>{shown}</span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          score du jour
        </span>
        <span className={`mt-1 text-sm font-medium ${col.text}`}>{col.label}</span>
      </div>
    </div>
  );
}