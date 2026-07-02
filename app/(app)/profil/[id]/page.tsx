import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { getActivityEvents } from "@/lib/data/social";
import { getScoresFrom } from "@/lib/data/scores";
import { daysAgoBrussels } from "@/lib/date";
import { Avatar } from "@/components/profile/avatar";
import { ActivityTimeline } from "@/components/social/activity-timeline";
import { ProfileHeatmap } from "@/components/profile/profile-heatmap";
import type { Badge } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await getProfile(supabase, id);
  return { title: profile?.username ?? "Profil" };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (id === user.id) redirect("/profil");

  const [{ data: profile }, { data: badgeRows }, events, { data: scoreRows }] = await Promise.all([
    getProfile(supabase, id),
    supabase.from("user_badges").select("badge:badges(code,name,description,icon)").eq("user_id", id),
    getActivityEvents(supabase, id, 20),
    getScoresFrom(supabase, id, daysAgoBrussels(364)),
  ]);

  if (!profile) notFound();

  const badges = (badgeRows ?? []).map((r) => (r as unknown as { badge: Badge }).badge).filter(Boolean);
  const scores = (scoreRows ?? []).map((r) => ({ score_date: r.score_date, score: r.score ?? 0 }));

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

      {/* ── Hero card ──────────────────────────────────────────────────── */}
      <div
        className="card relative flex flex-col gap-4 overflow-hidden p-6"
        style={{ backgroundImage: "linear-gradient(160deg, rgba(203,139,106,0.05) 0%, transparent 55%)" }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(203,139,106,0.25), transparent)" }}
        />

        <div className="flex items-center gap-4">
          <Avatar url={profile.avatar_url ?? null} name={profile.username} size={56} />
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

      {/* ── Heatmap ────────────────────────────────────────────────────── */}
      <section className="card flex flex-col gap-4 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Activité sur 52 semaines
        </p>
        <ProfileHeatmap days={scores} />
      </section>

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
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(196,168,130,0.28), transparent)" }} />
                {b.icon
                  ? <span className="text-3xl">{b.icon}</span>
                  : <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ background: "rgba(196,168,130,0.1)" }}><Award size={20} style={{ color: "#c4a882" }} /></div>
                }
                <p className="mt-3 text-[14px] font-semibold leading-tight">{b.name}</p>
                {b.description && (
                  <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--color-muted)" }}>{b.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Progrès récents ────────────────────────────────────────────── */}
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
