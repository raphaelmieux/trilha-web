/*
# Harden security + remove dead schema + gamification foundation

## Context
This app's dataset is disposable test data (no real students enrolled yet), so this
migration is free to drop tables that the client/edge functions never actually query
(confirmed by grepping src/ and supabase/functions/ for `.from('table')` calls) instead
of carrying 25+ unused tables forward. It also closes three real security holes found
in the original Bolt export:

1. `public_read_profiles` let ANY caller (including anonymous) read every column of
   every row in `user_profiles`, including `email` and `is_admin`. Combined with the
   old `reset-password-direct` function (which reset a password given only an email),
   this was a full account-takeover chain. Fixed by removing the broad policy and
   exposing only non-sensitive columns via a `public_profiles` view.
2. The `avatars` storage bucket's INSERT policy had no ownership check — any
   authenticated user could overwrite any other user's avatar file.
3. `certifications` had a client-facing INSERT policy, letting the browser insert a
   forged certification (see FinalExam.tsx's old btoa()-based hash/signature).
   Issuance now goes exclusively through the `issue-certification` edge function
   (service role), so the client INSERT policy is removed.

## Dropped tables (never read/written anywhere in src/ or supabase/functions/)
lesson_requirements, content_blocks, question_items, module_progress,
question_attempts, review_queue, text_versions, family_pacts, web_lab_sessions,
web_lab_events, mail_lab_messages, mail_lab_events, code_projects, code_files,
code_versions, code_test_results, image_assets, image_test_results, site_projects,
site_files, site_test_results, ai_generations, ai_prompts, ai_reviews,
guardian_consents, audit_permissions, auditor_opinions, app_settings.
Curriculum content lives in src/curriculum/*.ts, not in the `lessons.content` jsonb
column, so these reference/lab-detail tables were dead weight.

## New: gamification foundation
`badges` (catalog) + `user_badges` (earned badges), plus `show_on_leaderboard` on
`privacy_preferences` (opt-in, not opt-out — deliberately, given lesson #1 above) and
a `public_leaderboard` view that only includes users who opted in.
*/

-- ============================================================
-- DROP UNUSED TABLES
-- ============================================================

DROP TABLE IF EXISTS lesson_requirements CASCADE;
DROP TABLE IF EXISTS content_blocks CASCADE;
DROP TABLE IF EXISTS question_attempts CASCADE;
DROP TABLE IF EXISTS review_queue CASCADE;
DROP TABLE IF EXISTS question_items CASCADE;
DROP TABLE IF EXISTS module_progress CASCADE;
DROP TABLE IF EXISTS text_versions CASCADE;
DROP TABLE IF EXISTS family_pacts CASCADE;
DROP TABLE IF EXISTS web_lab_events CASCADE;
DROP TABLE IF EXISTS web_lab_sessions CASCADE;
DROP TABLE IF EXISTS mail_lab_events CASCADE;
DROP TABLE IF EXISTS mail_lab_messages CASCADE;
DROP TABLE IF EXISTS code_versions CASCADE;
DROP TABLE IF EXISTS code_test_results CASCADE;
DROP TABLE IF EXISTS code_files CASCADE;
DROP TABLE IF EXISTS code_projects CASCADE;
DROP TABLE IF EXISTS image_test_results CASCADE;
DROP TABLE IF EXISTS image_assets CASCADE;
DROP TABLE IF EXISTS site_test_results CASCADE;
DROP TABLE IF EXISTS site_files CASCADE;
DROP TABLE IF EXISTS site_projects CASCADE;
DROP TABLE IF EXISTS ai_prompts CASCADE;
DROP TABLE IF EXISTS ai_reviews CASCADE;
DROP TABLE IF EXISTS ai_generations CASCADE;
DROP TABLE IF EXISTS guardian_consents CASCADE;
DROP TABLE IF EXISTS audit_permissions CASCADE;
DROP TABLE IF EXISTS auditor_opinions CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- ============================================================
-- FIX: user_profiles PII leak
-- ============================================================

DROP POLICY IF EXISTS "public_read_profiles" ON user_profiles;

-- AdminPage needs to list every user. A plain USING-subquery policy on user_profiles
-- that queries user_profiles itself risks "infinite recursion detected in policy"
-- in Postgres; wrapping the check in a SECURITY DEFINER function (which bypasses RLS
-- internally) is the standard, safe way to do a same-table admin check.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT COALESCE((SELECT is_admin FROM user_profiles WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "admin_read_all_profiles" ON user_profiles;
CREATE POLICY "admin_read_all_profiles" ON user_profiles FOR SELECT TO authenticated USING (is_admin());

-- security_invoker defaults to false: this view runs with the privileges of its
-- owner (the migration role, which bypasses RLS), not the querying role. That is
-- what lets anon/authenticated read these rows even though user_profiles itself is
-- now owner-only. Only non-sensitive columns are exposed (no email, no is_admin).
CREATE OR REPLACE VIEW public_profiles WITH (security_invoker = false) AS
SELECT id, display_name, username, club, unit, public_name_form, avatar_url
FROM user_profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;

-- ============================================================
-- FIX: avatars bucket owner check on upload
-- ============================================================

DROP POLICY IF EXISTS "Auth upload avatars" ON storage.objects;
CREATE POLICY "Owner upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

-- ============================================================
-- FIX: certifications can no longer be inserted by the client
-- ============================================================

DROP POLICY IF EXISTS "insert_own_certs" ON certifications;

-- ============================================================
-- GAMIFICATION: badges + user_badges + leaderboard opt-in
-- ============================================================

ALTER TABLE privacy_preferences ADD COLUMN IF NOT EXISTS show_on_leaderboard boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'award',
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_badges" ON badges;
CREATE POLICY "public_read_badges" ON badges FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  context jsonb NOT NULL DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
DROP POLICY IF EXISTS "select_own_badges" ON user_badges;
CREATE POLICY "select_own_badges" ON user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_badges" ON user_badges;
CREATE POLICY "insert_own_badges" ON user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

INSERT INTO badges (code, name, description, icon, tier, sort_order) VALUES
('first_step', 'Primeiro Passo', 'Concluiu o primeiro requisito de uma trilha.', 'footprints', 'bronze', 1),
('module_complete', 'Módulo Concluído', 'Concluiu todos os requisitos de um módulo.', 'layers', 'bronze', 2),
('streak_3', 'Sequência de 3 Dias', 'Praticou a trilha 3 dias seguidos.', 'flame', 'bronze', 3),
('streak_7', 'Sequência de 7 Dias', 'Praticou a trilha 7 dias seguidos.', 'flame', 'silver', 4),
('streak_30', 'Sequência de 30 Dias', 'Praticou a trilha 30 dias seguidos.', 'flame', 'gold', 5),
('ap034_complete', 'Trilha AP034 Completa', 'Concluiu 100% da especialidade Internet.', 'trophy', 'silver', 6),
('ap035_complete', 'Trilha AP035 Completa', 'Concluiu 100% da especialidade Internet, Avançado.', 'trophy', 'gold', 7),
('perfect_exam', 'Nota Máxima', 'Acertou 100% em uma avaliação final.', 'star', 'gold', 8)
ON CONFLICT (code) DO NOTHING;

-- Same security_invoker rationale as public_profiles above. Only rows for users who
-- opted in (privacy_preferences.show_on_leaderboard = true) are exposed.
CREATE OR REPLACE VIEW public_leaderboard WITH (security_invoker = false) AS
SELECT
  p.id,
  p.display_name,
  p.public_name_form,
  p.avatar_url,
  COALESCE(SUM(e.xp), 0)::int AS total_xp,
  COALESCE(MAX(e.streak_days), 0)::int AS best_streak,
  (SELECT count(*) FROM user_badges ub WHERE ub.user_id = p.id)::int AS badge_count
FROM user_profiles p
JOIN privacy_preferences pp ON pp.user_id = p.id AND pp.show_on_leaderboard = true
LEFT JOIN enrollments e ON e.user_id = p.id
GROUP BY p.id, p.display_name, p.public_name_form, p.avatar_url;

GRANT SELECT ON public_leaderboard TO anon, authenticated;
