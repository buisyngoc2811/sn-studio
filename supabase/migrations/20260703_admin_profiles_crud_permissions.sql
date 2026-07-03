-- Ensure authenticated admin sessions can create, update, suspend, and delete profiles.
-- This complements the existing RLS policies used by Admin > User Management.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage profiles." ON public.profiles;

CREATE POLICY "Admins can manage profiles."
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN ('admin@gmail.com', 'admin@snstudio.vn')
    OR EXISTS (
      SELECT 1
      FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
    )
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@gmail.com', 'admin@snstudio.vn')
    OR EXISTS (
      SELECT 1
      FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
        AND admin_profile.role = 'admin'
    )
  );

NOTIFY pgrst, 'reload schema';
