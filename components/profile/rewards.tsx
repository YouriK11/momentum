import type { Badge } from "@/lib/types";

export function Rewards({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Récompenses</p>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((b) => (
          <div
            key={b.code}
            className="card relative overflow-hidden p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, rgba(255,194,75,0.07) 0%, transparent 60%)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,194,75,0.3), transparent)" }}
            />
            <span className="text-3xl">{b.icon ?? "🏅"}</span>
            <p className="mt-2.5 text-[15px] font-semibold leading-tight">{b.name}</p>
            {b.description && (
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{b.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
