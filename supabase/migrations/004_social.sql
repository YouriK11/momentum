-- ============================================================
-- 004 — Couche sociale : events, réactions, notifications
-- Idempotent : peut être rejoué sans erreur
-- ============================================================

-- ── activity_events ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('day_completed','streak_milestone','goal_achieved','badge_earned')),
  payload     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  occurred_on date        NOT NULL DEFAULT current_date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS activity_events_dedup
  ON public.activity_events (user_id, type, occurred_on, coalesce(payload->>'streak', ''));

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_events_select" ON public.activity_events;
CREATE POLICY "activity_events_select" ON public.activity_events
  FOR SELECT USING (user_id = auth.uid() OR shares_group(auth.uid(), user_id));

-- ── reactions ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reactions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid        NOT NULL REFERENCES public.activity_events(id) ON DELETE CASCADE,
  subject_user_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reactor_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            text        NOT NULL CHECK (type IN ('bravo','force','coeur','applaudir')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, reactor_id)
);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_select" ON public.reactions;
DROP POLICY IF EXISTS "reactions_insert" ON public.reactions;
DROP POLICY IF EXISTS "reactions_update" ON public.reactions;
DROP POLICY IF EXISTS "reactions_delete" ON public.reactions;

CREATE POLICY "reactions_select" ON public.reactions
  FOR SELECT USING (
    reactor_id = auth.uid()
    OR shares_group(auth.uid(), subject_user_id)
  );

CREATE POLICY "reactions_insert" ON public.reactions
  FOR INSERT WITH CHECK (
    reactor_id = auth.uid()
    AND reactor_id <> subject_user_id
    AND shares_group(auth.uid(), subject_user_id)
  );

CREATE POLICY "reactions_update" ON public.reactions
  FOR UPDATE USING (reactor_id = auth.uid());

CREATE POLICY "reactions_delete" ON public.reactions
  FOR DELETE USING (reactor_id = auth.uid());

-- ── notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('reaction','encouragement')),
  actor_id    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_id    uuid        REFERENCES public.activity_events(id) ON DELETE CASCADE,
  payload     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  read        bool        NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notifications_reaction_dedup
  ON public.notifications (user_id, actor_id, event_id)
  WHERE type = 'reaction' AND event_id IS NOT NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;

CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ── encouragements ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.encouragements (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "encouragements_insert" ON public.encouragements;
DROP POLICY IF EXISTS "encouragements_select" ON public.encouragements;

CREATE POLICY "encouragements_insert" ON public.encouragements
  FOR INSERT WITH CHECK (
    from_user = auth.uid()
    AND shares_group(auth.uid(), to_user)
  );

CREATE POLICY "encouragements_select" ON public.encouragements
  FOR SELECT USING (from_user = auth.uid() OR to_user = auth.uid());

-- ── emit_event ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.emit_event(
  p_user    uuid,
  p_type    text,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_date    date  DEFAULT current_date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_events (user_id, type, payload, occurred_on)
  VALUES (p_user, p_type, p_payload, p_date)
  ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.emit_event(uuid, text, jsonb, date) TO authenticated;

-- ── Trigger : badge_earned ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_badge_earned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge_name text;
BEGIN
  SELECT name INTO v_badge_name FROM public.badges WHERE id = NEW.badge_id;
  PERFORM public.emit_event(
    NEW.user_id,
    'badge_earned',
    jsonb_build_object('badge_id', NEW.badge_id, 'badge_name', coalesce(v_badge_name, '')),
    current_date
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_badges_emit ON public.user_badges;
CREATE TRIGGER user_badges_emit
  AFTER INSERT ON public.user_badges
  FOR EACH ROW EXECUTE FUNCTION public.trg_badge_earned();

-- ── Trigger : streak_milestone ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_streak_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.current_streak <= COALESCE(OLD.current_streak, 0) THEN
    RETURN NEW;
  END IF;
  IF NEW.current_streak = ANY(ARRAY[3, 7, 14, 30, 60, 100]) THEN
    PERFORM public.emit_event(
      NEW.id,
      'streak_milestone',
      jsonb_build_object('streak', NEW.current_streak),
      current_date
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_streak_milestone ON public.profiles;
CREATE TRIGGER profiles_streak_milestone
  AFTER UPDATE OF current_streak ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_streak_milestone();

-- ── Trigger : day_completed ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_day_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.score >= 80 OR (NEW.planned > 0 AND NEW.completed >= NEW.planned) THEN
    PERFORM public.emit_event(
      NEW.user_id,
      'day_completed',
      jsonb_build_object('score', NEW.score),
      NEW.score_date::date
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS daily_scores_day_completed ON public.daily_scores;
CREATE TRIGGER daily_scores_day_completed
  AFTER INSERT OR UPDATE ON public.daily_scores
  FOR EACH ROW EXECUTE FUNCTION public.trg_day_completed();

-- ── Trigger : goal_achieved ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_goal_achieved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Transition false → true uniquement (colonne réelle : is_achieved)
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

-- ── Trigger : notification sur réaction ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_reaction_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reactor_id = NEW.subject_user_id THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.notifications (user_id, type, actor_id, event_id, payload)
  VALUES (
    NEW.subject_user_id,
    'reaction',
    NEW.reactor_id,
    NEW.event_id,
    jsonb_build_object('reaction_type', NEW.type)
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reactions_notify ON public.reactions;
CREATE TRIGGER reactions_notify
  AFTER INSERT ON public.reactions
  FOR EACH ROW EXECUTE FUNCTION public.trg_reaction_notify();

-- ── Trigger : notification sur encouragement ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_encouragement_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, payload)
  VALUES (
    NEW.to_user,
    'encouragement',
    NEW.from_user,
    jsonb_build_object('message', NEW.message)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS encouragements_notify ON public.encouragements;
CREATE TRIGGER encouragements_notify
  AFTER INSERT ON public.encouragements
  FOR EACH ROW EXECUTE FUNCTION public.trg_encouragement_notify();
