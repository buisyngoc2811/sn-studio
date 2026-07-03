-- Safe profiles access model:
-- - authenticated users can read all profiles
-- - users can update only their own profile
-- - admin CRUD goes through SECURITY DEFINER RPC
-- - no recursive RLS checks on public.profiles

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
  END LOOP;
END;
$$;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
REVOKE INSERT, DELETE ON TABLE public.profiles FROM authenticated;

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP FUNCTION IF EXISTS public.admin_manage_profile(text, uuid, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.admin_manage_profile(
  action text,
  profile_id uuid,
  username text DEFAULT NULL,
  display_name text DEFAULT NULL,
  email text DEFAULT NULL,
  role text DEFAULT NULL,
  status text DEFAULT NULL,
  avatar_url text DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  admin_role text;
  managed_profile public.profiles%ROWTYPE;
  normalized_status text;
  normalized_role text;
  normalized_username text;
  normalized_display_name text;
  normalized_email text;
  normalized_avatar_url text;
BEGIN
  SELECT p.role
    INTO admin_role
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;

  IF admin_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Admin privileges required.' USING ERRCODE = '42501';
  END IF;

  normalized_username := NULLIF(BTRIM(COALESCE(username, '')), '');
  normalized_email := NULLIF(BTRIM(COALESCE(email, '')), '');
  normalized_display_name := NULLIF(BTRIM(COALESCE(display_name, '')), '');
  normalized_avatar_url := NULLIF(BTRIM(COALESCE(avatar_url, '')), '');
  normalized_role := CASE
    WHEN LOWER(COALESCE(role, 'user')) = 'admin' THEN 'admin'
    WHEN LOWER(COALESCE(role, 'user')) = 'developer' THEN 'developer'
    ELSE 'user'
  END;
  normalized_status := CASE
    WHEN LOWER(COALESCE(status, 'active')) = 'banned' THEN 'banned'
    ELSE 'active'
  END;

  IF action = 'delete' THEN
    DELETE FROM public.profiles
    WHERE id = profile_id
    RETURNING * INTO managed_profile;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002';
    END IF;

    RETURN managed_profile;
  ELSIF action = 'suspend' THEN
    UPDATE public.profiles
    SET status = normalized_status
    WHERE id = profile_id
    RETURNING * INTO managed_profile;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002';
    END IF;

    RETURN managed_profile;
  ELSIF action = 'upsert' THEN
    INSERT INTO public.profiles (
      id,
      username,
      display_name,
      email,
      role,
      status,
      avatar_url
    )
    VALUES (
      COALESCE(profile_id, gen_random_uuid()),
      COALESCE(normalized_username, split_part(COALESCE(normalized_email, ''), '@', 1)),
      COALESCE(normalized_display_name, normalized_username, split_part(COALESCE(normalized_email, ''), '@', 1)),
      normalized_email,
      normalized_role,
      normalized_status,
      normalized_avatar_url
    )
    ON CONFLICT (id) DO UPDATE
    SET
      username = EXCLUDED.username,
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      avatar_url = EXCLUDED.avatar_url
    RETURNING * INTO managed_profile;

    RETURN managed_profile;
  ELSE
    RAISE EXCEPTION 'Unsupported action: %', action USING ERRCODE = '22023';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_manage_profile(text, uuid, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_manage_profile(text, uuid, text, text, text, text, text, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
