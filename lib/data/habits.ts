import type { TypedDb } from "@/lib/database.types";

// Retourne les habitudes actives, filtrées sur le jour si `today` est fourni.
// today au format "YYYY-MM-DD" — JS getDay() : 0=Dim, 1=Lun, ..., 6=Sam.
export function getActiveHabits(db: TypedDb, today?: string) {
  let query = db
    .from("habits")
    .select("id,name,description,icon,color,level,weight,scope,owner_id,group_id,frequency,frequency_days,frequency_x")
    .eq("is_active", true)
    .order("scope")
    .order("name");

  if (today) {
    const dow = new Date(today).getDay();
    // Filtre : daily OU x_per_week (toujours affiché) OU specific_days contenant ce dow
    query = (query as typeof query).or(
      `frequency.eq.daily,frequency.eq.x_per_week,and(frequency.eq.specific_days,frequency_days.cs.{${dow}})`
    );
  }

  return query;
}

// Logs du jour pour l'utilisateur courant.
export function getTodayLogs(db: TypedDb, userId: string, today: string) {
  return db
    .from("habit_logs")
    .select("habit_id,status")
    .eq("user_id", userId)
    .eq("log_date", today);
}
