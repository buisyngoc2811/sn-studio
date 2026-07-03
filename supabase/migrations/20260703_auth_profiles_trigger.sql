-- Create public.profiles rows automatically for new Supabase Auth users.
-- Required by Admin > User Management.

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

CREATE OR REPLACE FUNCTION public.handle_new_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    display_name,
    role,
    status,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    split_part(NEW.email, '@', 1),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''),
      NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
      split_part(NEW.email, '@', 1)
    ),
    'user',
    'active',
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user_profile();

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
  users.id,
  users.email,
  split_part(users.email, '@', 1),
  COALESCE(
    NULLIF(users.raw_user_meta_data ->> 'display_name', ''),
    NULLIF(users.raw_user_meta_data ->> 'username', ''),
    split_part(users.email, '@', 1)
  ),
  CASE
    WHEN users.email = 'admin@gmail.com' THEN 'admin'
    ELSE 'user'
  END,
  'active',
  COALESCE(users.raw_user_meta_data ->> 'avatar_url', '')
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles
  WHERE profiles.id = users.id
)
ON CONFLICT (id) DO NOTHING;
