/*
# Add INSERT policy for certifications table

## Problem
The certifications table had no INSERT policy for regular authenticated users.
Only admin UPDATE and public SELECT existed. This meant issueCertification()
silently failed — the INSERT was blocked by RLS, so no certification was ever
saved. The final exam appeared to work (local UI state changed) but on reload
the cert was gone.

## Changes
1. Security
   - Add `insert_own_certs` INSERT policy: authenticated users can insert
     certifications where `user_id = auth.uid()`.
   - Add `select_own_certs` is redundant with `public_read_certs` but kept
     for clarity — no change needed there.

## Notes
- The existing `public_read_certs` SELECT policy already allows everyone to
  read certifications (intentional for public verification).
- The existing `admin_update_certs` UPDATE policy remains unchanged.
- No DELETE policy is added — certifications should not be deletable by users.
*/

DROP POLICY IF EXISTS "insert_own_certs" ON certifications;
CREATE POLICY "insert_own_certs"
ON certifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
