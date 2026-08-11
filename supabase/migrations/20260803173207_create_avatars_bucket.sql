/*
# Create avatars storage bucket

1. New Storage
- `avatars` bucket: public read, owner-scoped upload for profile photos.
2. Security
- Public SELECT (anyone can view avatars).
- INSERT/UPDATE/DELETE scoped to the authenticated owner via storage policies.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth upload avatars" ON storage.objects;
CREATE POLICY "Auth upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Owner update avatars" ON storage.objects;
CREATE POLICY "Owner update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid())
WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "Owner delete avatars" ON storage.objects;
CREATE POLICY "Owner delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());
