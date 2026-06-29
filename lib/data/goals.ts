import type { TypedDb } from "@/lib/database.types";

export function getGoals(db: TypedDb, userId: string) {
  return db
    .from("goals")
    .select("id,title,target_value,current_value,unit,deadline,is_done,created_at")
    .eq("user_id", userId)
    .eq("is_done", false)
    .order("created_at", { ascending: false });
}

export function createGoalRecord(db: TypedDb, data: {
  userId: string;
  title: string;
  targetValue: number;
  unit: string | null;
  deadline: string | null;
}) {
  return db.from("goals").insert({
    user_id:       data.userId,
    title:         data.title,
    target_value:  data.targetValue,
    current_value: 0,
    unit:          data.unit,
    deadline:      data.deadline,
  });
}

export function updateGoalProgress(db: TypedDb, id: string, currentValue: number) {
  return db.from("goals").update({ current_value: currentValue }).eq("id", id);
}

export function markGoalDone(db: TypedDb, id: string) {
  return db.from("goals").update({ is_done: true }).eq("id", id);
}
