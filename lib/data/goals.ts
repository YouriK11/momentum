import type { TypedDb } from "@/lib/database.types";
import type { GoalType, GoalV2 } from "@/lib/types";

// ── Fetch new-style goals with habit name ──────────────────────────────────────
type RawGoalV2 = {
  id: string;
  user_id: string;
  title: string;
  goal_type: string;
  habit_id: string | null;
  target_count: number | null;
  is_done: boolean;
  created_at: string;
  habit: { name: string } | null;
};

export async function getGoalsV2(db: TypedDb, userId: string): Promise<GoalV2[]> {
  const { data } = await (db
    .from("goals")
    .select("id, user_id, title, goal_type, habit_id, target_count, is_done, created_at, habit:habits!habit_id (name)")
    .eq("user_id", userId)
    .not("goal_type", "is", null)
    .eq("is_done", false)
    .order("created_at", { ascending: false }) as unknown as Promise<{ data: RawGoalV2[] | null; error: unknown }>);

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    goal_type: row.goal_type as GoalType,
    habit_id: row.habit_id,
    target_count: row.target_count ?? 1,
    is_done: row.is_done,
    created_at: row.created_at,
    habit_name: row.habit?.name ?? null,
    progress: 0, // filled in by computeGoalProgress in the page RSC
  }));
}

// ── Progress computation helpers ───────────────────────────────────────────────
function getWeekStart(today: string): string {
  const d = new Date(today);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function getMonthStart(today: string): string {
  return today.slice(0, 7) + "-01";
}

export async function computeGoalProgress(
  db: TypedDb,
  userId: string,
  goals: GoalV2[],
  today: string,
  currentStreak: number,
): Promise<GoalV2[]> {
  const weekStart  = getWeekStart(today);
  const monthStart = getMonthStart(today);

  return Promise.all(
    goals.map(async (g) => {
      let progress = 0;

      if (g.goal_type === "habit_frequency_week" && g.habit_id) {
        const { count } = await db
          .from("habit_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("habit_id", g.habit_id)
          .eq("status", true)
          .gte("log_date", weekStart)
          .lte("log_date", today);
        progress = count ?? 0;

      } else if (g.goal_type === "habit_frequency_month" && g.habit_id) {
        const { count } = await db
          .from("habit_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("habit_id", g.habit_id)
          .eq("status", true)
          .gte("log_date", monthStart)
          .lte("log_date", today);
        progress = count ?? 0;

      } else if (g.goal_type === "streak_target") {
        progress = currentStreak;

      } else if (g.goal_type === "active_days_month") {
        const { count } = await db
          .from("daily_scores")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gt("score", 0)
          .gte("score_date", monthStart)
          .lte("score_date", today);
        progress = count ?? 0;
      }

      return { ...g, progress };
    }),
  );
}
