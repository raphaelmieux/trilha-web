/*
# Self-service password reset via security question

## Context
The original self-service reset (any e-mail, no verification) was closed off in the
previous migration and replaced with an admin-assisted flow. That's a reasonable
fallback but shouldn't be the *only* path — most users forgetting a password is a
routine event, not something that should always require a club leader's involvement.
This adds an account-owned security question/answer so `self-reset-password` (a new
edge function) can verify identity and let the user set a new password directly,
without needing SMTP/email at all.

## Changes
- `user_profiles.security_question_code`: one of a small fixed catalog defined in
  src/lib/securityQuestions.ts (not stored in the DB — the catalog is presentation
  only, this column just records which one the user picked).
- `user_profiles.security_answer_hash`: SHA-256 of the normalized answer, hashed
  client-side before it ever reaches the network. Not reversible, and — like
  email/is_admin — only readable by the row's owner or an admin (existing RLS
  policies on user_profiles already cover this; no policy changes needed here).
*/

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS security_question_code text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS security_answer_hash text;
