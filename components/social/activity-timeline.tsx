import { Trophy, Flame, Target, Star } from "lucide-react";
import type { ActivityEvent, ActivityEventType } from "@/lib/types";
import { ReactionBar } from "./reaction-bar";

// ── Event metadata ────────────────────────────────────────────────────────────

const EVENT_META: Record<
  ActivityEventType,
  { icon: React.ReactNode; color: string; bg: string; label: (payload: Record<string, unknown>) => string }
> = {
  day_completed: {
    icon: <Star size={15} />,
    color: "var(--color-warning)",
    bg: "rgba(196,168,130,0.15)",
    label: (p) => `Journée bouclée — score ${p.score ?? "–"}`,
  },
  streak_milestone: {
    icon: <Flame size={15} />,
    color: "var(--color-primary)",
    bg: "rgba(203,139,106,0.15)",
    label: (p) => `Série de ${p.streak} jours`,
  },
  goal_achieved: {
    icon: <Target size={15} />,
    color: "var(--color-success)",
    bg: "rgba(143,170,126,0.15)",
    label: (p) => `Objectif atteint — ${p.goal_title ?? ""}`,
  },
  badge_earned: {
    icon: <Trophy size={15} />,
    color: "var(--color-warning)",
    bg: "rgba(196,168,130,0.15)",
    label: (p) => `Badge obtenu — ${p.badge_name ?? ""}`,
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}

// ── EventCard ─────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: ActivityEvent;
  currentUserId: string;
  isOwn: boolean;
}

function EventCard({ event, currentUserId, isOwn }: EventCardProps) {
  const meta = EVENT_META[event.type];

  return (
    <div
      className="rounded-[14px] p-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug">{meta.label(event.payload)}</p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-muted)" }}>
            {formatDate(event.occurred_on)}
          </p>

          <ReactionBar
            eventId={event.id}
            reactions={event.reactions}
            currentUserId={currentUserId}
            isOwn={isOwn}
          />
        </div>
      </div>
    </div>
  );
}

// ── ActivityTimeline ──────────────────────────────────────────────────────────

interface ActivityTimelineProps {
  events: ActivityEvent[];
  currentUserId: string;
  profileUserId: string;
}

export function ActivityTimeline({ events, currentUserId, profileUserId }: ActivityTimelineProps) {
  const isOwn = currentUserId === profileUserId;

  if (events.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed p-10 text-center"
        style={{ borderColor: "rgba(255,255,255,0.09)" }}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Star size={22} className="text-muted" />
        </div>
        <div>
          <p className="font-semibold">Aucun progrès récent</p>
          <p className="mt-1 text-[13px] text-muted">
            {isOwn
              ? "Complète des journées et atteins tes objectifs pour voir ton activité ici."
              : "Aucune activité récente à afficher."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          currentUserId={currentUserId}
          isOwn={isOwn}
        />
      ))}
    </div>
  );
}
