import { supabase } from './supabase';
import { MarketplaceBadge, MarketplaceIconType, MarketplaceItem, MarketplaceVersion } from './marketplace';

export type MarketplacePurchaseStatus = 'completed' | 'claimed' | 'pending' | 'refunded' | 'revoked';
export type MarketplaceLicenseStatus = 'active' | 'revoked' | 'expired';

export interface MarketplacePurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemPrice: string;
  seller: string;
  badge: MarketplaceBadge;
  iconType: MarketplaceIconType;
  category: string;
  categoryLabel: string;
  status: MarketplacePurchaseStatus;
  purchaseDate: string;
  updatedAt: string;
  buyerEmail: string;
  buyerUsername: string;
  buyerDisplayName: string;
  licenseStatus: MarketplaceLicenseStatus;
  licenseLast4: string;
  latestVersion: string;
  latestReleaseDate: string;
  latestFileSize: number;
  downloadPath: string;
  item: MarketplaceItem;
}

export interface MarketplaceDownloadLogRecord {
  id: string;
  itemId: string;
  itemName: string;
  buyerEmail: string;
  buyerUsername: string;
  buyerDisplayName: string;
  versionString: string;
  fileSize: number;
  downloadPath: string;
  createdAt: string;
  status: MarketplacePurchaseStatus;
}

export interface MarketplacePurchaseActionResult {
  purchaseId: string;
  itemId: string;
  itemName: string;
  purchaseStatus: MarketplacePurchaseStatus;
  licenseKey: string | null;
  licenseStatus: MarketplaceLicenseStatus;
  licenseLast4: string;
  downloadPath: string;
  versionId: string | null;
  versionString: string;
  fileSize: number;
  createdAt: string;
  buyerEmail: string;
  buyerUsername: string;
  buyerDisplayName: string;
}

export interface MarketplaceDownloadActionResult {
  downloadPath: string;
  downloadUrl: string;
  downloadsCount: number;
  purchaseId: string | null;
  versionId: string | null;
  versionString: string;
  fileSize: number;
}

export interface MarketplaceAdminSnapshot {
  purchases: MarketplacePurchaseRecord[];
  downloads: MarketplaceDownloadLogRecord[];
}

const maskLicenseKey = (last4: string) => `••••-••••-••••-${last4 || '----'}`;

const formatFileSize = (bytes?: number | null) => {
  const size = bytes || 0;
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
};

const mapPurchaseRow = (row: any): MarketplacePurchaseRecord | null => {
  const item = row.marketplace_items;
  const version = item?.marketplace_versions?.[0] || null;
  const license = row.marketplace_licenses || null;
  if (!item) return null;

  const normalizedItem: MarketplaceItem = {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: item.price || '0đ',
    category: item.marketplace_categories?.name || 'Plugins',
    categoryLabel: item.marketplace_categories?.label || 'Plugin mở rộng',
    rating: 0,
    reviews: 0,
    downloads: String(item.downloads_count || 0),
    rawDownloads: item.downloads_count || 0,
    seller: item.seller || 'SN Studio',
    badge: (item.badge || '') as MarketplaceBadge,
    iconType: (item.icon_type || 'puzzle') as MarketplaceIconType,
    iconPath: item.icon_path || '',
    iconUrl: '',
    cover: '',
    screenshots: item.screenshots || [],
    tags: item.tags || [],
    currentVersion: version?.version_string || 'v1.0.0',
    downloadPath: item.download_path || version?.file_path || '',
    versions: (item.marketplace_versions || []).map((entry: any) => ({
      id: entry.id,
      itemId: item.id,
      version: entry.version_string,
      releaseDate: new Date(entry.release_date).toLocaleDateString('vi-VN'),
      changelog: entry.changelog || '',
      filePath: entry.file_path || '',
      fileSize: entry.file_size || 0,
    })),
    reviewItems: [],
  };

  return {
    id: row.id,
    itemId: item.id,
    itemName: item.name,
    itemPrice: item.price || '0đ',
    seller: item.seller || 'SN Studio',
    badge: (item.badge || '') as MarketplaceBadge,
    iconType: (item.icon_type || 'puzzle') as MarketplaceIconType,
    category: item.marketplace_categories?.name || 'Plugins',
    categoryLabel: item.marketplace_categories?.label || 'Plugin mở rộng',
    status: row.status || 'completed',
    purchaseDate: new Date(row.purchase_date).toLocaleDateString('vi-VN'),
    updatedAt: new Date(row.updated_at || row.purchase_date).toLocaleDateString('vi-VN'),
    buyerEmail: row.buyer_email || '',
    buyerUsername: row.buyer_username || '',
    buyerDisplayName: row.buyer_display_name || '',
    licenseStatus: (license?.status || 'active') as MarketplaceLicenseStatus,
    licenseLast4: license?.license_last4 || '',
    latestVersion: version?.version_string || 'v1.0.0',
    latestReleaseDate: version?.release_date ? new Date(version.release_date).toLocaleDateString('vi-VN') : '',
    latestFileSize: version?.file_size || 0,
    downloadPath: item.download_path || version?.file_path || '',
    item: normalizedItem,
  };
};

const mapDownloadRow = (row: any): MarketplaceDownloadLogRecord | null => {
  const purchase = row.marketplace_purchases;
  const item = purchase?.marketplace_items || row.marketplace_items;
  const version = row.marketplace_versions || null;
  if (!item) return null;

  return {
    id: row.id,
    itemId: item.id,
    itemName: item.name || 'Marketplace item',
    buyerEmail: purchase?.buyer_email || '',
    buyerUsername: purchase?.buyer_username || '',
    buyerDisplayName: purchase?.buyer_display_name || '',
    versionString: version?.version_string || '',
    fileSize: version?.file_size || 0,
    downloadPath: row.download_path || version?.file_path || item.download_path || '',
    createdAt: new Date(row.created_at).toLocaleString('vi-VN'),
    status: purchase?.status || 'completed',
  };
};

export const fetchMarketplacePurchases = async (): Promise<MarketplacePurchaseRecord[]> => {
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .select(`
      id,
      item_id,
      status,
      purchase_date,
      updated_at,
      buyer_email,
      buyer_username,
      buyer_display_name,
      marketplace_items(
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
        marketplace_categories(name, slug, label),
        marketplace_versions(id, version_string, release_date, changelog, file_path, file_size)
      ),
      marketplace_licenses(id, status, license_last4, revoked_at, created_at)
    `)
    .order('purchase_date', { ascending: false });

  if (error) throw error;
  return ((data || []) as any[]).map(mapPurchaseRow).filter(Boolean) as MarketplacePurchaseRecord[];
};

export const fetchMarketplaceDownloadLogs = async (): Promise<MarketplaceDownloadLogRecord[]> => {
  const { data, error } = await supabase
    .from('marketplace_download_logs')
    .select(`
      id,
      user_id,
      item_id,
      version_id,
      purchase_id,
      download_path,
      created_at,
      marketplace_purchases(
        id,
        status,
        buyer_email,
        buyer_username,
        buyer_display_name,
        marketplace_items(id, name, download_path)
      ),
      marketplace_versions(id, version_string, file_path, file_size)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data || []) as any[]).map(mapDownloadRow).filter(Boolean) as MarketplaceDownloadLogRecord[];
};

export const fetchMarketplacePurchaseByItemId = async (itemId: string): Promise<MarketplacePurchaseRecord | null> => {
  const purchases = await fetchMarketplacePurchases();
  return purchases.find(purchase => purchase.itemId === itemId) || null;
};

export const purchaseMarketplaceItem = async (itemId: string): Promise<MarketplacePurchaseActionResult> => {
  const { data, error } = await supabase.rpc('purchase_marketplace_item', { p_item_id: itemId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Không thể tạo giao dịch mua hàng.');

  return {
    purchaseId: row.purchase_id,
    itemId: row.item_id,
    itemName: row.item_name,
    purchaseStatus: row.purchase_status,
    licenseKey: row.license_key || null,
    licenseStatus: row.license_status,
    licenseLast4: row.license_last4 || '',
    downloadPath: row.download_path || '',
    versionId: row.version_id || null,
    versionString: row.version_string || '',
    fileSize: row.file_size || 0,
    createdAt: row.created_at,
    buyerEmail: row.buyer_email || '',
    buyerUsername: row.buyer_username || '',
    buyerDisplayName: row.buyer_display_name || '',
  };
};

export const downloadMarketplaceItem = async (itemId: string, versionId?: string | null): Promise<MarketplaceDownloadActionResult> => {
  const { data, error } = await supabase.rpc('log_marketplace_download', {
    p_item_id: itemId,
    p_version_id: versionId || null,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Không thể ghi nhận lượt tải.');

  const { data: urlData } = supabase.storage.from('app-files').getPublicUrl(row.download_path);
  return {
    downloadPath: row.download_path,
    downloadUrl: urlData.publicUrl,
    downloadsCount: row.downloads_count || 0,
    purchaseId: row.purchase_id || null,
    versionId: row.version_id || null,
    versionString: row.version_string || '',
    fileSize: row.file_size || 0,
  };
};

export const adminManageMarketplacePurchase = async (
  purchaseId: string,
  updates: { purchaseStatus?: MarketplacePurchaseStatus; licenseStatus?: MarketplaceLicenseStatus }
): Promise<void> => {
  const { error } = await supabase.rpc('admin_manage_marketplace_purchase', {
    p_purchase_id: purchaseId,
    p_purchase_status: updates.purchaseStatus || null,
    p_license_status: updates.licenseStatus || null,
  });

  if (error) throw error;
};

export { formatFileSize, maskLicenseKey };
