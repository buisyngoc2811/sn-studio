-- Phase 7: Real Marketplace Commerce & Licensing.
-- Idempotent migration for purchases, hashed licenses, download logging, and admin RPCs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.marketplace_versions
  ADD COLUMN IF NOT EXISTS file_size bigint DEFAULT 0 NOT NULL;

UPDATE public.marketplace_versions
SET file_size = COALESCE(file_size, 0);

ALTER TABLE public.marketplace_purchases
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed' NOT NULL,
  ADD COLUMN IF NOT EXISTS buyer_email text,
  ADD COLUMN IF NOT EXISTS buyer_username text,
  ADD COLUMN IF NOT EXISTS buyer_display_name text,
  ADD COLUMN IF NOT EXISTS item_price_snapshot text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL;

UPDATE public.marketplace_purchases p
SET
  buyer_email = COALESCE(p.buyer_email, pr.email),
  buyer_username = COALESCE(p.buyer_username, pr.username, split_part(pr.email, '@', 1)),
  buyer_display_name = COALESCE(p.buyer_display_name, pr.display_name, pr.username, split_part(pr.email, '@', 1))
FROM public.profiles pr
WHERE pr.id = p.user_id;

UPDATE public.marketplace_purchases p
SET item_price_snapshot = COALESCE(p.item_price_snapshot, mi.price)
FROM public.marketplace_items mi
WHERE mi.id = p.item_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'marketplace_purchases_status_check'
      AND conrelid = 'public.marketplace_purchases'::regclass
  ) THEN
    ALTER TABLE public.marketplace_purchases
      ADD CONSTRAINT marketplace_purchases_status_check
      CHECK (status IN ('completed', 'claimed', 'pending', 'refunded', 'revoked'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.marketplace_licenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id uuid NOT NULL UNIQUE REFERENCES public.marketplace_purchases(id) ON DELETE CASCADE,
  license_hash text NOT NULL UNIQUE,
  license_last4 text NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'marketplace_licenses_status_check'
      AND conrelid = 'public.marketplace_licenses'::regclass
  ) THEN
    ALTER TABLE public.marketplace_licenses
      ADD CONSTRAINT marketplace_licenses_status_check
      CHECK (status IN ('active', 'revoked', 'expired'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.marketplace_download_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.marketplace_versions(id) ON DELETE SET NULL,
  purchase_id uuid REFERENCES public.marketplace_purchases(id) ON DELETE SET NULL,
  download_path text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS marketplace_licenses_purchase_id_idx
  ON public.marketplace_licenses (purchase_id);

CREATE INDEX IF NOT EXISTS marketplace_licenses_status_idx
  ON public.marketplace_licenses (status);

CREATE INDEX IF NOT EXISTS marketplace_download_logs_user_id_idx
  ON public.marketplace_download_logs (user_id);

CREATE INDEX IF NOT EXISTS marketplace_download_logs_item_id_idx
  ON public.marketplace_download_logs (item_id);

CREATE INDEX IF NOT EXISTS marketplace_download_logs_created_at_idx
  ON public.marketplace_download_logs (created_at DESC);

INSERT INTO public.marketplace_licenses (
  purchase_id,
  license_hash,
  license_last4,
  status,
  revoked_at,
  created_at,
  updated_at
)
SELECT
  p.id,
  encode(digest(p.license_key, 'sha256'), 'hex'),
  right(p.license_key, 4),
  'active',
  NULL,
  p.purchase_date,
  p.purchase_date
FROM public.marketplace_purchases p
WHERE p.license_key IS NOT NULL
ON CONFLICT (purchase_id) DO NOTHING;

UPDATE public.marketplace_purchases
SET license_key = NULL
WHERE license_key IS NOT NULL;

ALTER TABLE public.marketplace_purchases
  DROP COLUMN IF EXISTS license_key;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(COALESCE(p.role, '')) = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.generate_marketplace_license_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  raw_key text;
BEGIN
  raw_key := upper(replace(gen_random_uuid()::text, '-', ''));
  RETURN format(
    '%s-%s-%s-%s',
    substr(raw_key, 1, 4),
    substr(raw_key, 5, 4),
    substr(raw_key, 9, 4),
    substr(raw_key, 13, 4)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.assert_marketplace_user_active()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  profile_status text;
BEGIN
  SELECT lower(COALESCE(p.status, 'active'))
    INTO profile_status
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;

  IF profile_status = 'banned' THEN
    RAISE EXCEPTION 'Tài khoản của bạn đã bị đình chỉ.' USING ERRCODE = '28000';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.purchase_marketplace_item(p_item_id uuid)
RETURNS TABLE (
  purchase_id uuid,
  item_id uuid,
  item_name text,
  purchase_status text,
  license_key text,
  license_status text,
  license_last4 text,
  download_path text,
  version_id uuid,
  version_string text,
  file_size bigint,
  created_at timestamptz,
  buyer_email text,
  buyer_username text,
  buyer_display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_price text;
  v_item_name text;
  v_download_path text;
  v_version_id uuid;
  v_version_string text;
  v_file_size bigint;
  v_buyer_email text;
  v_buyer_username text;
  v_buyer_display_name text;
  v_purchase_status text;
  v_purchase public.marketplace_purchases%ROWTYPE;
  v_license public.marketplace_licenses%ROWTYPE;
  v_license_key text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  PERFORM public.assert_marketplace_user_active();

  SELECT
    mi.name,
    mi.price,
    mi.download_path,
    mv.id,
    mv.version_string,
    COALESCE(mv.file_path, mi.download_path),
    COALESCE(mv.file_size, 0)
  INTO
    v_item_name,
    v_price,
    v_download_path,
    v_version_id,
    v_version_string,
    v_download_path,
    v_file_size
  FROM public.marketplace_items mi
  LEFT JOIN LATERAL (
    SELECT mv_inner.id, mv_inner.version_string, mv_inner.file_path, mv_inner.file_size
    FROM public.marketplace_versions mv_inner
    WHERE mv_inner.item_id = mi.id
    ORDER BY mv_inner.release_date DESC, mv_inner.created_at DESC
    LIMIT 1
  ) mv ON TRUE
  WHERE mi.id = p_item_id;

  IF v_item_name IS NULL THEN
    RAISE EXCEPTION 'Marketplace item not found.' USING ERRCODE = 'P0002';
  END IF;

  SELECT p.*
    INTO v_purchase
  FROM public.marketplace_purchases p
  WHERE p.user_id = v_user_id
    AND p.item_id = p_item_id
  LIMIT 1;

  IF FOUND THEN
    SELECT l.*
      INTO v_license
    FROM public.marketplace_licenses l
    WHERE l.purchase_id = v_purchase.id
    LIMIT 1;

    RETURN QUERY
    SELECT
      v_purchase.id,
      v_purchase.item_id,
      v_item_name,
      v_purchase.status,
      NULL::text,
      COALESCE(v_license.status, 'active'),
      COALESCE(v_license.license_last4, ''),
      v_download_path,
      v_version_id,
      v_version_string,
      v_file_size,
      v_purchase.purchase_date,
      v_purchase.buyer_email,
      v_purchase.buyer_username,
      v_purchase.buyer_display_name;
    RETURN;
  END IF;

  v_purchase_status := CASE
    WHEN lower(COALESCE(v_price, '0đ')) IN ('0đ', 'miễn phí') THEN 'claimed'
    ELSE 'completed'
  END;

  IF lower(COALESCE(v_price, '0đ')) NOT IN ('0đ', 'miễn phí') THEN
    RAISE EXCEPTION 'Purchase required before download.' USING ERRCODE = '28000';
  END IF;

  SELECT
    p.email,
    p.username,
    p.display_name
  INTO
    v_buyer_email,
    v_buyer_username,
    v_buyer_display_name
  FROM public.profiles p
  WHERE p.id = v_user_id
  LIMIT 1;

  INSERT INTO public.marketplace_purchases (
    user_id,
    item_id,
    status,
    buyer_email,
    buyer_username,
    buyer_display_name,
    item_price_snapshot,
    purchase_date,
    updated_at
  )
  VALUES (
    v_user_id,
    p_item_id,
    v_purchase_status,
    COALESCE(v_buyer_email, ''),
    COALESCE(v_buyer_username, split_part(COALESCE(v_buyer_email, ''), '@', 1)),
    COALESCE(v_buyer_display_name, split_part(COALESCE(v_buyer_email, ''), '@', 1)),
    v_price,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  RETURNING * INTO v_purchase;

  v_license_key := public.generate_marketplace_license_key();

  INSERT INTO public.marketplace_licenses (
    purchase_id,
    license_hash,
    license_last4,
    status,
    created_at,
    updated_at
  )
  VALUES (
    v_purchase.id,
    encode(digest(v_license_key, 'sha256'), 'hex'),
    right(v_license_key, 4),
    'active',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  RETURNING * INTO v_license;

  RETURN QUERY
  SELECT
    v_purchase.id,
    v_purchase.item_id,
    v_item_name,
    v_purchase.status,
    v_license_key,
    v_license.status,
    v_license.license_last4,
    v_download_path,
    v_version_id,
    v_version_string,
    v_file_size,
    v_purchase.purchase_date,
    v_purchase.buyer_email,
    v_purchase.buyer_username,
    v_purchase.buyer_display_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_marketplace_download(p_item_id uuid, p_version_id uuid DEFAULT NULL)
RETURNS TABLE (
  download_path text,
  downloads_count integer,
  purchase_id uuid,
  version_id uuid,
  version_string text,
  file_size bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_price text;
  v_download_path text;
  v_version_id uuid;
  v_version_string text;
  v_file_size bigint;
  v_purchase_id uuid;
  v_item_name text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  PERFORM public.assert_marketplace_user_active();

  SELECT
    mi.name,
    mi.price,
    COALESCE(mv_selected.file_path, mv_latest.file_path, mi.download_path),
    COALESCE(mv_selected.id, mv_latest.id),
    COALESCE(mv_selected.version_string, mv_latest.version_string),
    COALESCE(mv_selected.file_size, mv_latest.file_size, 0)
  INTO
    v_item_name,
    v_price,
    v_download_path,
    v_version_id,
    v_version_string,
    v_file_size
  FROM public.marketplace_items mi
  LEFT JOIN LATERAL (
    SELECT mv_inner.id, mv_inner.version_string, mv_inner.file_path, mv_inner.file_size
    FROM public.marketplace_versions mv_inner
    WHERE mv_inner.id = p_version_id
      AND mv_inner.item_id = mi.id
    LIMIT 1
  ) mv_selected ON TRUE
  LEFT JOIN LATERAL (
    SELECT mv_inner.id, mv_inner.version_string, mv_inner.file_path, mv_inner.file_size
    FROM public.marketplace_versions mv_inner
    WHERE mv_inner.item_id = mi.id
    ORDER BY mv_inner.release_date DESC, mv_inner.created_at DESC
    LIMIT 1
  ) mv_latest ON TRUE
  WHERE mi.id = p_item_id;

  IF v_item_name IS NULL THEN
    RAISE EXCEPTION 'Marketplace item not found.' USING ERRCODE = 'P0002';
  END IF;

  IF lower(COALESCE(v_price, '0đ')) NOT IN ('0đ', 'miễn phí') THEN
    SELECT p.id
      INTO v_purchase_id
    FROM public.marketplace_purchases p
    WHERE p.user_id = v_user_id
      AND p.item_id = p_item_id
      AND p.status IN ('completed', 'claimed')
    LIMIT 1;

    IF v_purchase_id IS NULL THEN
      RAISE EXCEPTION 'Purchase required before download.' USING ERRCODE = '28000';
    END IF;
  ELSE
    SELECT p.id
      INTO v_purchase_id
    FROM public.marketplace_purchases p
    WHERE p.user_id = v_user_id
      AND p.item_id = p_item_id
      AND p.status IN ('completed', 'claimed')
    LIMIT 1;

    IF v_purchase_id IS NULL THEN
      SELECT purchase_id
        INTO v_purchase_id
      FROM public.purchase_marketplace_item(p_item_id);
    END IF;
  END IF;

  INSERT INTO public.marketplace_download_logs (
    user_id,
    item_id,
    version_id,
    purchase_id,
    download_path
  )
  VALUES (
    v_user_id,
    p_item_id,
    v_version_id,
    v_purchase_id,
    v_download_path
  );

  UPDATE public.marketplace_items
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = p_item_id;

  RETURN QUERY
  SELECT
    v_download_path,
    (SELECT COALESCE(downloads_count, 0) FROM public.marketplace_items WHERE id = p_item_id),
    v_purchase_id,
    v_version_id,
    v_version_string,
    v_file_size;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_manage_marketplace_purchase(
  p_purchase_id uuid,
  p_purchase_status text DEFAULT NULL,
  p_license_status text DEFAULT NULL
)
RETURNS TABLE (
  purchase_id uuid,
  purchase_status text,
  license_status text,
  revoked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_admin_ok boolean;
  v_purchase public.marketplace_purchases%ROWTYPE;
  v_license public.marketplace_licenses%ROWTYPE;
BEGIN
  SELECT public.is_admin_user() INTO v_admin_ok;
  IF NOT COALESCE(v_admin_ok, false) THEN
    RAISE EXCEPTION 'Admin privileges required.' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_purchase
  FROM public.marketplace_purchases
  WHERE id = p_purchase_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase not found.' USING ERRCODE = 'P0002';
  END IF;

  IF p_purchase_status IS NOT NULL THEN
    UPDATE public.marketplace_purchases
    SET
      status = CASE
        WHEN lower(p_purchase_status) IN ('completed', 'claimed', 'pending', 'refunded', 'revoked') THEN lower(p_purchase_status)
        ELSE status
      END,
      updated_at = timezone('utc'::text, now())
    WHERE id = p_purchase_id
    RETURNING * INTO v_purchase;
  END IF;

  IF p_license_status IS NOT NULL THEN
    UPDATE public.marketplace_licenses
    SET
      status = CASE
        WHEN lower(p_license_status) IN ('active', 'revoked', 'expired') THEN lower(p_license_status)
        ELSE status
      END,
      revoked_at = CASE
        WHEN lower(p_license_status) = 'revoked' THEN timezone('utc'::text, now())
        ELSE revoked_at
      END,
      updated_at = timezone('utc'::text, now())
    WHERE purchase_id = p_purchase_id
    RETURNING * INTO v_license;
  ELSE
    SELECT *
      INTO v_license
    FROM public.marketplace_licenses
    WHERE purchase_id = p_purchase_id
    LIMIT 1;
  END IF;

  RETURN QUERY
  SELECT
    v_purchase.id,
    v_purchase.status,
    COALESCE(v_license.status, 'active'),
    v_license.revoked_at;
END;
$$;

ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_download_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own marketplace purchases." ON public.marketplace_purchases;
DROP POLICY IF EXISTS "Users can create own marketplace purchases." ON public.marketplace_purchases;
DROP POLICY IF EXISTS "Marketplace purchases are viewable by owner or admin." ON public.marketplace_purchases;

CREATE POLICY "Marketplace purchases are viewable by owner or admin."
  ON public.marketplace_purchases FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS "Marketplace licenses are viewable by owner or admin." ON public.marketplace_licenses;
CREATE POLICY "Marketplace licenses are viewable by owner or admin."
  ON public.marketplace_licenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.marketplace_purchases p
      WHERE p.id = purchase_id
        AND (
          p.user_id = auth.uid()
          OR public.is_admin_user()
        )
    )
  );

DROP POLICY IF EXISTS "Marketplace download logs are viewable by owner or admin." ON public.marketplace_download_logs;
CREATE POLICY "Marketplace download logs are viewable by owner or admin."
  ON public.marketplace_download_logs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user()
  );

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_marketplace_license_key() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assert_marketplace_user_active() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purchase_marketplace_item(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_marketplace_download(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_manage_marketplace_purchase(uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_marketplace_license_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.assert_marketplace_user_active() TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_marketplace_item(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_marketplace_download(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_manage_marketplace_purchase(uuid, text, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
