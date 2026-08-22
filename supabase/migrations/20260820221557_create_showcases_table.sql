/*
# Create showcases table (single-tenant, no auth)

1. New Tables
- `showcases`
  - `id` (uuid, primary key) — unique identifier used in the shareable URL (/reel/:id)
  - `source_type` (text) — 'url' or 'manual', indicates how the product was submitted
  - `source_url` (text, nullable) — the original product URL if provided
  - `original_title` (text, not null) — the real product title as submitted by the user
  - `original_price` (text, nullable) — the real product price as submitted
  - `original_description` (text, nullable) — the real product description as submitted
  - `image_url` (text, nullable) — public URL of the stored product image
  - `image_storage_path` (text, nullable) — path within the Supabase storage bucket
  - `generated_headline` (text, nullable) — AI-generated punchy headline
  - `generated_blurbs` (jsonb, nullable) — array of 2-3 AI-generated benefit blurbs
  - `theme` (jsonb, nullable) — extracted color palette {primary, accent, background, text}
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `showcases`.
- This is a public, no-auth portfolio tool — all showcases are intentionally shared/public.
- Allow anon + authenticated full CRUD with USING (true) / WITH CHECK (true).

3. Notes
- No user_id column — this is a single-tenant public app with no sign-in.
- The image is stored in a Supabase storage bucket 'showcase-images' (created separately).
- Every generated showcase is saved and retrievable via /reel/:id.
*/

CREATE TABLE IF NOT EXISTS showcases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL DEFAULT 'manual',
  source_url text,
  original_title text NOT NULL,
  original_price text,
  original_description text,
  image_url text,
  image_storage_path text,
  generated_headline text,
  generated_blurbs jsonb,
  theme jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE showcases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_showcases" ON showcases;
CREATE POLICY "anon_select_showcases" ON showcases FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_showcases" ON showcases;
CREATE POLICY "anon_insert_showcases" ON showcases FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_showcases" ON showcases;
CREATE POLICY "anon_update_showcases" ON showcases FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_showcases" ON showcases;
CREATE POLICY "anon_delete_showcases" ON showcases FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_showcases_created_at ON showcases (created_at DESC);
