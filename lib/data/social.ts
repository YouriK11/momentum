import type { TypedDb } from "@/lib/database.types";
import type { ActivityEvent, ReactionType, ReactionWithReactor } from "@/lib/types";

type RawReaction = {
  id: string;
  type: string;
  reactor_id: string;
  reactor: { username: string; avatar_url: string | null } | null;
};

type RawEvent = {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown> | null;
  occurred_on: string;
  created_at: string;
  reactions: RawReaction[] | null;
};

export async function getActivityEvents(
  db: TypedDb,
  userId: string,
  limit = 20,
): Promise<ActivityEvent[]> {
  const { data, error } = await (db
    .from("activity_events")
    .select(`
      id,
      user_id,
      type,
      payload,
      occurred_on,
      created_at,
      reactions (
        id,
        type,
        reactor_id,
        reactor:profiles!reactions_reactor_id_fkey (
          username,
          avatar_url
        )
      )
    `)
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit) as unknown as Promise<{ data: RawEvent[] | null; error: unknown }>);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    type: row.type as ActivityEvent["type"],
    payload: (row.payload ?? {}) as Record<string, unknown>,
    occurred_on: row.occurred_on,
    created_at: row.created_at,
    reactions: (row.reactions ?? []).map((r): ReactionWithReactor => ({
      id: r.id,
      type: r.type as ReactionType,
      reactor_id: r.reactor_id,
      reactor: r.reactor ?? { username: "?", avatar_url: null },
    })),
  }));
}
