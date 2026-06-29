import type { TypedDb } from "@/lib/database.types";

// Scores quotidiens depuis `fromDate` (inclus), triés par date.
export function getScoresFrom(db: TypedDb, userId: string, fromDate: string) {
  return db
    .from("daily_scores")
    .select("score_date,score,completed,planned")
    .eq("user_id", userId)
    .gte("score_date", fromDate)
    .order("score_date");
}
