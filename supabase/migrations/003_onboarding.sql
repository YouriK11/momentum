-- ============================================================
-- 003 — Champ onboarded sur profiles
-- Idempotent : peut être rejoué sans erreur
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;
