import { supabase } from './supabase';

export type MarketplaceCategory = string;
export type MarketplaceIconType = 'palette' | 'puzzle' | 'wrench' | 'plug';
export type MarketplaceBadge = 'Đặc biệt' | 'Phổ biến' | 'Mới' | '';

export interface MarketplaceReview {
  id: string;
  itemId: string;
  userId: string | null;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MarketplaceVersion {
  id: string;
  itemId: string;
  version: string;
  releaseDate: string;
  changelog: string;
  filePath: string;
  fileSize?: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: MarketplaceCategory;
  categoryLabel: string;
  rating: number;
  reviews: number;
  downloads: string;
  rawDownloads: number;
  seller: string;
  badge: MarketplaceBadge;
  iconType: MarketplaceIconType;
  iconPath?: string;
  iconUrl?: string;
  cover?: string;
  screenshots?: string[];
  tags?: string[];
  currentVersion?: string;
  downloadPath?: string;
  versions?: MarketplaceVersion[];
  reviewItems?: MarketplaceReview[];
}

export interface MarketplaceQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  priceType?: 'all' | 'free' | 'paid';
  sortBy?: 'newest' | 'downloads' | 'rating';
}

export interface MarketplaceResult {
  items: MarketplaceItem[];
  count: number;
}

export interface MarketplaceCategoryRow {
  id: string;
  name: string;
  slug: string;
  label: string;
}

type MarketplaceRow = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  seller: string | null;
  badge: string | null;
  icon_type: string | null;
  icon_path: string | null;
  download_path: string | null;
  cover_path: string | null;
  screenshots: string[] | null;
  tags: string[] | null;
  downloads_count: number | null;
  created_at: string;
  marketplace_categories: { name: string | null; slug: string | null; label: string | null } | null;
  marketplace_versions: { id: string; version_string: string; release_date: string; changelog: string | null; file_path: string | null; file_size: number | null }[] | null;
  marketplace_reviews: { id: string; user_id: string | null; author_name: string | null; rating: number | string; comment: string | null; created_at: string }[] | null;
};

const categoryBySlug: Record<string, MarketplaceCategory> = {
  themes: 'Themes',
  plugins: 'Plugins',
  tools: 'Tools',
  extensions: 'Extensions',
};

const slugByCategory: Record<MarketplaceCategory, string> = {
  Themes: 'themes',
  Plugins: 'plugins',
  Tools: 'tools',
  Extensions: 'extensions',
};

const labelByCategory: Record<MarketplaceCategory, string> = {
  Themes: 'Giao diện',
  Plugins: 'Plugin mở rộng',
  Tools: 'Công cụ bổ trợ',
  Extensions: 'Tiện ích',
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'plugins';

const formatDownloads = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const parseDownloads = (downloads: string | number | undefined) => {
  if (typeof downloads === 'number') return downloads;
  if (!downloads) return 0;
  if (downloads.includes('K')) return Math.round(parseFloat(downloads) * 1000);
  if (downloads.includes('M')) return Math.round(parseFloat(downloads) * 1000000);
  return parseInt(downloads.replace(/[^\d]/g, ''), 10) || 0;
};

const normalizeCategory = (slug: string | null): MarketplaceCategory => {
  if (slug && categoryBySlug[slug]) return categoryBySlug[slug];
  return slug || 'Plugins';
};

const normalizeIconType = (value: string | null): MarketplaceIconType => {
  if (value === 'palette' || value === 'puzzle' || value === 'wrench' || value === 'plug') return value;
  return 'puzzle';
};

const normalizeBadge = (value: string | null): MarketplaceBadge => {
  if (value === 'Đặc biệt' || value === 'Phổ biến' || value === 'Mới') return value;
  return '';
};

const storageUrl = (bucket: string, path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

const mapRow = (row: MarketplaceRow): MarketplaceItem => {
  const category = normalizeCategory(row.marketplace_categories?.slug || null);
  const versions = [...(row.marketplace_versions || [])]
    .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    .map(version => ({
      id: version.id,
      itemId: row.id,
      version: version.version_string,
      releaseDate: new Date(version.release_date).toLocaleDateString('vi-VN'),
      changelog: version.changelog || '',
      filePath: version.file_path || '',
      fileSize: version.file_size || 0,
    }));
  const reviews = (row.marketplace_reviews || []).map(review => ({
    id: review.id,
    itemId: row.id,
    userId: review.user_id,
    authorName: review.author_name || 'Người dùng SN',
    rating: Number(review.rating || 0),
    comment: review.comment || '',
    createdAt: new Date(review.created_at).toLocaleDateString('vi-VN'),
  }));
  const rating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;
  const downloadsCount = row.downloads_count || 0;

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: row.price || '0đ',
    category,
    categoryLabel: row.marketplace_categories?.label || labelByCategory[category],
    rating,
    reviews: reviews.length,
    downloads: formatDownloads(downloadsCount),
    rawDownloads: downloadsCount,
    seller: row.seller || 'SN Studio',
    badge: normalizeBadge(row.badge),
    iconType: normalizeIconType(row.icon_type),
    iconPath: row.icon_path || '',
    iconUrl: storageUrl('app-icons', row.icon_path),
    cover: storageUrl('app-icons', row.cover_path || row.icon_path),
    screenshots: (row.screenshots || []).map(path => storageUrl('app-icons', path)),
    tags: row.tags || [],
    currentVersion: versions[0]?.version || 'v1.0.0',
    downloadPath: row.download_path || versions[0]?.filePath || '',
    versions,
    reviewItems: reviews,
  };
};

const selectQuery = `
  id,
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
  created_at,
  marketplace_categories!inner(name, slug, label),
  marketplace_versions(id, version_string, release_date, changelog, file_path, file_size),
  marketplace_reviews(id, user_id, author_name, rating, comment, created_at)
`;

export const fetchMarketplaceItems = async ({
  page = 1,
  pageSize = 6,
  search = '',
  category = 'Tất cả',
  priceType = 'all',
  sortBy = 'newest',
}: MarketplaceQuery = {}): Promise<MarketplaceResult> => {
  let query = supabase
    .from('marketplace_items')
    .select(selectQuery, { count: 'exact' });

  if (search.trim()) {
    const term = search.trim().replace(/[%_,]/g, '');
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,seller.ilike.%${term}%`);
  }

  if (category !== 'Tất cả') {
    query = query.eq('marketplace_categories.slug', slugByCategory[category as MarketplaceCategory] || category.toLowerCase());
  }

  if (priceType === 'free') query = query.in('price', ['0đ', 'Miễn phí']);
  if (priceType === 'paid') query = query.neq('price', '0đ').neq('price', 'Miễn phí');

  if (sortBy === 'downloads') query = query.order('downloads_count', { ascending: false });
  else if (sortBy === 'rating') query = query.order('created_at', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  let items = ((data || []) as MarketplaceRow[]).map(mapRow);
  if (sortBy === 'rating') {
    items = items.sort((a, b) => b.rating - a.rating);
  }

  return { items, count: count || 0 };
};

export const fetchMarketplaceItem = async (id: string): Promise<MarketplaceItem | null> => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(selectQuery)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapRow(data as MarketplaceRow);
};

export const saveMarketplaceItem = async (item: MarketplaceItem): Promise<MarketplaceItem> => {
  const categorySlug = slugByCategory[item.category] || slugify(item.category);
  const { data: category, error: categoryError } = await supabase
    .from('marketplace_categories')
    .upsert(
      { slug: categorySlug, name: item.category, label: item.categoryLabel || labelByCategory[item.category] },
      { onConflict: 'slug' }
    )
    .select('id')
    .single();

  if (categoryError) throw categoryError;

  const itemPayload = {
    id: item.id.startsWith('market-') ? undefined : item.id,
    category_id: category.id,
    name: item.name,
    description: item.description,
    price: item.price,
    seller: item.seller,
    badge: item.badge || null,
    icon_type: item.iconType,
    icon_path: item.iconPath || item.cover || null,
    download_path: item.downloadPath || null,
    cover_path: item.cover || item.iconPath || null,
    screenshots: item.screenshots || [],
    tags: item.tags || [],
    downloads_count: parseDownloads(item.rawDownloads ?? item.downloads),
  };

  const { data: saved, error } = await supabase
    .from('marketplace_items')
    .upsert(itemPayload)
    .select('id')
    .single();

  if (error) throw error;

  const { error: versionError } = await supabase
    .from('marketplace_versions')
    .upsert(
      {
        item_id: saved.id,
        version_string: item.currentVersion || 'v1.0.0',
        release_date: new Date().toISOString(),
        changelog: 'Cập nhật thông tin sản phẩm marketplace.',
        file_path: item.downloadPath || null,
        file_size: item.versions?.[0]?.fileSize || 0,
      },
      { onConflict: 'item_id,version_string' }
    );

  if (versionError) throw versionError;

  const refreshed = await fetchMarketplaceItem(saved.id);
  if (!refreshed) throw new Error('Không thể tải lại sản phẩm vừa lưu.');
  return refreshed;
};

export const deleteMarketplaceItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('marketplace_items').delete().eq('id', id);
  if (error) throw error;
};

export const fetchMarketplaceCategories = async (): Promise<MarketplaceCategoryRow[]> => {
  const { data, error } = await supabase
    .from('marketplace_categories')
    .select('id, name, slug, label')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as MarketplaceCategoryRow[];
};

export const saveMarketplaceCategory = async (
  category: Partial<MarketplaceCategoryRow> & { name: string; label: string; slug?: string }
): Promise<void> => {
  const { error } = await supabase
    .from('marketplace_categories')
    .upsert(
      {
        id: category.id,
        name: category.name,
        slug: category.slug ? slugify(category.slug) : slugify(category.name),
        label: category.label,
      },
      { onConflict: 'slug' }
    );

  if (error) throw error;
};

export const deleteMarketplaceCategory = async (id: string): Promise<void> => {
  const { error } = await supabase.from('marketplace_categories').delete().eq('id', id);
  if (error) throw error;
};

export const saveMarketplaceVersion = async (itemId: string, version: MarketplaceVersion): Promise<void> => {
  const { error } = await supabase
    .from('marketplace_versions')
    .upsert(
      {
        id: version.id || undefined,
        item_id: itemId,
        version_string: version.version,
        release_date: version.releaseDate ? new Date(version.releaseDate).toISOString() : new Date().toISOString(),
        changelog: version.changelog || '',
        file_path: version.filePath || null,
        file_size: version.fileSize || 0,
      },
      { onConflict: 'item_id,version_string' }
    );

  if (error) throw error;
};

export const deleteMarketplaceVersion = async (id: string): Promise<void> => {
  const { error } = await supabase.from('marketplace_versions').delete().eq('id', id);
  if (error) throw error;
};

export const updateMarketplaceReview = async (
  id: string,
  payload: { authorName: string; rating: number; comment: string }
): Promise<void> => {
  const { error } = await supabase
    .from('marketplace_reviews')
    .update({
      author_name: payload.authorName,
      rating: payload.rating,
      comment: payload.comment,
    })
    .eq('id', id);

  if (error) throw error;
};

export const deleteMarketplaceReview = async (id: string): Promise<void> => {
  const { error } = await supabase.from('marketplace_reviews').delete().eq('id', id);
  if (error) throw error;
};

export const incrementMarketplaceDownload = async (item: MarketplaceItem): Promise<MarketplaceItem> => {
  const nextDownloads = item.rawDownloads + 1;
  const { error } = await supabase
    .from('marketplace_items')
    .update({ downloads_count: nextDownloads })
    .eq('id', item.id);

  if (error) throw error;

  const refreshed = await fetchMarketplaceItem(item.id);
  if (!refreshed) throw new Error('Không thể cập nhật lượt tải.');
  return refreshed;
};

export const addMarketplaceReview = async (itemId: string, rating: number, comment: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  const { error } = await supabase.from('marketplace_reviews').insert({
    item_id: itemId,
    user_id: session?.user?.id || null,
    author_name: session?.user?.email?.split('@')[0] || 'Khách truy cập',
    rating,
    comment,
  });

  if (error) throw error;
};

export const getMarketplaceDownloadUrl = async (item: MarketplaceItem): Promise<string> => {
  const path = item.downloadPath || item.versions?.[0]?.filePath || '';
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;

  const { data } = await supabase.storage.from('app-files').getPublicUrl(path);
  return data.publicUrl;
};

export const uploadMarketplaceFile = async (bucket: 'app-icons' | 'app-files', folder: string, file: File): Promise<string> => {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const path = `${folder}/${Date.now()}-${slugify(baseName)}${ext ? `.${ext}` : ''}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

  if (error) throw error;
  return path;
};

export const fetchMarketplaceItemsByIds = async (ids: string[]): Promise<MarketplaceItem[]> => {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(selectQuery)
    .in('id', ids);

  if (error) throw error;
  return ((data || []) as MarketplaceRow[]).map(mapRow);
};
