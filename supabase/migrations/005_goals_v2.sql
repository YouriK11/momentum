-- ============================================================
-- 005 — Objectifs v2 : intentions ancrées dans les habitudes
-- Idempotent : peut être rejoué sans erreur
-- ============================================================

-- Nouvelles colonnes sur la table existante
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS goal_type text
    CHECK (goal_type IN ('habit_frequency_week','habit_frequency_month','streak_target','active_days_month')),
  ADD COLUMN IF NOT EXISTS habit_id uuid
    REFERENCES public.habits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_count integer;

-- Donner un DEFAULT 0 aux colonnes numériques de l'ancien système
-- pour que les nouveaux objectifs puissent ignorer ces champs
DO $$
BEGIN
  ALTER TABLE public.goals ALTER COLUMN target_value SET DEFAULT 0;
EXCEPTION WHEN others THEN NULL;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.goals ALTER COLUMN current_value SET DEFAULT 0;
EXCEPTION WHEN others THEN NULL;
END;
$$;
