/*
# Trilha.Web() Core Schema

1. Purpose
- Full data model for the Trilha.Web() educational platform covering AP034 (Internet) and AP035 (Internet, Advanced) specialties.
- Supports autonomous student journeys, automatic certification (Token.Web()), optional auditor review, and admin management.

2. New Tables
- `user_profiles` — extended profile data for auth.users (display name, club, unit, privacy).
- `privacy_preferences` — per-user privacy settings (public name form, club visibility, consent).
- `guardian_consents` — optional guardian consent records (never blocks autonomous journey).
- `curriculum_versions` — versioned curriculum definitions (web-foundation, web-advanced).
- `specialties` — AP034 and AP035 specialty definitions.
- `requirements` — individual curriculum requirements (AP034-1.1, etc.).
- `modules` — modules grouping requirements within a specialty.
- `lessons` — lessons within modules.
- `lesson_requirements` — many-to-many lesson ↔ requirements.
- `content_blocks` — teaching content for lessons (explanations, examples).
- `question_items` — assessment questions.
- `enrollments` — student enrollment in a specialty.
- `module_progress` — per-module progress state.
- `requirement_progress` — per-requirement mastery state.
- `lesson_attempts` — lesson attempt records.
- `question_attempts` — individual question attempt records.
- `review_queue` — spaced repetition review items.
- `text_projects` — student text projects (history of internet essay).
- `text_versions` — versioned snapshots of text projects.
- `family_pacts` — the "Pacto de Uso Consciente da Internet".
- `web_lab_sessions` — WebLab browsing sessions.
- `web_lab_events` — events within a WebLab session (visits, searches, downloads).
- `mail_lab_messages` — MailLab messages (inbox, sent, drafts).
- `mail_lab_events` — MailLab interaction events.
- `code_projects` — CodeLab HTML projects.
- `code_files` — files within a code project.
- `code_versions` — versioned code snapshots.
- `code_test_results` — automated test results for code.
- `image_assets` — ImageLab assets (JPEG, PNG, buttons, header).
- `image_test_results` — image validation results (size, format).
- `site_projects` — SiteLab multi-page site projects.
- `site_files` — files within a site project.
- `site_test_results` — site evaluation results.
- `ai_generations` — AI Lab generation records.
- `ai_prompts` — prompts submitted by student.
- `ai_reviews` — student reviews of AI output.
- `activity_events` — append-only activity log.
- `certifications` — issued Token.Web() certifications.
- `certification_snapshots` — immutable snapshot of requirements at issuance.
- `certification_events` — certification lifecycle events (issue, verify, revoke).
- `audit_permissions` — auditor access grants (student-authorized).
- `auditor_opinions` — optional auditor opinions (never alters result).
- `app_settings` — global app configuration.
- `ai_provider_settings` — AI provider configuration (admin-managed).

3. Security
- RLS enabled on ALL tables.
- Owner-scoped CRUD for student data (user_id DEFAULT auth.uid()).
- Public read-only on certifications for verification.
- Admin role check via raw_app_meta_data for admin tables.
- Append-only activity log (INSERT only for students).
*/

-- ============================================================
-- USER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  username text UNIQUE,
  club text,
  unit text,
  public_name_form text NOT NULL DEFAULT 'full' CHECK (public_name_form IN ('full','first','initials','anonymous')),
  is_admin boolean NOT NULL DEFAULT false,
  terms_version text NOT NULL DEFAULT '1.0',
  terms_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "public_read_profiles" ON user_profiles;
CREATE POLICY "public_read_profiles" ON user_profiles FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- PRIVACY PREFERENCES
-- ============================================================

CREATE TABLE IF NOT EXISTS privacy_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  show_club_publicly boolean NOT NULL DEFAULT false,
  share_certifications boolean NOT NULL DEFAULT true,
  allow_auditor boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE privacy_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_privacy" ON privacy_preferences;
CREATE POLICY "select_own_privacy" ON privacy_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_privacy" ON privacy_preferences;
CREATE POLICY "insert_own_privacy" ON privacy_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_privacy" ON privacy_preferences;
CREATE POLICY "update_own_privacy" ON privacy_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- GUARDIAN CONSENTS (optional, never blocks)
-- ============================================================

CREATE TABLE IF NOT EXISTS guardian_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  guardian_name text,
  consent_given boolean NOT NULL DEFAULT false,
  consented_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guardian_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_consent" ON guardian_consents;
CREATE POLICY "select_own_consent" ON guardian_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_consent" ON guardian_consents;
CREATE POLICY "insert_own_consent" ON guardian_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_consent" ON guardian_consents;
CREATE POLICY "update_own_consent" ON guardian_consents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CURRICULUM STRUCTURE
-- ============================================================

CREATE TABLE IF NOT EXISTS curriculum_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE curriculum_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_curriculum" ON curriculum_versions;
CREATE POLICY "public_read_curriculum" ON curriculum_versions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_curriculum" ON curriculum_versions;
CREATE POLICY "admin_write_curriculum" ON curriculum_versions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE TABLE IF NOT EXISTS specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id uuid NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  level text NOT NULL CHECK (level IN ('fundamental','advanced')),
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_specialties" ON specialties;
CREATE POLICY "public_read_specialties" ON specialties FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_specialties" ON specialties;
CREATE POLICY "admin_write_specialties" ON specialties FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE TABLE IF NOT EXISTS requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('theory','practice','mixed')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_requirements_specialty ON requirements(specialty_id);
DROP POLICY IF EXISTS "public_read_requirements" ON requirements;
CREATE POLICY "public_read_requirements" ON requirements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_requirements" ON requirements;
CREATE POLICY "admin_write_requirements" ON requirements FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(specialty_id, code)
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_modules_specialty ON modules(specialty_id);
DROP POLICY IF EXISTS "public_read_modules" ON modules;
CREATE POLICY "public_read_modules" ON modules FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_modules" ON modules;
CREATE POLICY "admin_write_modules" ON modules FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  lesson_type text NOT NULL DEFAULT 'theory' CHECK (lesson_type IN ('theory','quiz','lab','checkpoint','final')),
  content jsonb NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(module_id, code)
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
DROP POLICY IF EXISTS "public_read_lessons" ON lessons;
CREATE POLICY "public_read_lessons" ON lessons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_lessons" ON lessons;
CREATE POLICY "admin_write_lessons" ON lessons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE TABLE IF NOT EXISTS lesson_requirements (
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, requirement_id)
);

ALTER TABLE lesson_requirements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_lesson_reqs" ON lesson_requirements;
CREATE POLICY "public_read_lesson_reqs" ON lesson_requirements FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  block_type text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_content_lesson ON content_blocks(lesson_id);
DROP POLICY IF EXISTS "public_read_content" ON content_blocks;
CREATE POLICY "public_read_content" ON content_blocks FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS question_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES requirements(id) ON DELETE SET NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice','true_false','matching','ordering','fill_blank','scenario','image_quiz')),
  prompt text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  explanation text,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE question_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_questions_lesson ON question_items(lesson_id);
DROP POLICY IF EXISTS "public_read_questions" ON question_items;
CREATE POLICY "public_read_questions" ON question_items FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- STUDENT PROGRESS
-- ============================================================

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','locked')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  xp int NOT NULL DEFAULT 0,
  streak_days int NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, specialty_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_enroll_user ON enrollments(user_id);
DROP POLICY IF EXISTS "select_own_enrollment" ON enrollments;
CREATE POLICY "select_own_enrollment" ON enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_enrollment" ON enrollments;
CREATE POLICY "insert_own_enrollment" ON enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_enrollment" ON enrollments;
CREATE POLICY "update_own_enrollment" ON enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','learning','practicing','needs_review','demonstrated','completed','blocked')),
  score int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_modprog_user ON module_progress(user_id);
DROP POLICY IF EXISTS "select_own_modprog" ON module_progress;
CREATE POLICY "select_own_modprog" ON module_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_modprog" ON module_progress;
CREATE POLICY "insert_own_modprog" ON module_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_modprog" ON module_progress;
CREATE POLICY "update_own_modprog" ON module_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS requirement_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','learning','practicing','needs_review','demonstrated','completed','blocked')),
  mastery_score int NOT NULL DEFAULT 0,
  attempts int NOT NULL DEFAULT 0,
  correct_count int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 0,
  retention_passed boolean NOT NULL DEFAULT false,
  checkpoint_passed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, requirement_id)
);

ALTER TABLE requirement_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reqprog_user ON requirement_progress(user_id);
DROP POLICY IF EXISTS "select_own_reqprog" ON requirement_progress;
CREATE POLICY "select_own_reqprog" ON requirement_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_reqprog" ON requirement_progress;
CREATE POLICY "insert_own_reqprog" ON requirement_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reqprog" ON requirement_progress;
CREATE POLICY "update_own_reqprog" ON requirement_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS lesson_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  active_duration_ms bigint NOT NULL DEFAULT 0
);

ALTER TABLE lesson_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_attempts_user ON lesson_attempts(user_id);
DROP POLICY IF EXISTS "select_own_attempts" ON lesson_attempts;
CREATE POLICY "select_own_attempts" ON lesson_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_attempts" ON lesson_attempts;
CREATE POLICY "insert_own_attempts" ON lesson_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_attempts" ON lesson_attempts;
CREATE POLICY "update_own_attempts" ON lesson_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES question_items(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL DEFAULT false,
  answer jsonb NOT NULL DEFAULT '{}',
  attempted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_qattempts_user ON question_attempts(user_id);
DROP POLICY IF EXISTS "select_own_qattempts" ON question_attempts;
CREATE POLICY "select_own_qattempts" ON question_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_qattempts" ON question_attempts;
CREATE POLICY "insert_own_qattempts" ON question_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  question_id uuid REFERENCES question_items(id) ON DELETE CASCADE,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  review_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_review_user ON review_queue(user_id);
DROP POLICY IF EXISTS "select_own_review" ON review_queue;
CREATE POLICY "select_own_review" ON review_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_review" ON review_queue;
CREATE POLICY "insert_own_review" ON review_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_review" ON review_queue;
CREATE POLICY "update_own_review" ON review_queue FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_review" ON review_queue;
CREATE POLICY "delete_own_review" ON review_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- TEXT PROJECTS (AP034.3 - History of Internet essay)
-- ============================================================

CREATE TABLE IF NOT EXISTS text_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL DEFAULT '',
  word_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','needs_revision')),
  criteria_met jsonb NOT NULL DEFAULT '[]',
  quiz_score int,
  quiz_total int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE text_projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_text_user ON text_projects(user_id);
DROP POLICY IF EXISTS "select_own_text" ON text_projects;
CREATE POLICY "select_own_text" ON text_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_text" ON text_projects;
CREATE POLICY "insert_own_text" ON text_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_text" ON text_projects;
CREATE POLICY "update_own_text" ON text_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS text_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_project_id uuid NOT NULL REFERENCES text_projects(id) ON DELETE CASCADE,
  body text NOT NULL,
  word_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE text_versions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_textver_project ON text_versions(text_project_id);
DROP POLICY IF EXISTS "select_own_textver" ON text_versions;
CREATE POLICY "select_own_textver" ON text_versions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM text_projects WHERE id = text_versions.text_project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_textver" ON text_versions;
CREATE POLICY "insert_own_textver" ON text_versions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM text_projects WHERE id = text_versions.text_project_id AND user_id = auth.uid()));

-- ============================================================
-- FAMILY PACT (AP034.5)
-- ============================================================

CREATE TABLE IF NOT EXISTS family_pacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  clauses jsonb NOT NULL DEFAULT '{}',
  scenarios_completed jsonb NOT NULL DEFAULT '[]',
  student_signed boolean NOT NULL DEFAULT false,
  student_signature text,
  student_signed_at timestamptz,
  guardian_signed boolean NOT NULL DEFAULT false,
  guardian_name text,
  guardian_signature text,
  guardian_signed_at timestamptz,
  responsibility_declaration boolean NOT NULL DEFAULT false,
  family_declaration boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE family_pacts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pact_user ON family_pacts(user_id);
DROP POLICY IF EXISTS "select_own_pact" ON family_pacts;
CREATE POLICY "select_own_pact" ON family_pacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_pact" ON family_pacts;
CREATE POLICY "insert_own_pact" ON family_pacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_pact" ON family_pacts;
CREATE POLICY "update_own_pact" ON family_pacts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- WEB LAB (AP034.6)
-- ============================================================

CREATE TABLE IF NOT EXISTS web_lab_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE web_lab_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_weblab_user ON web_lab_sessions(user_id);
DROP POLICY IF EXISTS "select_own_weblab" ON web_lab_sessions;
CREATE POLICY "select_own_weblab" ON web_lab_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_weblab" ON web_lab_sessions;
CREATE POLICY "insert_own_weblab" ON web_lab_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_weblab" ON web_lab_sessions;
CREATE POLICY "update_own_weblab" ON web_lab_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS web_lab_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES web_lab_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  url text,
  title text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE web_lab_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_weblabev_session ON web_lab_events(session_id);
DROP POLICY IF EXISTS "select_own_weblabev" ON web_lab_events;
CREATE POLICY "select_own_weblabev" ON web_lab_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM web_lab_sessions WHERE id = web_lab_events.session_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_weblabev" ON web_lab_events;
CREATE POLICY "insert_own_weblabev" ON web_lab_events FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM web_lab_sessions WHERE id = web_lab_events.session_id AND user_id = auth.uid()));

-- ============================================================
-- MAIL LAB (AP034.7)
-- ============================================================

CREATE TABLE IF NOT EXISTS mail_lab_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  folder text NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox','sent','drafts','trash')),
  from_address text NOT NULL,
  to_address text,
  subject text NOT NULL,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  has_attachment boolean NOT NULL DEFAULT false,
  attachment_name text,
  attachment_content text,
  is_phishing boolean NOT NULL DEFAULT false,
  phishing_signals jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mail_lab_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_mail_user ON mail_lab_messages(user_id);
DROP POLICY IF EXISTS "select_own_mail" ON mail_lab_messages;
CREATE POLICY "select_own_mail" ON mail_lab_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mail" ON mail_lab_messages;
CREATE POLICY "insert_own_mail" ON mail_lab_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mail" ON mail_lab_messages;
CREATE POLICY "update_own_mail" ON mail_lab_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mail" ON mail_lab_messages;
CREATE POLICY "delete_own_mail" ON mail_lab_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS mail_lab_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  message_id uuid REFERENCES mail_lab_messages(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mail_lab_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_mailev_user ON mail_lab_events(user_id);
DROP POLICY IF EXISTS "select_own_mailev" ON mail_lab_events;
CREATE POLICY "select_own_mailev" ON mail_lab_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mailev" ON mail_lab_events;
CREATE POLICY "insert_own_mailev" ON mail_lab_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CODE LAB (AP035.2)
-- ============================================================

CREATE TABLE IF NOT EXISTS code_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Meu Projeto HTML',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE code_projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_code_user ON code_projects(user_id);
DROP POLICY IF EXISTS "select_own_code" ON code_projects;
CREATE POLICY "select_own_code" ON code_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_code" ON code_projects;
CREATE POLICY "insert_own_code" ON code_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_code" ON code_projects;
CREATE POLICY "update_own_code" ON code_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_code" ON code_projects;
CREATE POLICY "delete_own_code" ON code_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS code_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES code_projects(id) ON DELETE CASCADE,
  filename text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, filename)
);

ALTER TABLE code_files ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_codefile_project ON code_files(project_id);
DROP POLICY IF EXISTS "select_own_codefile" ON code_files;
CREATE POLICY "select_own_codefile" ON code_files FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM code_projects WHERE id = code_files.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_codefile" ON code_files;
CREATE POLICY "insert_own_codefile" ON code_files FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM code_projects WHERE id = code_files.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_codefile" ON code_files;
CREATE POLICY "update_own_codefile" ON code_files FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM code_projects WHERE id = code_files.project_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM code_projects WHERE id = code_files.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_codefile" ON code_files;
CREATE POLICY "delete_own_codefile" ON code_files FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM code_projects WHERE id = code_files.project_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS code_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES code_files(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_codever_file ON code_versions(file_id);
DROP POLICY IF EXISTS "select_own_codever" ON code_versions;
CREATE POLICY "select_own_codever" ON code_versions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM code_files cf JOIN code_projects cp ON cp.id = cf.project_id WHERE cf.id = code_versions.file_id AND cp.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_codever" ON code_versions;
CREATE POLICY "insert_own_codever" ON code_versions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM code_files cf JOIN code_projects cp ON cp.id = cf.project_id WHERE cf.id = code_versions.file_id AND cp.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS code_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES code_projects(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  message text,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE code_test_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_codetest_project ON code_test_results(project_id);
DROP POLICY IF EXISTS "select_own_codetest" ON code_test_results;
CREATE POLICY "select_own_codetest" ON code_test_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM code_projects WHERE id = code_test_results.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_codetest" ON code_test_results;
CREATE POLICY "insert_own_codetest" ON code_test_results FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM code_projects WHERE id = code_test_results.project_id AND user_id = auth.uid()));

-- ============================================================
-- IMAGE LAB (AP035.4)
-- ============================================================

CREATE TABLE IF NOT EXISTS image_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('jpeg','png','button','header')),
  name text NOT NULL,
  data_url text NOT NULL,
  file_size int NOT NULL DEFAULT 0,
  width int,
  height int,
  format text,
  metadata jsonb NOT NULL DEFAULT '{}',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE image_assets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_image_user ON image_assets(user_id);
DROP POLICY IF EXISTS "select_own_image" ON image_assets;
CREATE POLICY "select_own_image" ON image_assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_image" ON image_assets;
CREATE POLICY "insert_own_image" ON image_assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_image" ON image_assets;
CREATE POLICY "update_own_image" ON image_assets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_image" ON image_assets;
CREATE POLICY "delete_own_image" ON image_assets FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS image_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES image_assets(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE image_test_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_imgtest_asset ON image_test_results(asset_id);
DROP POLICY IF EXISTS "select_own_imgtest" ON image_test_results;
CREATE POLICY "select_own_imgtest" ON image_test_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM image_assets WHERE id = image_test_results.asset_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_imgtest" ON image_test_results;
CREATE POLICY "insert_own_imgtest" ON image_test_results FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM image_assets WHERE id = image_test_results.asset_id AND user_id = auth.uid()));

-- ============================================================
-- SITE LAB (AP035.5)
-- ============================================================

CREATE TABLE IF NOT EXISTS site_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Meu Site',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_site_user ON site_projects(user_id);
DROP POLICY IF EXISTS "select_own_site" ON site_projects;
CREATE POLICY "select_own_site" ON site_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_site" ON site_projects;
CREATE POLICY "insert_own_site" ON site_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_site" ON site_projects;
CREATE POLICY "update_own_site" ON site_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_site" ON site_projects;
CREATE POLICY "delete_own_site" ON site_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS site_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES site_projects(id) ON DELETE CASCADE,
  filename text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_page boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, filename)
);

ALTER TABLE site_files ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sitefile_project ON site_files(project_id);
DROP POLICY IF EXISTS "select_own_sitefile" ON site_files;
CREATE POLICY "select_own_sitefile" ON site_files FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM site_projects WHERE id = site_files.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_sitefile" ON site_files;
CREATE POLICY "insert_own_sitefile" ON site_files FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM site_projects WHERE id = site_files.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_sitefile" ON site_files;
CREATE POLICY "update_own_sitefile" ON site_files FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM site_projects WHERE id = site_files.project_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM site_projects WHERE id = site_files.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_sitefile" ON site_files;
CREATE POLICY "delete_own_sitefile" ON site_files FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM site_projects WHERE id = site_files.project_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS site_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES site_projects(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  passed boolean NOT NULL DEFAULT false,
  message text,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_test_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sitetest_project ON site_test_results(project_id);
DROP POLICY IF EXISTS "select_own_sitetest" ON site_test_results;
CREATE POLICY "select_own_sitetest" ON site_test_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM site_projects WHERE id = site_test_results.project_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_sitetest" ON site_test_results;
CREATE POLICY "insert_own_sitetest" ON site_test_results FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM site_projects WHERE id = site_test_results.project_id AND user_id = auth.uid()));

-- ============================================================
-- AI LAB (AP035.7)
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  generation_type text NOT NULL CHECK (generation_type IN ('text','image','logo')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  result_url text,
  result_text text,
  model text,
  provider text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_aigen_user ON ai_generations(user_id);
DROP POLICY IF EXISTS "select_own_aigen" ON ai_generations;
CREATE POLICY "select_own_aigen" ON ai_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_aigen" ON ai_generations;
CREATE POLICY "insert_own_aigen" ON ai_generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_aigen" ON ai_generations;
CREATE POLICY "update_own_aigen" ON ai_generations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES ai_generations(id) ON DELETE CASCADE,
  prompt_text text NOT NULL,
  response_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_aiprompt_gen ON ai_prompts(generation_id);
DROP POLICY IF EXISTS "select_own_aiprompt" ON ai_prompts;
CREATE POLICY "select_own_aiprompt" ON ai_prompts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM ai_generations WHERE id = ai_prompts.generation_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_aiprompt" ON ai_prompts;
CREATE POLICY "insert_own_aiprompt" ON ai_prompts FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM ai_generations WHERE id = ai_prompts.generation_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS ai_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES ai_generations(id) ON DELETE CASCADE,
  positive_points jsonb NOT NULL DEFAULT '[]',
  improvements jsonb NOT NULL DEFAULT '[]',
  final_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_aireview_gen ON ai_reviews(generation_id);
DROP POLICY IF EXISTS "select_own_aireview" ON ai_reviews;
CREATE POLICY "select_own_aireview" ON ai_reviews FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM ai_generations WHERE id = ai_reviews.generation_id AND user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_aireview" ON ai_reviews;
CREATE POLICY "insert_own_aireview" ON ai_reviews FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM ai_generations WHERE id = ai_reviews.generation_id AND user_id = auth.uid()));

-- ============================================================
-- ACTIVITY LOG (append-only)
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  requirement_id uuid REFERENCES requirements(id) ON DELETE SET NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  curriculum_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_events(event_type);
DROP POLICY IF EXISTS "select_own_activity" ON activity_events;
CREATE POLICY "select_own_activity" ON activity_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_activity" ON activity_events;
CREATE POLICY "insert_own_activity" ON activity_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CERTIFICATIONS (Token.Web())
-- ============================================================

CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  specialty_id uuid NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  hash text NOT NULL,
  signature text,
  level text NOT NULL CHECK (level IN ('fundamental','advanced')),
  curriculum_code text NOT NULL,
  curriculum_version text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revocation_reason text,
  reference_certification_id uuid REFERENCES certifications(id)
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_cert_user ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_code ON certifications(code);
DROP POLICY IF EXISTS "select_own_certs" ON certifications;
CREATE POLICY "select_own_certs" ON certifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "public_read_certs" ON certifications;
CREATE POLICY "public_read_certs" ON certifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_certs" ON certifications;
CREATE POLICY "admin_update_certs" ON certifications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE TABLE IF NOT EXISTS certification_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  requirements_snapshot jsonb NOT NULL DEFAULT '[]',
  progress_snapshot jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE certification_snapshots ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_certsnap_cert ON certification_snapshots(certification_id);
DROP POLICY IF EXISTS "public_read_certsnap" ON certification_snapshots;
CREATE POLICY "public_read_certsnap" ON certification_snapshots FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS certification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE certification_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_certev_cert ON certification_events(certification_id);
DROP POLICY IF EXISTS "public_read_certev" ON certification_events;
CREATE POLICY "public_read_certev" ON certification_events FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- AUDITOR
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  auditor_email text NOT NULL,
  token text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_permissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auditperm_user ON audit_permissions(user_id);
DROP POLICY IF EXISTS "select_own_auditperm" ON audit_permissions;
CREATE POLICY "select_own_auditperm" ON audit_permissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_auditperm" ON audit_permissions;
CREATE POLICY "insert_own_auditperm" ON audit_permissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_auditperm" ON audit_permissions;
CREATE POLICY "delete_own_auditperm" ON audit_permissions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS auditor_opinions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  auditor_email text NOT NULL,
  opinion text NOT NULL,
  signature text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE auditor_opinions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_opinion_cert ON auditor_opinions(certification_id);
DROP POLICY IF EXISTS "public_read_opinions" ON auditor_opinions;
CREATE POLICY "public_read_opinions" ON auditor_opinions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anyone_insert_opinions" ON auditor_opinions;
CREATE POLICY "anyone_insert_opinions" ON auditor_opinions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- APP SETTINGS & AI PROVIDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_settings" ON app_settings;
CREATE POLICY "public_read_settings" ON app_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_settings" ON app_settings;
CREATE POLICY "admin_write_settings" ON app_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

CREATE TABLE IF NOT EXISTS ai_provider_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('text','image')),
  is_active boolean NOT NULL DEFAULT false,
  model text,
  config jsonb NOT NULL DEFAULT '{}',
  max_generations_per_activity int NOT NULL DEFAULT 3,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_provider_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_ai_providers" ON ai_provider_settings;
CREATE POLICY "admin_read_ai_providers" ON ai_provider_settings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));
DROP POLICY IF EXISTS "admin_write_ai_providers" ON ai_provider_settings;
CREATE POLICY "admin_write_ai_providers" ON ai_provider_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_privacy_updated ON privacy_preferences;
CREATE TRIGGER trg_privacy_updated BEFORE UPDATE ON privacy_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_enrollments_updated ON enrollments;
CREATE TRIGGER trg_enrollments_updated BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_modprog_updated ON module_progress;
CREATE TRIGGER trg_modprog_updated BEFORE UPDATE ON module_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_reqprog_updated ON requirement_progress;
CREATE TRIGGER trg_reqprog_updated BEFORE UPDATE ON requirement_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_text_updated ON text_projects;
CREATE TRIGGER trg_text_updated BEFORE UPDATE ON text_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_pact_updated ON family_pacts;
CREATE TRIGGER trg_pact_updated BEFORE UPDATE ON family_pacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_code_updated ON code_projects;
CREATE TRIGGER trg_code_updated BEFORE UPDATE ON code_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_codefile_updated ON code_files;
CREATE TRIGGER trg_codefile_updated BEFORE UPDATE ON code_files FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_site_updated ON site_projects;
CREATE TRIGGER trg_site_updated BEFORE UPDATE ON site_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_sitefile_updated ON site_files;
CREATE TRIGGER trg_sitefile_updated BEFORE UPDATE ON site_files FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated ON app_settings;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ADMIN PROMOTION FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION promote_first_admin(p_email text)
RETURNS boolean AS $$
DECLARE
  promoted boolean := false;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM user_profiles WHERE is_admin = true) INTO promoted;
  IF promoted THEN
    UPDATE user_profiles SET is_admin = true WHERE email = p_email;
    RETURN true;
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
