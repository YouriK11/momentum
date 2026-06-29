import type { TypedDb } from "@/lib/database.types";
import type { ActivityEvent, ActivityEventType, ReactionType, ReactionWithReactor } from "@/lib/types";

// ── Raw DB shapes (bypasses Supabase TypeScript inference for nested joins) ───
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
type RawFeedEvent = RawEvent & {
  author: { username: string; avatar_url: string | null } | null;
};
type RawFriendActive = {
  user_id: string;
  author: { username: string } | null;
};

// ── Shared mappers ─────────────────────────────────────────────────────────────
function mapReactions(raw: RawReaction[]): ReactionWithReactor[] {
  return raw.map((r) => ({
    id: r.id,
    type: r.type as ReactionType,
    reactor_id: r.reactor_id,
    reactor: r.reactor ?? { username: "?", avatar_url: null },
  }));
}

const REACTIONS_SELECT = `
  reactions (
    id, type, reactor_id,
    reactor:profiles!reactor_id (username, avatar_url)
  )
`;

// ── getActivityEvents — own events on /profil ──────────────────────────────────
export async function getActivityEvents(
  db: TypedDb,
  userId: string,
  limit = 20,
): Promise<ActivityEvent[]> {
  const { data } = await (db
    .from("activity_events")
    .select(`id, user_id, type, payload, occurred_on, created_at, ${REACTIONS_SELECT}`)
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit) as unknown as Promise<{ data: RawEvent[] | null; error: unknown }>);

  if (!data) return [];
  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    type: row.type as ActivityEventType,
    payload: (row.payload ?? {}) as Record<string, unknown>,
    occurred_on: row.occurred_on,
    created_at: row.created_at,
    reactions: mapReactions(row.reactions ?? []),
  }));
}

// ── FeedEvent — circle feed (events from group members) ───────────────────────
export type FeedEvent = ActivityEvent & {
  author: { username: string; avatar_url: string | null };
};

export async function getFeedEvents(
  db: TypedDb,
  userId: string,
  limit = 30,
): Promise<FeedEvent[]> {
  const { data } = await (db
    .from("activity_events")
    .select(`
      id, user_id, type, payload, occurred_on, created_at,
      author:profiles!user_id (username, avatar_url),
      ${REACTIONS_SELECT}
    `)
    .neq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit) as unknown as Promise<{ data: RawFeedEvent[] | null; error: unknown }>);

  if (!data) return [];
  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    type: row.type as ActivityEventType,
    payload: (row.payload ?? {}) as Record<string, unknown>,
    occurred_on: row.occurred_on,
    created_at: row.created_at,
    author: row.author ?? { username: "?", avatar_url: null },
    reactions: mapReactions(row.reactions ?? []),
  }));
}

// ── getFriendActivity — soft social proof on home ─────────────────────────────
export async function getFriendActivity(
  db: TypedDb,
  userId: string,
  today: string,
): Promise<{ username: string; user_id: string }[]> {
  const { data } = await (db
    .from("activity_events")
    .select(`user_id, author:profiles!user_id (username)`)
    .eq("type", "day_completed")
    .eq("occurred_on", today)
    .neq("user_id", userId)
    .limit(10) as unknown as Promise<{ data: RawFriendActive[] | null; error: unknown }>);

  if (!data) return [];

  // Deduplicate by user_id (multiple events same day possible)
  const seen = new Set<string>();
  return data
    .filter((r) => { if (seen.has(r.user_id)) return false; seen.add(r.user_id); return true; })
    .map((r) => ({ user_id: r.user_id, username: r.author?.username ?? "?" }));
}
