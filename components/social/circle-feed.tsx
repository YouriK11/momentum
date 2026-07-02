import Image from "next/image";
import Link from "next/link";
import { Trophy, Flame, Target, Star, Users } from "lucide-react";
import { prevDay } from "@/lib/date";
import type { ActivityEventType } from "@/lib/types";
import type { FeedEvent } from "@/lib/data/social";
import { ReactionBar } from "./reaction-bar";

// ── Event metadata ────────────────────────────────────────────────────────────
const EVENT_META: Record<
  ActivityEventType,
  { icon: React.ReactNode; color: string; bg: string; label: (p: Record<string, unknown>) => string }
> = {
  day_completed: {
    icon: <Star size={14} />,
    color: "var(--color-warning)",
    bg: "rgba(196,168,130,0.15)",
    label: (p) => `a bouclé sa journée — score ${p.score ?? "–"}`,
  },
  streak_milestone: {
    icon: <Flame size={14} />,
    color: "var(--color-primary)",
    bg: "rgba(203,139,106,0.15)",
    label: (p) => `est sur une série de ${p.streak} jours`,
  },
  goal_achieved: {
    icon: <Target size={14} />,
    color: "var(--color-success)",
    bg: "rgba(143,170,126,0.15)",
    label: (p) => `a atteint son objectif « ${p.goal_title ?? ""} »`,
  },
  badge_earned: {
    icon: <Trophy size={14} />,
    color: "var(--color-warning)",
    bg: "rgba(196,168,130,0.15)",
    label: (p) => `a obtenu le badge « ${p.badge_name ?? ""} »`,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function dayLabel(dateStr: string, today: string): string {
  if (dateStr === today) return "Aujourd'hui";
  if (dateStr === prevDay(today)) return "Hier";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
}

function groupByDay(events: FeedEvent[]): { date: string; events: FeedEvent[] }[] {
  const map = new Map<string, FeedEvent[]>();
  for (const e of events) {
    const list = map.get(e.occurred_on) ?? [];
    list.push(e);
    map.set(e.occurred_on, list);
  }
  return Array.from(map.entries()).map(([date, evs]) => ({ date, events: evs }));
}

// Avatar initials
function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      <Image
        src={url} alt={name}
        width={32} height={32}
        className="rounded-full object-cover"
        style={{ width: 32, height: 32 }}
      />
    );
  }
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[12px] font-semibold"
      style={{ background: "rgba(203,139,106,0.18)", color: "var(--color-primary)" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── FeedItem ──────────────────────────────────────────────────────────────────
function FeedItem({
  event,
  currentUserId,
}: {
  event: FeedEvent;
  currentUserId: string;
}) {
  const meta = EVENT_META[event.type];
  const time = new Date(event.created_at).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="flex items-start gap-3 rounded-[16px] p-4"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Event type icon */}
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
        style={{ background: meta.bg, color: meta.color }}
      >
        {meta.icon}
      </div>

      <div className="min-w-0 flex-1">
        {/* Author + description */}
        <p className="text-[13px] leading-snug">
          <Link
            href={`/profil/${event.user_id}`}
            className="font-semibold hover:underline underline-offset-2"
            style={{ color: "var(--color-foreground)" }}
          >
            {event.author.username}
          </Link>
          {" "}
          <span style={{ color: "var(--color-muted)" }}>{meta.label(event.payload)}</span>
        </p>

        <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-muted)" }}>
          {time}
        </p>

        <ReactionBar
          eventId={event.id}
          reactions={event.reactions}
          currentUserId={currentUserId}
          isOwn={false}
        />
      </div>

      {/* Author avatar */}
      <Link href={`/profil/${event.user_id}`} className="shrink-0">
        <Avatar name={event.author.username} url={event.author.avatar_url} />
      </Link>
    </div>
  );
}

// ── CircleFeed ────────────────────────────────────────────────────────────────
interface CircleFeedProps {
  events: FeedEvent[];
  currentUserId: string;
  today: string;
}

export function CircleFeed({ events, currentUserId, today }: CircleFeedProps) {
  if (events.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed p-14 text-center"
        style={{ borderColor: "rgba(255,255,255,0.09)" }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-[18px]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Users size={24} className="text-muted" />
        </div>
        <div>
          <p className="font-display font-semibold">Ton cercle avance en silence pour l&apos;instant</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Quand tes amis boucleront une journée ou atteindront un objectif,<br />
            leurs progrès apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  const groups = groupByDay(events);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ date, events: dayEvents }) => (
        <div key={date} className="flex flex-col gap-3">
          {/* Day header */}
          <div className="flex items-center gap-3">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-muted)" }}
            >
              {dayLabel(date, today)}
            </p>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Events */}
          {dayEvents.map((event) => (
            <FeedItem key={event.id} event={event} currentUserId={currentUserId} />
          ))}
        </div>
      ))}

      {events.length >= 30 && (
        <p className="text-center text-[13px] text-muted">
          Affichant les 30 derniers progrès du cercle.
        </p>
      )}
    </div>
  );
}
