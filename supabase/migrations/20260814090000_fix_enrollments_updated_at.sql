/*
  Fix: every UPDATE on enrollments was failing.

  1. The bug

  `trg_enrollments_updated BEFORE UPDATE ON enrollments` calls
  `update_updated_at()`, which assigns `NEW.updated_at = now()` — but the
  enrollments table was created without an `updated_at` column. Postgres raises
  42703 ("record NEW has no field updated_at") and the whole statement aborts.

  Every other table carrying that trigger has the column; enrollments was the
  only one missing it, which is why this went unnoticed.

  2. What it broke

  `updateEnrollmentActivity` in src/lib/progress.ts runs an UPDATE on enrollments
  every time a student finishes a lesson or a lab, to add XP and advance the
  streak. That UPDATE has been failing since the schema was created, and the
  result is not checked, so it failed silently: XP and streak_days never moved
  from whatever they were seeded with. The gamification looked like it worked
  because the numbers were non-zero, not because anything was recording.

  Found while restoring the demonstration account — the reset script hit the same
  trigger, which is the only reason the error surfaced at all.

  3. The fix

  Add the column the trigger has always expected. Backfilled from started_at so
  existing rows carry a sensible timestamp rather than the moment of migration.
*/

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE enrollments SET updated_at = COALESCE(completed_at, started_at, created_at)
WHERE updated_at IS NULL OR updated_at > now();

/*
  Guard against the same mistake returning.

  The trigger is attached by name in the schema migration, so a future table can
  pick it up and be broken the same way. This raises at migration time instead of
  at the first UPDATE a student triggers.
*/
DO $$
DECLARE
  v_broken text;
BEGIN
  SELECT string_agg(c.relname, ', ') INTO v_broken
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_proc p ON p.oid = t.tgfoid
  WHERE p.proname = 'update_updated_at'
    AND NOT t.tgisinternal
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema = 'public'
        AND col.table_name = c.relname
        AND col.column_name = 'updated_at'
    );

  IF v_broken IS NOT NULL THEN
    RAISE EXCEPTION 'Tabelas com o gatilho update_updated_at e sem a coluna updated_at: %', v_broken;
  END IF;
END $$;
