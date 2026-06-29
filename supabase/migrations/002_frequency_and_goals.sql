-- ============================================================
-- 002 — Fréquence des habitudes + table objectifs
-- Idempotent : peut être rejoué sans erreur
-- ============================================================

-- ── 1. Colonnes fréquence sur habits ─────────────────────────────────────────
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS frequency      text    NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('daily', 'specific_days', 'x_per_week')),
  ADD COLUMN IF NOT EXISTS frequency_days integer[] DEFAULT NULL,
  -- Jours ciblés pour 'specific_days' ; 0=Dim, 1=Lun, ..., 6=Sam
  -- (cohérent avec EXTRACT(DOW ...) PostgreSQL et JS getDay())
  ADD COLUMN IF NOT EXISTS frequency_x    integer  DEFAULT NULL;
  -- Nombre de fois par semaine pour 'x_per_week'

-- ── 2. Fonction helper is_habit_scheduled ────────────────────────────────────
-- Renvoie true si l'habitude est prévue le jour d.
-- Pour 'daily' et 'x_per_week' : toujours true (afficher chaque jour).
-- Pour 'specific_days'          : vrai si le DOW de d est dans frequency_days.
CREATE OR REPLACE FUNCTION is_habit_scheduled(
  h_frequency      text,
  h_frequency_days integer[],
  h_frequency_x    integer,
  d                date
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN h_frequency = 'specific_days' THEN
      h_frequency_days IS NOT NULL
      AND (EXTRACT(DOW FROM d)::integer = ANY(h_frequency_days))
    ELSE true   -- 'daily' et 'x_per_week'
  END;
$$;

GRANT EXECUTE ON FUNCTION is_habit_scheduled(text, integer[], integer, date) TO authenticated;

-- ── 3. Table objectifs (goals) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title         text        NOT NULL,
  target_value  numeric     NOT NULL,
  current_value numeric     NOT NULL DEFAULT 0,
  unit          text,
  deadline      date,
  is_done       boolean     NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Politique idempotente
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'own_goals'
  ) THEN
    EXECUTE 'CREATE POLICY own_goals ON goals
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;

-- ── NOTE : recalc_daily_score ─────────────────────────────────────────────────
-- Pour que le dénominateur du score ne compte que les habitudes prévues le jour j,
-- ajoute ce filtre dans la clause WHERE de ta fonction recalc_daily_score :
--
--   AND is_habit_scheduled(h.frequency, h.frequency_days, h.frequency_x, p_date)
--
-- Remplace le filtrage actuel (uniquement h.is_active = true) par :
--   WHERE h.is_active = true
--     AND is_habit_scheduled(h.frequency, h.frequency_days, h.frequency_x, p_date)
-- ─────────────────────────────────────────────────────────────────────────────
