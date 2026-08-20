/*
  Record which official club a profile belongs to.

  The club was free text, so "Olho de Tigre", "olho de tigre" and "Clube Olho do
  Tigri" were three different clubs as far as the platform was concerned. That
  matters here more than it usually would: the competency report is handed to a
  club's leadership to register the specialty, and the admin export groups
  students by club so a leader can find their own.

  The three columns below come from clubes.adventistas.org — the South American
  Division's own directory, the same source the "Encontre o Clube" page uses.
  `club` keeps holding the readable name so nothing that already reads it breaks;
  these add the identity behind it.

  Nullable on purpose: registration must not fail because the portal is down, and
  the accounts that already exist have no code.
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS club_code text,
  ADD COLUMN IF NOT EXISTS club_city text,
  ADD COLUMN IF NOT EXISTS club_association text;

COMMENT ON COLUMN user_profiles.club_code IS
  'Código do clube no portal clubes.adventistas.org. Nulo quando o clube foi digitado à mão.';

CREATE INDEX IF NOT EXISTS idx_profiles_club_code ON user_profiles(club_code);

/*
  The public view is what the certificate and the leaderboard read, and it
  deliberately excludes e-mail and is_admin. The club a student belongs to is
  already printed on their report, so exposing the validated name and city adds
  nothing that was not public — and it lets the verification page state which
  club issued the work.
*/
DROP VIEW IF EXISTS public_profiles;
CREATE VIEW public_profiles
WITH (security_invoker = true)
AS SELECT
  id, display_name, username, club, unit, public_name_form, avatar_url,
  club_code, club_city, club_association
FROM user_profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;
