-- Phase 3: Supabase-backed app catalog

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.apps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id),
  icon_type text,
  rating numeric DEFAULT 0,
  downloads_count integer DEFAULT 0,
  is_free boolean DEFAULT true,
  price text DEFAULT '0đ',
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.app_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE,
  version_string text NOT NULL,
  release_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  changelog text,
  UNIQUE (app_id, version_string)
);

CREATE UNIQUE INDEX IF NOT EXISTS app_versions_app_id_version_string_idx
  ON public.app_versions (app_id, version_string);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
DROP POLICY IF EXISTS "Apps are viewable by everyone." ON public.apps;
DROP POLICY IF EXISTS "App versions are viewable by everyone." ON public.app_versions;
DROP POLICY IF EXISTS "Admins can manage categories." ON public.categories;
DROP POLICY IF EXISTS "Admins can manage apps." ON public.apps;
DROP POLICY IF EXISTS "Admins can manage app versions." ON public.app_versions;

CREATE POLICY "Categories are viewable by everyone."
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Apps are viewable by everyone."
  ON public.apps FOR SELECT
  USING (true);

CREATE POLICY "App versions are viewable by everyone."
  ON public.app_versions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories."
  ON public.categories FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage apps."
  ON public.apps FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage app versions."
  ON public.app_versions FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.categories (id, name, slug) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Hệ thống', 'system'),
  ('10000000-0000-0000-0000-000000000002', 'Bảo mật', 'security'),
  ('10000000-0000-0000-0000-000000000003', 'Phát triển', 'development'),
  ('10000000-0000-0000-0000-000000000004', 'Tự động hóa', 'automation')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.apps (
  id,
  name,
  description,
  category_id,
  icon_type,
  rating,
  downloads_count,
  is_free,
  price,
  tags,
  created_at
) VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'SN Terminal Pro',
    'Trình giả lập terminal tối tân với hiệu năng GPU cao, tích hợp AI autocomplete và giao diện tab linh hoạt cho lập trình viên.',
    '10000000-0000-0000-0000-000000000001',
    'terminal',
    4.9,
    8400,
    true,
    '0đ',
    ARRAY['GPU Accelerated', 'AI Assistant', 'Cross Platform'],
    '2026-06-24T00:00:00Z'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'SN Guardian Shield',
    'Hệ thống quét mã độc thời gian thực, phát hiện xâm nhập cổng mạng và bảo mật tài sản số toàn diện cho máy chủ doanh nghiệp.',
    '10000000-0000-0000-0000-000000000002',
    'shield',
    4.8,
    3200,
    false,
    '350.000đ',
    ARRAY['Real-time Scan', 'Network Monitor', 'Zero-Trust'],
    '2026-06-12T00:00:00Z'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'SN Code Compiler',
    'Bộ công cụ đóng gói và tối ưu hóa mã nguồn siêu tốc, thay thế trực tiếp webpack/esbuild với hiệu năng tốt hơn tới 40%.',
    '10000000-0000-0000-0000-000000000003',
    'code',
    4.7,
    12800,
    true,
    '0đ',
    ARRAY['Build Tool', 'Fast Compiling', 'Rust Powered'],
    '2026-07-01T00:00:00Z'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'SN Flow Automation',
    'Nền tảng tự động hóa quy trình nghiệp vụ thông minh, kết nối APIs và quản lý tác vụ nền không cần viết mã.',
    '10000000-0000-0000-0000-000000000004',
    'zap',
    4.9,
    2100,
    false,
    '590.000đ',
    ARRAY['No-Code Workflow', 'API Integrations', 'Cron Tasks'],
    '2026-05-28T00:00:00Z'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'SN Kernel Tuner',
    'Quản lý xung nhịp CPU, giải phóng RAM thông minh và tối ưu hóa hệ điều hành Windows/Linux cho các tác vụ tải nặng.',
    '10000000-0000-0000-0000-000000000001',
    'cpu',
    4.6,
    6700,
    true,
    '0đ',
    ARRAY['OS Optimization', 'RAM Cleaner', 'CPU Governor'],
    '2026-06-15T00:00:00Z'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  icon_type = EXCLUDED.icon_type,
  rating = EXCLUDED.rating,
  downloads_count = EXCLUDED.downloads_count,
  is_free = EXCLUDED.is_free,
  price = EXCLUDED.price,
  tags = EXCLUDED.tags;

INSERT INTO public.app_versions (app_id, version_string, release_date, changelog) VALUES
  ('20000000-0000-0000-0000-000000000001', 'v2.4.1', '2026-06-24T00:00:00Z', 'Cải thiện hiệu năng GPU rendering và AI autocomplete.'),
  ('20000000-0000-0000-0000-000000000002', 'v1.8.0', '2026-06-12T00:00:00Z', 'Bổ sung phát hiện xâm nhập cổng mạng theo thời gian thực.'),
  ('20000000-0000-0000-0000-000000000003', 'v3.1.2', '2026-07-01T00:00:00Z', 'Tối ưu pipeline build và giảm thời gian biên dịch.'),
  ('20000000-0000-0000-0000-000000000004', 'v2.0.0', '2026-05-28T00:00:00Z', 'Ra mắt workflow no-code và lịch cron nền.'),
  ('20000000-0000-0000-0000-000000000005', 'v1.1.5', '2026-06-15T00:00:00Z', 'Cải thiện CPU governor và RAM cleaner.')
ON CONFLICT (app_id, version_string) DO UPDATE SET
  release_date = EXCLUDED.release_date,
  changelog = EXCLUDED.changelog;
