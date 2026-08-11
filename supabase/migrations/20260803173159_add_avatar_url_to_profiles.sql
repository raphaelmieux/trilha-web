/*
# Add avatar_url column to user_profiles

1. Changes
- Added `avatar_url` (text, nullable) to `user_profiles` to store the public URL of the user's profile photo.
2. Security
- No RLS policy changes needed — the column is readable/writable by the owner through existing policies.
*/

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
