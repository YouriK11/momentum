-- 007_fix_rls.sql — Idempotent
-- 1. profiles SELECT : allow reading group members' profiles
-- 2. user_badges SELECT : allow reading group members' badges
-- 3. goals : rename is_done → is_achieved (aligns with 004_social trigger)

BEGIN;

-- ── 1. profiles SELECT ─────────────────────────────────────────────────────────
-- Drop any existing SELECT policy (names vary by Supabase version)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR shares_group(auth.uid(), id));

-- ── 2. user_badges SELECT ──────────────────────────────────────────────────────
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_badges' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_badges', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "user_badges_select" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id OR shares_group(auth.uid(), user_id));

-- ── 3. goals : rename is_done → is_achieved (idempotent) ──────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'is_done'
  ) THEN
    ALTER TABLE public.goals RENAME COLUMN is_done TO is_achieved;
  END IF;
END $$;

-- Recreate goals_goal_achieved trigger (column now exists)
CREATE OR REPLACE FUNCTION public.trg_goal_achieved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_achieved = true AND (OLD.is_achieved IS NULL OR OLD.is_achieved = false) THEN
    PERFORM public.emit_event(
      NEW.user_id,
      'goal_achieved',
      jsonb_build_object('goal_title', NEW.title),
      current_date
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS goals_goal_achieved ON public.goals;
CREATE TRIGGER goals_goal_achieved
  AFTER UPDATE OF is_achieved ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.trg_goal_achieved();

-- Update RLS policies to use new column name (drop and recreate)
DROP POLICY IF EXISTS "goals_select" ON public.goals;
DROP POLICY IF EXISTS "goals_insert" ON public.goals;
DROP POLICY IF EXISTS "goals_update" ON public.goals;
DROP POLICY IF EXISTS "goals_delete" ON public.goals;
DROP POLICY IF EXISTS "own_goals"    ON public.goals;

CREATE POLICY "goals_select" ON public.goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "goals_insert" ON public.goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "goals_update" ON public.goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "goals_delete" ON public.goals FOR DELETE USING (user_id = auth.uid());

COMMIT;
