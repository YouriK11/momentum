export type HabitLevel     = "facile" | "moyen" | "difficile";
export type HabitScope     = "commune" | "perso";
export type HabitFrequency = "daily" | "specific_days" | "x_per_week";

export type Habit = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  level: HabitLevel;
  weight: number;
  scope: HabitScope;
  owner_id: string;
  group_id: string | null;
  frequency: HabitFrequency;
  frequency_days: number[] | null;
  frequency_x: number | null;
};

export type DayScore = { score_date: string; score: number };

export type Badge = {
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string | null;
  deadline: string | null;
  is_done: boolean;
  created_at: string;
};

export type GoalType = "habit_frequency_week" | "habit_frequency_month" | "streak_target" | "active_days_month";

export type GoalV2 = {
  id: string;
  user_id: string;
  title: string;
  goal_type: GoalType;
  habit_id: string | null;
  target_count: number;
  is_done: boolean;
  created_at: string;
  progress: number;
  habit_name: string | null;
};

export type ActivityEventType = "day_completed" | "streak_milestone" | "goal_achieved" | "badge_earned";
export type ReactionType = "bravo" | "force" | "coeur" | "applaudir";

export type ReactionWithReactor = {
  id: string;
  type: ReactionType;
  reactor_id: string;
  reactor: { username: string; avatar_url: string | null };
};

export type ActivityEvent = {
  id: string;
  user_id: string;
  type: ActivityEventType;
  payload: Record<string, unknown>;
  occurred_on: string;
  created_at: string;
  reactions: ReactionWithReactor[];
};
