import type { Badge } from "@/lib/types";

export function ProfileView({
  username, streak, bestStreak, badges, children,
}: {
  username: string;
  streak: number;
  bestStreak: number;
  badges: Badge[];
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Compte
        </p>
        <h1
          className="mt-1 font-display font-black tracking-tight"
          style={{ fontSize: "clamp(32px, 3.5vw, 48px)", letterSpacing: "-0.03em" }}
        >
          Mon profil
        </h1>
      </header>

      {/* ── Hero: avatar + stats ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

        {/* Avatar card */}
        <div
          className="card relative flex flex-col items-center gap-5 overflow-hidden p-8"
          style={{
            backgroundImage: "linear-gradient(160deg, rgba(252,82,0,0.06) 0%, transparent 55%)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(252,82,0,0.4), transparent)" }}
          />
          <div className="relative">
            {children}
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.025em" }}>
              {username}
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: "var(--color-muted)" }}>
              Membre Momentum
            </p>
          </div>

          {/* Compact inline stats for mobile */}
          <div
            className="flex w-full items-center justify-around rounded-[14px] py-3 lg:hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <CompactStat label="Série" value={streak} suffix="j" color="#fc5200" />
            <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <CompactStat label="Record" value={bestStreak} suffix="j" color="#ffc24b" />
            <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <CompactStat label="Badges" value={badges.length} suffix="" color="#37c97e" />
          </div>
        </div>

        {/* Stats grid — desktop */}
        <div className="hidden grid-cols-2 gap-5 content-start lg:grid">
          <StatCard
            label="Série actuelle"
            value={streak}
            suffix="j"
            color="#fc5200"
            description="Jours consécutifs d'activité"
          />
          <StatCard
            label="Record personnel"
            value={bestStreak}
            suffix="j"
            color="#ffc24b"
            description="Ta meilleure série all-time"
          />
          <StatCard
            label="Badges obtenus"
            value={badges.length}
            suffix=""
            color="#37c97e"
            description="Trophées débloqués"
          />
          <div
            className="card flex flex-col gap-3 p-6"
            style={{
              backgroundImage: "linear-gradient(135deg, rgba(138,138,152,0.05) 0%, transparent 60%)",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
              Statut
            </p>
            <div>
              <p
                className="font-display text-4xl font-black"
                style={{ color: "var(--color-foreground)" }}
              >
                Actif
              </p>
              <p className="mt-1 text-[13px]" style={{ color: "var(--color-muted)" }}>
                En progression constante
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Badges / Trophées ─────────────────────────────────────────── */}
      {badges.length > 0 && (
        <section className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Trophées
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.code}
                className="card relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundImage: "linear-gradient(135deg, rgba(255,194,75,0.07) 0%, transparent 60%)",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,194,75,0.35), transparent)" }}
                />
                <span className="text-3xl">{b.icon ?? "🏅"}</span>
                <p className="mt-3 text-[14px] font-semibold leading-tight">{b.name}</p>
                {b.description && (
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {b.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {badges.length === 0 && (
        <section className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Trophées
          </p>
          <div
            className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed p-12 text-center"
            style={{ borderColor: "rgba(255,255,255,0.09)" }}
          >
            <span className="text-4xl">🏅</span>
            <div>
              <p className="font-semibold">Aucun badge pour l&apos;instant</p>
              <p className="mt-1 text-[14px]" style={{ color: "var(--color-muted)" }}>
                Continue à tracker tes habitudes pour débloquer des récompenses.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix, color, description }: {
  label: string;
  value: number;
  suffix: string;
  color: string;
  description: string;
}) {
  return (
    <div
      className="card flex flex-col gap-3 p-6"
      style={{
        backgroundImage: `linear-gradient(135deg, ${color}09 0%, transparent 60%)`,
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>
      <div>
        <p className="font-display text-4xl font-black tabular-nums leading-none" style={{ color }}>
          {value}
          {suffix && (
            <span className="ml-1 text-xl font-semibold" style={{ color: "var(--color-muted)" }}>
              {suffix}
            </span>
          )}
        </p>
        <p className="mt-2 text-[13px]" style={{ color: "var(--color-muted)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ── CompactStat (mobile) ──────────────────────────────────────────────────────
function CompactStat({ label, value, suffix, color }: {
  label: string; value: number; suffix: string; color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4">
      <p className="font-display text-xl font-black tabular-nums" style={{ color }}>
        {value}{suffix}
      </p>
      <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{label}</p>
    </div>
  );
}
