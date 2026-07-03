-- Provision the canonical administrator account.
-- Run this in Supabase SQL Editor with database owner privileges.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_user_id uuid;
  identity_id_type text;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@gmail.com'
  LIMIT 1;

  IF admin_user_id IS NULL THEN
    admin_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@gmail.com',
      crypt('01022004', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"admin","display_name":"admin","role":"admin"}'::jsonb,
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = crypt('01022004', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = '{"username":"admin","display_name":"admin","role":"admin"}'::jsonb,
      updated_at = now(),
      deleted_at = NULL,
      banned_until = NULL
    WHERE id = admin_user_id;
  END IF;

  DELETE FROM auth.identities
  WHERE user_id = admin_user_id
    AND provider = 'email';

  SELECT data_type INTO identity_id_type
  FROM information_schema.columns
  WHERE table_schema = 'auth'
    AND table_name = 'identities'
    AND column_name = 'id';

  IF identity_id_type = 'uuid' THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text,
        'email', 'admin@gmail.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      admin_user_id::text,
      now(),
      now(),
      now()
    );
  ELSE
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id::text,
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text,
        'email', 'admin@gmail.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      admin_user_id::text,
      now(),
      now(),
      now()
    );
  END IF;

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    email,
    role,
    avatar_url
  )
  VALUES (
    admin_user_id,
    'admin',
    'admin',
    'admin@gmail.com',
    'admin',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
END $$;
