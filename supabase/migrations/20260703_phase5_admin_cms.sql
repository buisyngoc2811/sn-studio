-- Phase 5: Admin CMS storage policies for browser uploads.
-- Enables authenticated admins to upload and manage marketplace icons/files.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('app-icons', 'app-icons', true),
  ('app-files', 'app-files', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public app assets are readable." ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload app assets." ON storage.objects;
DROP POLICY IF EXISTS "Admins can update app assets." ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete app assets." ON storage.objects;

CREATE POLICY "Public app assets are readable."
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('app-icons', 'app-files'));

CREATE POLICY "Admins can upload app assets."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('app-icons', 'app-files')
    AND (
      (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Admins can update app assets."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('app-icons', 'app-files')
    AND (
      (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
  WITH CHECK (
    bucket_id IN ('app-icons', 'app-files')
    AND (
      (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Admins can delete app assets."
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('app-icons', 'app-files')
    AND (
      (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
