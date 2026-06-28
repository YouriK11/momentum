export type HabitLevel = "facile" | "moyen" | "difficile";
export type HabitScope = "commune" | "perso";

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
};

export type DayScore = { score_date: string; score: number };

export type Badge = {
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
};