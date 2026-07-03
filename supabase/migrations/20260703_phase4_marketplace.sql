-- Phase 4 Marketplace schema required by src/lib/marketplace.ts and CartDrawer.
-- Run this in the Supabase SQL editor for the project currently used by .env.local.

CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  label text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.marketplace_categories(id),
  name text NOT NULL,
  description text,
  price text DEFAULT '0đ',
  seller text DEFAULT 'SN Studio',
  badge text,
  icon_type text DEFAULT 'puzzle',
  icon_path text,
  download_path text,
  cover_path text,
  screenshots text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  downloads_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketplace_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  version_string text NOT NULL,
  release_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  changelog text,
  file_path text,
  UNIQUE (item_id, version_string)
);

CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text DEFAULT 'Người dùng SN',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketplace_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  license_key text NOT NULL,
  purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS marketplace_items_category_id_idx
  ON public.marketplace_items (category_id);

CREATE INDEX IF NOT EXISTS marketplace_versions_item_id_idx
  ON public.marketplace_versions (item_id);

CREATE INDEX IF NOT EXISTS marketplace_reviews_item_id_idx
  ON public.marketplace_reviews (item_id);

CREATE INDEX IF NOT EXISTS marketplace_purchases_user_id_idx
  ON public.marketplace_purchases (user_id);

CREATE INDEX IF NOT EXISTS marketplace_purchases_item_id_idx
  ON public.marketplace_purchases (item_id);

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Marketplace categories are viewable by everyone." ON public.marketplace_categories;
DROP POLICY IF EXISTS "Marketplace items are viewable by everyone." ON public.marketplace_items;
DROP POLICY IF EXISTS "Marketplace versions are viewable by everyone." ON public.marketplace_versions;
DROP POLICY IF EXISTS "Marketplace reviews are viewable by everyone." ON public.marketplace_reviews;
DROP POLICY IF EXISTS "Authenticated users can create marketplace reviews." ON public.marketplace_reviews;
DROP POLICY IF EXISTS "Users can view own marketplace purchases." ON public.marketplace_purchases;
DROP POLICY IF EXISTS "Users can create own marketplace purchases." ON public.marketplace_purchases;
DROP POLICY IF EXISTS "Admins can manage marketplace categories." ON public.marketplace_categories;
DROP POLICY IF EXISTS "Admins can manage marketplace items." ON public.marketplace_items;
DROP POLICY IF EXISTS "Admins can manage marketplace versions." ON public.marketplace_versions;
DROP POLICY IF EXISTS "Admins can manage marketplace reviews." ON public.marketplace_reviews;

CREATE POLICY "Marketplace categories are viewable by everyone."
  ON public.marketplace_categories FOR SELECT
  USING (true);

CREATE POLICY "Marketplace items are viewable by everyone."
  ON public.marketplace_items FOR SELECT
  USING (true);

CREATE POLICY "Marketplace versions are viewable by everyone."
  ON public.marketplace_versions FOR SELECT
  USING (true);

CREATE POLICY "Marketplace reviews are viewable by everyone."
  ON public.marketplace_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create marketplace reviews."
  ON public.marketplace_reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own marketplace purchases."
  ON public.marketplace_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own marketplace purchases."
  ON public.marketplace_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage marketplace categories."
  ON public.marketplace_categories FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage marketplace items."
  ON public.marketplace_items FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage marketplace versions."
  ON public.marketplace_versions FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage marketplace reviews."
  ON public.marketplace_reviews FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@snstudio.vn'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('app-icons', 'app-icons', true),
  ('app-files', 'app-files', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO public.marketplace_categories (id, name, slug, label) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Themes', 'themes', 'Giao diện'),
  ('30000000-0000-0000-0000-000000000002', 'Plugins', 'plugins', 'Plugin mở rộng'),
  ('30000000-0000-0000-0000-000000000003', 'Tools', 'tools', 'Công cụ bổ trợ'),
  ('30000000-0000-0000-0000-000000000004', 'Extensions', 'extensions', 'Tiện ích')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  label = EXCLUDED.label;

INSERT INTO public.marketplace_items (
  id,
  category_id,
  name,
  description,
  price,
  seller,
  badge,
  icon_type,
  icon_path,
  download_path,
  cover_path,
  screenshots,
  tags,
  downloads_count,
  created_at
) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Cyberpunk Red Neon Theme',
    'Chủ đề màu sắc cực chất phong cách Neon Cyberpunk dành cho SN Terminal và VS Code.',
    '99.000đ',
    'SN Design Team',
    'Phổ biến',
    'palette',
    'marketplace/cyberpunk-red/icon.svg',
    'marketplace/cyberpunk-red/cyberpunk-red-theme.zip',
    'marketplace/cyberpunk-red/cover.png',
    ARRAY['marketplace/cyberpunk-red/screen-1.png','marketplace/cyberpunk-red/screen-2.png'],
    ARRAY['theme', 'dark mode', 'neon'],
    1800,
    '2026-06-20T00:00:00Z'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    'Git Graph Lens Extension',
    'Tiện ích mở rộng vẽ cây thư mục Git trực quan trực tiếp trên SN Terminal với khả năng interactive merge.',
    '149.000đ',
    'Hoàng Dev',
    'Mới',
    'puzzle',
    'marketplace/git-graph/icon.svg',
    'marketplace/git-graph/git-graph-lens.zip',
    'marketplace/git-graph/cover.png',
    ARRAY['marketplace/git-graph/screen-1.png'],
    ARRAY['git', 'visualization', 'workflow'],
    950,
    '2026-06-27T00:00:00Z'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000003',
    'SQL DB Inspector Pro',
    'Bộ công cụ trực quan hóa cấu trúc cơ sở dữ liệu, tối ưu hóa câu lệnh SQL tự động bằng AI.',
    '299.000đ',
    'SN Studio',
    'Đặc biệt',
    'wrench',
    'marketplace/sql-inspector/icon.svg',
    'marketplace/sql-inspector/sql-db-inspector.zip',
    'marketplace/sql-inspector/cover.png',
    ARRAY['marketplace/sql-inspector/screen-1.png','marketplace/sql-inspector/screen-2.png'],
    ARRAY['database', 'sql', 'ai optimize'],
    520,
    '2026-06-10T00:00:00Z'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000004',
    'AI Code Translator',
    'Dịch trực tiếp chú thích mã nguồn và chuyển đổi ngôn ngữ lập trình bằng 1 click.',
    '0đ',
    'Cộng đồng SN',
    'Phổ biến',
    'plug',
    'marketplace/ai-code-translator/icon.svg',
    'marketplace/ai-code-translator/ai-code-translator.zip',
    'marketplace/ai-code-translator/cover.png',
    ARRAY['marketplace/ai-code-translator/screen-1.png'],
    ARRAY['ai', 'translation', 'developer tool'],
    4200,
    '2026-06-30T00:00:00Z'
  )
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  seller = EXCLUDED.seller,
  badge = EXCLUDED.badge,
  icon_type = EXCLUDED.icon_type,
  icon_path = EXCLUDED.icon_path,
  download_path = EXCLUDED.download_path,
  cover_path = EXCLUDED.cover_path,
  screenshots = EXCLUDED.screenshots,
  tags = EXCLUDED.tags,
  downloads_count = EXCLUDED.downloads_count;

INSERT INTO public.marketplace_versions (item_id, version_string, release_date, changelog, file_path) VALUES
  ('40000000-0000-0000-0000-000000000001', 'v2.1.0', '2026-06-20T00:00:00Z', 'Tinh chỉnh bảng màu neon đỏ và trạng thái hover.', 'marketplace/cyberpunk-red/cyberpunk-red-theme.zip'),
  ('40000000-0000-0000-0000-000000000001', 'v2.0.0', '2026-05-18T00:00:00Z', 'Ra mắt bộ theme Cyberpunk Red cho SN Terminal.', 'marketplace/cyberpunk-red/cyberpunk-red-theme-v2.zip'),
  ('40000000-0000-0000-0000-000000000002', 'v1.0.3', '2026-06-27T00:00:00Z', 'Sửa lỗi hiển thị branch merge phức tạp.', 'marketplace/git-graph/git-graph-lens.zip'),
  ('40000000-0000-0000-0000-000000000003', 'v3.4.1', '2026-06-10T00:00:00Z', 'Bổ sung phân tích index và cảnh báo truy vấn chậm.', 'marketplace/sql-inspector/sql-db-inspector.zip'),
  ('40000000-0000-0000-0000-000000000004', 'v1.6.0', '2026-06-30T00:00:00Z', 'Thêm bộ dịch chú thích TypeScript và Go.', 'marketplace/ai-code-translator/ai-code-translator.zip')
ON CONFLICT (item_id, version_string) DO UPDATE SET
  release_date = EXCLUDED.release_date,
  changelog = EXCLUDED.changelog,
  file_path = EXCLUDED.file_path;

INSERT INTO public.marketplace_reviews (id, item_id, author_name, rating, comment, created_at) VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Minh Hoàng', 5, 'Theme đẹp, màu đỏ nổi nhưng vẫn dễ đọc trong phiên làm việc dài.', '2026-06-21T00:00:00Z'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Alex Trần', 5, 'Git graph trực quan và nhẹ hơn extension cũ mình dùng.', '2026-06-28T00:00:00Z'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'Thu Thủy', 4, 'SQL inspector hữu ích cho review performance, phần báo cáo khá rõ.', '2026-06-13T00:00:00Z'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 'Cộng đồng SN', 5, 'Miễn phí nhưng dùng tốt cho dịch comment và docstring.', '2026-07-01T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment;

NOTIFY pgrst, 'reload schema';
