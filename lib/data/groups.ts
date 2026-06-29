import type { TypedDb } from "@/lib/database.types";

export function getUserGroups(db: TypedDb) {
  return db.from("groups").select("id,name,description").order("created_at");
}

export function getFirstGroup(db: TypedDb) {
  return db.from("groups").select("id,name").order("created_at").limit(1).maybeSingle();
}

export function getGroupLeaderboard(db: TypedDb, groupId: string, today: string) {
  return db.rpc("group_leaderboard", { p_group: groupId, p_today: today });
}

export function getGroupById(db: TypedDb, groupId: string) {
  return db
    .from("groups")
    .select("id,name,description,invite_code,owner_id")
    .eq("id", groupId)
    .single();
}
