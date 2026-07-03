import { supabase } from './supabase';

export type AppCategory = 'System' | 'Development' | 'Security' | 'Automation';
export type AppIconType = 'terminal' | 'shield' | 'code' | 'zap' | 'cpu';

export interface AppData {
  id: string;
  name: string;
  version: string;
  description: string;
  category: AppCategory;
  categoryLabel: string;
  isFree: boolean;
  price: string;
  rating: number;
  downloads: string;
  updateDate: string;
  iconType: AppIconType;
  tags: string[];
  rawDownloads?: number;
  rawDate?: number;
  changelog?: string;
  iconPath?: string;
  iconUrl?: string;
  downloadPath?: string;
  versions?: AppVersion[];
}

export interface AppVersion {
  id?: string;
  version: string;
  releaseDate: string;
  changelog: string;
  rawDate: number;
}

type AppRow = {
  id: string;
  name: string;
  description: string | null;
  icon_type: string | null;
  rating: number | string | null;
  downloads_count: number | null;
  is_free: boolean | null;
  price: string | null;
  tags: string[] | null;
  created_at: string;
  categories: { name: string | null; slug: string | null } | null;
  app_versions: { id: string; version_string: string; release_date: string; changelog: string | null }[] | null;
};

const categoryBySlug: Record<string, AppCategory> = {
  system: 'System',
  development: 'Development',
  security: 'Security',
  automation: 'Automation',
};

const slugByLabel: Record<string, string> = {
  'Hệ thống': 'system',
  'Bảo mật': 'security',
  'Phát triển': 'development',
  'Tự động hóa': 'automation',
};

const labelByCategory: Record<AppCategory, string> = {
  System: 'Hệ thống',
  Development: 'Phát triển',
  Security: 'Bảo mật',
  Automation: 'Tự động hóa',
};

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

const normalizeIconType = (value: string | null): AppIconType => {
  if (value === 'terminal' || value === 'shield' || value === 'code' || value === 'zap' || value === 'cpu') {
    return value;
  }
  return 'terminal';
};

const normalizeCategory = (slug: string | null): AppCategory => {
  if (slug && categoryBySlug[slug]) return categoryBySlug[slug];
  return 'System';
};

const storageUrl = (bucket: string, path: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

const mapAppRow = (app: AppRow): AppData => {
  const versions = [...(app.app_versions || [])].sort(
    (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
  );
  const latestVersion = versions[0];
  const releaseDate = latestVersion?.release_date || app.created_at;
  const downloadsCount = app.downloads_count || 0;
  const category = normalizeCategory(app.categories?.slug || null);

  return {
    id: app.id,
    name: app.name,
    version: latestVersion?.version_string || 'v1.0.0',
    description: app.description || '',
    category,
    categoryLabel: app.categories?.name || labelByCategory[category],
    isFree: app.is_free ?? true,
    price: app.price || '0đ',
    rating: Number(app.rating || 0),
    downloads: formatDownloads(downloadsCount),
    rawDownloads: downloadsCount,
    updateDate: new Date(releaseDate).toLocaleDateString('vi-VN'),
    rawDate: new Date(releaseDate).getTime(),
    iconType: normalizeIconType(app.icon_type),
    tags: app.tags || [],
    changelog: latestVersion?.changelog || '',
    iconPath: undefined,
    iconUrl: undefined,
    downloadPath: undefined,
    versions: versions.map(version => ({
      id: version.id,
      version: version.version_string,
      releaseDate: new Date(version.release_date).toLocaleDateString('vi-VN'),
      changelog: version.changelog || '',
      rawDate: new Date(version.release_date).getTime(),
    })),
  };
};

export const fetchApps = async (): Promise<AppData[]> => {
  const { data, error } = await supabase
    .from('apps')
    .select(`
      id,
      name,
      description,
      icon_type,
      rating,
      downloads_count,
      is_free,
      price,
      tags,
      created_at,
      categories(name, slug),
      app_versions(id, version_string, release_date, changelog)
    `);

  if (error) {
    throw error;
  }

  return ((data || []) as AppRow[])
    .map(mapAppRow)
    .sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0));
};

export const saveApp = async (app: AppData): Promise<AppData> => {
  const categorySlug = slugByLabel[app.categoryLabel] || app.category.toLowerCase();
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .upsert({ slug: categorySlug, name: app.categoryLabel }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (categoryError) throw categoryError;

  const appPayload = {
    id: app.id.startsWith('app-') ? undefined : app.id,
    name: app.name,
    description: app.description,
    category_id: category.id,
    icon_type: app.iconType,
    rating: app.rating,
    downloads_count: parseDownloads(app.rawDownloads ?? app.downloads),
    is_free: app.isFree,
    price: app.isFree ? '0đ' : app.price,
    tags: app.tags,
  };

  const { data: savedApp, error: appError } = await supabase
    .from('apps')
    .upsert(appPayload)
    .select('id')
    .single();

  if (appError) throw appError;

  const { error: versionError } = await supabase
    .from('app_versions')
    .upsert(
      {
        app_id: savedApp.id,
        version_string: app.version,
        release_date: new Date().toISOString(),
        changelog: app.changelog || 'Cập nhật thông tin ứng dụng.',
      },
      { onConflict: 'app_id,version_string' }
    );

  if (versionError) throw versionError;

  const apps = await fetchApps();
  const refreshed = apps.find(item => item.id === savedApp.id);
  if (!refreshed) throw new Error('Không thể tải lại ứng dụng vừa lưu.');
  return refreshed;
};

export const deleteApp = async (id: string): Promise<void> => {
  const { error } = await supabase.from('apps').delete().eq('id', id);
  if (error) throw error;
};

export const saveAppVersion = async (appId: string, version: AppVersion): Promise<void> => {
  const payload = {
    id: version.id,
    app_id: appId,
    version_string: version.version,
    release_date: version.releaseDate ? new Date(version.releaseDate).toISOString() : new Date().toISOString(),
    changelog: version.changelog || '',
  };

  const { error } = await supabase
    .from('app_versions')
    .upsert(payload, { onConflict: 'app_id,version_string' });

  if (error) throw error;
};

export const deleteAppVersion = async (id: string): Promise<void> => {
  const { error } = await supabase.from('app_versions').delete().eq('id', id);
  if (error) throw error;
};

export const fetchApp = async (id: string): Promise<AppData | null> => {
  const apps = await fetchApps();
  return apps.find(app => app.id === id) || null;
};

export const incrementAppDownload = async (app: AppData): Promise<AppData> => {
  const nextDownloads = (app.rawDownloads || parseDownloads(app.downloads)) + 1;
  const { error } = await supabase
    .from('apps')
    .update({ downloads_count: nextDownloads })
    .eq('id', app.id);

  if (error) throw error;

  const refreshed = await fetchApp(app.id);
  if (!refreshed) throw new Error('Không thể tải lại ứng dụng sau khi cập nhật lượt tải.');
  return refreshed;
};

export const getAppDownloadUrl = (app: AppData): string | undefined => {
  return storageUrl('app-files', app.downloadPath || null);
};
