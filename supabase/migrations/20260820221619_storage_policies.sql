/*
# Storage bucket policies for showcase-images

1. Security
- The 'showcase-images' bucket is public (anyone can read generated showcase images).
- Allow anon + authenticated to upload, read, and delete images.
- This is a public portfolio tool with no auth — images are intentionally public.

2. Policies
- SELECT: anyone can read images (public bucket)
- INSERT: anyone can upload (anon + authenticated)
- UPDATE: anyone can update
- DELETE: anyone can delete
*/

DROP POLICY IF EXISTS "anon_read_showcase_images" ON storage.objects;
CREATE POLICY "anon_read_showcase_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'showcase-images');

DROP POLICY IF EXISTS "anon_insert_showcase_images" ON storage.objects;
CREATE POLICY "anon_insert_showcase_images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'showcase-images');

DROP POLICY IF EXISTS "anon_update_showcase_images" ON storage.objects;
CREATE POLICY "anon_update_showcase_images" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'showcase-images') WITH CHECK (bucket_id = 'showcase-images');

DROP POLICY IF EXISTS "anon_delete_showcase_images" ON storage.objects;
CREATE POLICY "anon_delete_showcase_images" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'showcase-images');
