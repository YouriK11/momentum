-- 006_goals_align.sql — idempotent goals table realignment
-- New model: goal_type ∈ ('count_week','count_month','streak','active_days_month')
-- Progress is COMPUTED from habit_logs / streak / daily_scores — never stored.

BEGIN;

-- Drop legacy stored-progress columns
ALTER TABLE goals
  DROP COLUMN IF EXISTS current_value,
  DROP COLUMN IF EXISTS target_value,
  DROP COLUMN IF EXISTS unit,
  DROP COLUMN IF EXISTS deadline,
  DROP COLUMN IF EXISTS target_count;

-- Rebuild goal_type with new constraint values
ALTER TABLE goals DROP COLUMN IF EXISTS goal_type;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS goal_type text
  CHECK (goal_type IN ('count_week','count_month','streak','active_days_month'));

-- New clean columns
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS target     int  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date   date;

-- RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goals_select" ON goals;
DROP POLICY IF EXISTS "goals_insert" ON goals;
DROP POLICY IF EXISTS "goals_update" ON goals;
DROP POLICY IF EXISTS "goals_delete" ON goals;

CREATE POLICY "goals_select" ON goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "goals_update" ON goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "goals_delete" ON goals FOR DELETE USING (user_id = auth.uid());

COMMIT;
