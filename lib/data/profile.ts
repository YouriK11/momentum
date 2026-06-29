import type { TypedDb } from "@/lib/database.types";

export function getProfile(db: TypedDb, userId: string) {
  return db
    .from("profiles")
    .select("username,avatar_url,current_streak,best_streak")
    .eq("id", userId)
    .single();
}
