-- Fix Admin > User Management visibility.
-- Ensures public.profiles has the columns the frontend reads, backfills auth users,
-- and recreates RLS policies so selecting profiles returns every row.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' NOT NULL;

UPDATE public.profiles
SET status = lower(status)
WHERE status IS NOT NULL;

UPDATE public.profiles
SET status = 'active'
WHERE status IS NULL OR status NOT IN ('active', 'banned');

ALTER TABLE public.profiles
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'banned'));

INSERT INTO public.profiles (
  id,
  email,
  username,
  display_name,
  role,
  status,
  avatar_url
)
SELECT
  auth_users.id,
  auth_users.email,
  split_part(auth_users.email, '@', 1),
  COALESCE(
    NULLIF(auth_users.raw_user_meta_data ->> 'display_name', ''),
    NULLIF(auth_users.raw_user_meta_data ->> 'username', ''),
    split_part(auth_users.email, '@', 1)
  ),
  CASE WHEN auth_users.email = 'admin@gmail.com' THEN 'admin' ELSE 'user' END,
  'active',
  COALESCE(auth_users.raw_user_meta_data ->> 'avatar_url', '')
FROM auth.users auth_users
WHERE auth_users.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles
SET
  username = COALESCE(NULLIF(username, ''), split_part(email, '@', 1)),
  display_name = COALESCE(NULLIF(display_name, ''), NULLIF(username, ''), split_part(email, '@', 1)),
  role = COALESCE(NULLIF(role, ''), 'user'),
  avatar_url = COALESCE(avatar_url, ''),
  status = COALESCE(status, 'active');

UPDATE public.profiles
SET
  username = 'admin',
  display_name = 'admin',
  email = 'admin@gmail.com',
  role = 'admin',
  status = 'active'
WHERE email = 'admin@gmail.com'
   OR username = 'admin';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage profiles."
  ON public.profiles FOR ALL
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
