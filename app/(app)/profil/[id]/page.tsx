import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { getActivityEvents } from "@/lib/data/social";
import { ActivityTimeline } from "@/components/social/activity-timeline";
import type { Badge } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Can't view your own public profile — redirect to /profil
  if (id === user.id) redirect("/profil");

  const [{ data: profile }, { data: badgeRows }, events] = await Promise.all([
    getProfile(supabase, id),
    supabase.from("user_badges").select("badge:badges(code,name,description,icon)").eq("user_id", id),
    getActivityEvents(supabase, id, 20),
  ]);

  if (!profile) notFound();

  const badges = (badgeRows ?? []).map((r) => (r as unknown as { badge: Badge }).badge).filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Profil</p>
        <h1
          className="mt-1 font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "-0.03em" }}
        >
          {profile.username}
        </h1>
      </header>

      {/* ── Hero stats ─────────────────────────────────────────────────── */}
      <div
        className="card flex flex-col gap-4 p-6"
        style={{ backgroundImage: "linear-gradient(160deg, rgba(203,139,106,0.05) 0%, transparent 55%)" }}
      >
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(203,139,106,0.25), transparent)" }} />

        <div className="flex items-center gap-4">
          {/* Avatar initials */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] font-display text-xl font-semibold"
            style={{
              background: "rgba(203,139,106,0.15)",
              border: "1px solid rgba(203,139,106,0.2)",
              color: "var(--color-primary)",
            }}
          >
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{profile.username}</p>
            <p className="text-[13px]" style={{ color: "var(--color-muted)" }}>Membre Momentum</p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center justify-around rounded-[14px] py-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <MiniStat label="Série"  value={profile.current_streak} suffix="j" color="#cb8b6a" />
          <div className="h-8 w-px" style={{ background: "var(--color-border)" }} />
          <MiniStat label="Record" value={profile.best_streak}    suffix="j" color="#c4a882" />
          <div className="h-8 w-px" style={{ background: "var(--color-border)" }} />
          <MiniStat label="Badges" value={badges.length}           suffix=""  color="#8faa7e" />
        </div>
      </div>

      {/* ── Badges ─────────────────────────────────────────────────────── */}
      {badges.length > 0 && (
        <section className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Trophées</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.code}
                className="card relative overflow-hidden p-5"
                style={{ backgroundImage: "linear-gradient(135deg, rgba(196,168,130,0.06) 0%, transparent 60%)" }}
              >
                <span className="text-3xl">{b.icon ?? "🏅"}</span>
                <p className="mt-3 text-[14px] font-semibold leading-tight">{b.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Activity / Progrès récents ──────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Progrès récents
        </p>
        <ActivityTimeline
          events={events}
          currentUserId={user.id}
          profileUserId={id}
        />
      </section>
    </div>
  );
}

function MiniStat({ label, value, suffix, color }: { label: string; value: number; suffix: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4">
      <p className="font-display text-xl font-semibold tabular-nums" style={{ color }}>{value}{suffix}</p>
      <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{label}</p>
    </div>
  );
}
