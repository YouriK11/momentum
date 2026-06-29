-- ============================================================
-- 001 — Gestion de groupe : suppression et retrait de membre
-- Idempotent : peut être rejoué sans erreur
-- ============================================================

-- delete_group : seul l'owner peut supprimer son groupe.
-- Le ON DELETE CASCADE sur group_members et habits.group_id
-- (SET NULL) est géré au niveau du schéma Supabase.
CREATE OR REPLACE FUNCTION delete_group(p_group uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = p_group AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_owner';
  END IF;

  -- Détacher les habitudes communes avant suppression
  UPDATE habits SET group_id = NULL, scope = 'perso'
  WHERE group_id = p_group;

  DELETE FROM groups WHERE id = p_group;
END;
$$;

-- remove_member : retirer un membre (owner uniquement, pas soi-même)
CREATE OR REPLACE FUNCTION remove_member(p_group uuid, p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = p_group AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_owner';
  END IF;

  IF p_user = auth.uid() THEN
    RAISE EXCEPTION 'cannot_remove_self';
  END IF;

  DELETE FROM group_members WHERE group_id = p_group AND user_id = p_user;
END;
$$;

-- Permissions RPC publiques (sécurité gérée à l'intérieur par auth.uid())
GRANT EXECUTE ON FUNCTION delete_group(uuid)       TO authenticated;
GRANT EXECUTE ON FUNCTION remove_member(uuid, uuid) TO authenticated;
