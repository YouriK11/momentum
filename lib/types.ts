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
