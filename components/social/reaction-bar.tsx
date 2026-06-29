"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { upsertReaction, removeReaction } from "@/app/(app)/profil/actions";
import type { ReactionType, ReactionWithReactor } from "@/lib/types";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "bravo",     emoji: "👏", label: "Bravo" },
  { type: "force",     emoji: "🔥", label: "Force" },
  { type: "coeur",     emoji: "❤️", label: "Cœur" },
  { type: "applaudir", emoji: "🙌", label: "Applaudir" },
];

// Group reactions by type and count
function summarize(reactions: ReactionWithReactor[]) {
  const map = new Map<ReactionType, { count: number; reactors: string[] }>();
  for (const r of reactions) {
    const entry = map.get(r.type) ?? { count: 0, reactors: [] };
    entry.count++;
    entry.reactors.push(r.reactor.username);
    map.set(r.type, entry);
  }
  return map;
}

interface ReactionBarProps {
  eventId: string;
  reactions: ReactionWithReactor[];
  currentUserId: string;
  isOwn: boolean;
}

export function ReactionBar({ eventId, reactions, currentUserId, isOwn }: ReactionBarProps) {
  const { toast } = useToast();
  const [optimistic, setOptimistic] = useState<ReactionWithReactor[]>(reactions);
  const [busy, setBusy] = useState(false);

  const myReaction = optimistic.find((r) => r.reactor_id === currentUserId);
  const summary = summarize(optimistic);

  async function handleReaction(type: ReactionType) {
    if (isOwn || busy) return;
    setBusy(true);

    const isRemoving = myReaction?.type === type;

    // Optimistic update
    if (isRemoving) {
      setOptimistic((prev) => prev.filter((r) => r.reactor_id !== currentUserId));
    } else {
      const newReaction: ReactionWithReactor = {
        id: "optimistic",
        type,
        reactor_id: currentUserId,
        reactor: { username: "Moi", avatar_url: null },
      };
      setOptimistic((prev) => [
        ...prev.filter((r) => r.reactor_id !== currentUserId),
        newReaction,
      ]);
    }

    const result = isRemoving
      ? await removeReaction(eventId)
      : await upsertReaction(eventId, type);

    setBusy(false);

    if (result.error) {
      setOptimistic(reactions); // rollback
      toast(result.error, "error");
    }
  }

  // Only show the reaction picker if it's not own event
  // Always show existing reaction totals
  const hasAnyReaction = optimistic.length > 0;

  if (isOwn && !hasAnyReaction) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {/* Existing reaction counts */}
      {REACTIONS.map(({ type, emoji }) => {
        const entry = summary.get(type);
        if (!entry) return null;
        const isMine = myReaction?.type === type;
        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isOwn || busy}
            title={entry.reactors.join(", ")}
            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium transition-all"
            style={{
              background: isMine ? "rgba(203,139,106,0.18)" : "rgba(255,255,255,0.05)",
              border: isMine ? "1px solid rgba(203,139,106,0.35)" : "1px solid rgba(255,255,255,0.08)",
              color: isMine ? "var(--color-primary)" : "var(--color-muted)",
              cursor: isOwn ? "default" : "pointer",
            }}
          >
            <span>{emoji}</span>
            <span>{entry.count}</span>
          </button>
        );
      })}

      {/* Reaction picker — hidden on own events */}
      {!isOwn && (
        <div className="flex items-center gap-0.5">
          {REACTIONS.map(({ type, emoji, label }) => {
            const isMine = myReaction?.type === type;
            if (summary.has(type)) return null; // already shown in counts above
            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={busy}
                title={label}
                aria-label={label}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[14px] transition-all hover:scale-110 active:scale-95"
                style={{
                  background: isMine ? "rgba(203,139,106,0.15)" : "transparent",
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
