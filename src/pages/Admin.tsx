import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { articlesData } from '../data/mockData';
import { 
  LayoutDashboard, 
  Settings, 
  Code, 
  FileText, 
  Terminal,
  Shield,
  Zap,
  Cpu,
  Users,
  Database,
  Globe,
  Star,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { ArticleData } from '../data/mockData';
import { AdminAppModal } from '../components/AdminAppModal';
import { AdminArticleModal } from '../components/AdminArticleModal';
import { AdminMarketModal } from '../components/AdminMarketModal';
import { AdminUserModal } from '../components/AdminUserModal';
import {
  AppVersion,
  fetchApps,
  saveApp as saveSupabaseApp,
  deleteApp as deleteSupabaseApp,
  saveAppVersion,
  deleteAppVersion,
  AppData
} from '../lib/apps';
import { deleteProfile, fetchProfiles, ProfileRow, saveProfile, updateProfileStatus } from '../lib/profiles';
import {
  deleteMarketplaceCategory,
  MarketplaceItem,
  MarketplaceCategoryRow,
  MarketplaceReview,
  MarketplaceVersion,
  deleteMarketplaceReview,
  deleteMarketplaceVersion,
  fetchMarketplaceCategories,
  fetchMarketplaceItems,
  uploadMarketplaceFile,
  saveMarketplaceCategory,
  saveMarketplaceItem,
  saveMarketplaceVersion,
  deleteMarketplaceItem,
  updateMarketplaceReview,
} from '../lib/marketplace';
import {
  MarketplaceDownloadLogRecord,
  MarketplacePurchaseRecord,
  adminManageMarketplacePurchase,
  fetchMarketplaceDownloadLogs,
  fetchMarketplacePurchases,
  formatFileSize,
  maskLicenseKey,
} from '../lib/commerce';

interface AdminProps {
  username: string;
  setRoute: (route: string) => void;
}

type AdminTab = 'overview' | 'users' | 'apps' | 'articles' | 'marketplace' | 'settings';
type ToastType = 'success' | 'error';

export const Admin: React.FC<AdminProps> = ({ username, setRoute }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [toast, setToast] = useState<{ id: number; type: ToastType; message: string } | null>(null);

  // App Modal States
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);

  // Article Modal States
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null);

  // Market Modal States
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState<MarketplaceItem | null>(null);

  // User Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ProfileRow | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Local Storage Data States
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [apps, setApps] = useState<AppData[]>([]);
  const [articles, setArticles] = useState(articlesData);
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>([]);
  const [marketCategories, setMarketCategories] = useState<MarketplaceCategoryRow[]>([]);
  const [commercePurchases, setCommercePurchases] = useState<MarketplacePurchaseRecord[]>([]);
  const [commerceDownloads, setCommerceDownloads] = useState<MarketplaceDownloadLogRecord[]>([]);
  const [categoryDraft, setCategoryDraft] = useState<Partial<MarketplaceCategoryRow>>({ name: '', slug: '', label: '' });
  const [appVersionDraft, setAppVersionDraft] = useState<{ appId: string; version: string; releaseDate: string; changelog: string }>({
    appId: '',
    version: '',
    releaseDate: new Date().toISOString().slice(0, 10),
    changelog: '',
  });
  const [marketVersionDraft, setMarketVersionDraft] = useState<{ itemId: string; version: string; releaseDate: string; changelog: string; filePath: string; fileSize: number }>({
    itemId: '',
    version: '',
    releaseDate: new Date().toISOString().slice(0, 10),
    changelog: '',
    filePath: '',
    fileSize: 0,
  });
  const [editingReview, setEditingReview] = useState<MarketplaceReview | null>(null);

  // System Settings State
  const [sysSettings, setSysSettings] = useState({
    siteName: 'SN Studio',
    theme: 'dark',
    logoUrl: '',
    contactEmail: 'contact@snstudio.vn',
    seoTitle: 'SN Studio - Premium SaaS',
    maintenanceMode: false
  });

  useEffect(() => {
    const loadApps = async () => {
      try {
        setApps(await fetchApps());
      } catch (error) {
        console.error('Error loading admin apps:', error);
        setApps([]);
      }
    };
    const loadMarketItems = async () => {
      try {
        const result = await fetchMarketplaceItems({ page: 1, pageSize: 100, sortBy: 'newest' });
        setMarketItems(result.items);
        setMarketCategories(await fetchMarketplaceCategories());
      } catch (error) {
        console.error('Error loading admin marketplace:', error);
        setMarketItems([]);
      }
    };
    const loadProfiles = async () => {
      try {
        setProfiles(await fetchProfiles());
      } catch (error) {
        console.error('Error loading admin profiles:', error);
        setProfiles([]);
      }
    };
    const loadCommerce = async () => {
      try {
        setCommercePurchases(await fetchMarketplacePurchases());
        setCommerceDownloads(await fetchMarketplaceDownloadLogs());
      } catch (error) {
        console.error('Error loading admin commerce:', error);
        setCommercePurchases([]);
        setCommerceDownloads([]);
      }
    };

    loadApps();
    loadMarketItems();
    loadProfiles();
    loadCommerce();

    // Load Settings
    const settingsStr = localStorage.getItem('sn_settings');
    if (settingsStr) setSysSettings(JSON.parse(settingsStr));

    window.addEventListener('apps-db-updated', loadApps);
    window.addEventListener('market-db-updated', loadMarketItems);
    window.addEventListener('profiles-db-updated', loadProfiles);
    window.addEventListener('commerce-db-updated', loadCommerce);
    return () => {
      window.removeEventListener('apps-db-updated', loadApps);
      window.removeEventListener('market-db-updated', loadMarketItems);
      window.removeEventListener('profiles-db-updated', loadProfiles);
      window.removeEventListener('commerce-db-updated', loadCommerce);
    };
  }, []);

  const showToast = (type: ToastType, message: string) => {
    const id = Date.now();
    setToast({ id, type, message });
    window.setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 3200);
  };

  const handleDeleteApp = async (id: string) => {
    if (window.confirm('Xóa ứng dụng này?')) {
      try {
        await deleteSupabaseApp(id);
        setApps(await fetchApps());
        window.dispatchEvent(new Event('apps-db-updated'));
      } catch (error: any) {
        alert(`Không thể xóa ứng dụng: ${error.message}`);
      }
    }
  };

  const handleSaveApp = async (app: AppData) => {
    try {
      await saveSupabaseApp(app);
      setApps(await fetchApps());
      window.dispatchEvent(new Event('apps-db-updated'));
    } catch (error: any) {
      alert(`Không thể lưu ứng dụng: ${error.message}`);
    }
  };

  const handleSaveAppVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appVersionDraft.appId || !appVersionDraft.version.trim()) return;

    try {
      await saveAppVersion(appVersionDraft.appId, {
        version: appVersionDraft.version.trim(),
        releaseDate: appVersionDraft.releaseDate,
        changelog: appVersionDraft.changelog.trim(),
        rawDate: new Date(appVersionDraft.releaseDate).getTime(),
      } as AppVersion);
      setApps(await fetchApps());
      setAppVersionDraft({
        appId: appVersionDraft.appId,
        version: '',
        releaseDate: new Date().toISOString().slice(0, 10),
        changelog: '',
      });
      window.dispatchEvent(new Event('apps-db-updated'));
    } catch (error: any) {
      alert(`Không thể lưu phiên bản ứng dụng: ${error.message}`);
    }
  };

  const handleDeleteAppVersion = async (id?: string) => {
    if (!id || !window.confirm('Xóa phiên bản ứng dụng này?')) return;

    try {
      await deleteAppVersion(id);
      setApps(await fetchApps());
      window.dispatchEvent(new Event('apps-db-updated'));
    } catch (error: any) {
      alert(`Không thể xóa phiên bản ứng dụng: ${error.message}`);
    }
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('Xóa bài viết này?')) {
      const newArticles = articles.filter(a => a.id !== id);
      setArticles(newArticles);
      localStorage.setItem('sn_articles_db', JSON.stringify(newArticles));
      window.dispatchEvent(new Event('articles-db-updated'));
    }
  };

  const handleSaveArticle = (article: ArticleData) => {
    let newArticles = [...articles];
    const existingIndex = newArticles.findIndex(a => a.id === article.id);
    
    if (existingIndex >= 0) {
      newArticles[existingIndex] = article;
    } else {
      newArticles = [article, ...newArticles];
    }
    
    setArticles(newArticles);
    localStorage.setItem('sn_articles_db', JSON.stringify(newArticles));
    window.dispatchEvent(new Event('articles-db-updated'));
  };

  const handleDeleteMarket = async (id: string) => {
    if (window.confirm('Xóa sản phẩm này khỏi Marketplace?')) {
      try {
        await deleteMarketplaceItem(id);
        const result = await fetchMarketplaceItems({ page: 1, pageSize: 100, sortBy: 'newest' });
        setMarketItems(result.items);
        window.dispatchEvent(new Event('market-db-updated'));
      } catch (error: any) {
        alert(`Không thể xóa sản phẩm: ${error.message}`);
      }
    }
  };

  const handleSaveMarket = async (item: MarketplaceItem) => {
    try {
      await saveMarketplaceItem(item);
      const result = await fetchMarketplaceItems({ page: 1, pageSize: 100, sortBy: 'newest' });
      setMarketItems(result.items);
      setMarketCategories(await fetchMarketplaceCategories());
      window.dispatchEvent(new Event('market-db-updated'));
    } catch (error: any) {
      alert(`Không thể lưu sản phẩm: ${error.message}`);
    }
  };

  const reloadMarketplaceCms = async () => {
    const result = await fetchMarketplaceItems({ page: 1, pageSize: 100, sortBy: 'newest' });
    setMarketItems(result.items);
    setMarketCategories(await fetchMarketplaceCategories());
    window.dispatchEvent(new Event('market-db-updated'));
  };

  const handleSaveMarketCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryDraft.name?.trim() || !categoryDraft.label?.trim()) return;

    try {
      await saveMarketplaceCategory({
        id: categoryDraft.id,
        name: categoryDraft.name.trim(),
        slug: categoryDraft.slug?.trim(),
        label: categoryDraft.label.trim(),
      });
      setCategoryDraft({ name: '', slug: '', label: '' });
      await reloadMarketplaceCms();
    } catch (error: any) {
      alert(`Không thể lưu danh mục: ${error.message}`);
    }
  };

  const handleDeleteMarketCategory = async (id: string) => {
    if (!window.confirm('Xóa danh mục này? Sản phẩm đang dùng danh mục sẽ chặn thao tác này.')) return;

    try {
      await deleteMarketplaceCategory(id);
      await reloadMarketplaceCms();
    } catch (error: any) {
      alert(`Không thể xóa danh mục: ${error.message}`);
    }
  };

  const handleUploadMarketVersionFile = async (file?: File | null) => {
    if (!file) return;
    const selectedItem = marketItems.find(item => item.id === marketVersionDraft.itemId);
    const safeName = (selectedItem?.name || marketVersionDraft.version || 'marketplace-version')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const path = await uploadMarketplaceFile('app-files', `marketplace/${safeName || 'version'}`, file);
      setMarketVersionDraft(prev => ({
        ...prev,
        filePath: path,
        fileSize: file.size,
      }));
    } catch (error: any) {
      alert(`Không thể upload file phiên bản: ${error.message}`);
    }
  };

  const handleSaveMarketVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketVersionDraft.itemId || !marketVersionDraft.version.trim()) return;

    try {
      await saveMarketplaceVersion(marketVersionDraft.itemId, {
        id: '',
        itemId: marketVersionDraft.itemId,
        version: marketVersionDraft.version.trim(),
        releaseDate: marketVersionDraft.releaseDate,
        changelog: marketVersionDraft.changelog.trim(),
        filePath: marketVersionDraft.filePath.trim(),
        fileSize: marketVersionDraft.fileSize,
      } as MarketplaceVersion);
      setMarketVersionDraft({
        itemId: marketVersionDraft.itemId,
        version: '',
        releaseDate: new Date().toISOString().slice(0, 10),
        changelog: '',
        filePath: '',
        fileSize: 0,
      });
      await reloadMarketplaceCms();
    } catch (error: any) {
      alert(`Không thể lưu phiên bản marketplace: ${error.message}`);
    }
  };

  const handleDeleteMarketVersion = async (id: string) => {
    if (!window.confirm('Xóa phiên bản marketplace này?')) return;

    try {
      await deleteMarketplaceVersion(id);
      await reloadMarketplaceCms();
    } catch (error: any) {
      alert(`Không thể xóa phiên bản marketplace: ${error.message}`);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      await updateMarketplaceReview(editingReview.id, {
        authorName: editingReview.authorName,
        rating: editingReview.rating,
        comment: editingReview.comment,
      });
      setEditingReview(null);
      await reloadMarketplaceCms();
    } catch (error: any) {
      alert(`Không thể lưu đánh giá: ${error.message}`);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Xóa đánh giá này?')) return;

    try {
      await deleteMarketplaceReview(id);
      await reloadMarketplaceCms();
    } catch (error: any) {
      alert(`Không thể xóa đánh giá: ${error.message}`);
    }
  };

  const handleRefundPurchase = async (purchaseId: string) => {
    if (!window.confirm('Đánh dấu giao dịch này là refunded?')) return;
    try {
      await adminManageMarketplacePurchase(purchaseId, { purchaseStatus: 'refunded' });
      await reloadCommerce();
      showToast('success', 'Đã đánh dấu giao dịch là refunded.');
    } catch (error: any) {
      showToast('error', `Không thể cập nhật giao dịch: ${error.message}`);
    }
  };

  const handleRevokeLicense = async (purchaseId: string) => {
    if (!window.confirm('Thu hồi license của giao dịch này?')) return;
    try {
      await adminManageMarketplacePurchase(purchaseId, { licenseStatus: 'revoked' });
      await reloadCommerce();
      showToast('success', 'Đã thu hồi license.');
    } catch (error: any) {
      showToast('error', `Không thể thu hồi license: ${error.message}`);
    }
  };

  const reloadProfiles = async () => {
    const nextProfiles = await fetchProfiles();
    setProfiles(nextProfiles);
    window.dispatchEvent(new Event('profiles-db-updated'));
  };

  const reloadCommerce = async () => {
    setCommercePurchases(await fetchMarketplacePurchases());
    setCommerceDownloads(await fetchMarketplaceDownloadLogs());
    window.dispatchEvent(new Event('commerce-db-updated'));
  };

  const handleDeleteMember = async (id: string) => {
    const profile = profiles.find(item => item.id === id);
    if (profile?.email === 'admin@gmail.com' || profile?.email === 'admin@snstudio.vn') {
      showToast('error', 'Không thể xóa tài khoản Quản trị viên tối cao!');
      return;
    }
    if (!window.confirm('Xóa hồ sơ người dùng này khỏi Supabase?')) return;

    try {
      await deleteProfile(id);
      await reloadProfiles();
      showToast('success', 'Đã xóa hồ sơ người dùng.');
    } catch (error: any) {
      showToast('error', `Không thể xóa hồ sơ: ${error.message}`);
    }
  };

  const handleSaveMember = async (profile: ProfileRow) => {
    try {
      await saveProfile(profile);
      await reloadProfiles();
      showToast('success', 'Đã lưu hồ sơ người dùng.');
    } catch (error: any) {
      showToast('error', `Không thể lưu hồ sơ: ${error.message}`);
      throw error;
    }
  };

  const handleToggleBan = async (profile: ProfileRow) => {
    try {
      await updateProfileStatus(profile.id, profile.status === 'banned' ? 'active' : 'banned');
      await reloadProfiles();
      showToast('success', `Đã cập nhật trạng thái thành ${profile.status === 'banned' ? 'active' : 'banned'}.`);
    } catch (error: any) {
      showToast('error', `Không thể cập nhật trạng thái: ${error.message}`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sn_settings', JSON.stringify(sysSettings));
    alert('Đã lưu cấu hình hệ thống thành công!');
    window.dispatchEvent(new Event('settings-updated'));
  };

  const handleBackup = () => {
    const backupData = {
      settings: sysSettings,
      profiles: profiles,
      apps: apps,
      articles: articles,
      marketItems: marketItems
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sn-studio-backup-${Date.now()}.json`;
    a.click();
    alert('Đã tải xuống file sao lưu hệ thống!');
  };

  const handleRestore = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.settings) setSysSettings(data.settings);
            if (data.articles) setArticles(data.articles);
            alert('Khôi phục dữ liệu thành công! Vui lòng tải lại trang.');
          } catch (err) {
            alert('File sao lưu không hợp lệ!');
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  const handleActionMock = (action: string) => {
    alert(`Chức năng [${action}] đã được ghi nhận vào nhật ký hệ thống.`);
  };

  const parseCurrency = (value: string) => {
    const numeric = parseInt((value || '').replace(/[^\d]/g, ''), 10);
    return Number.isNaN(numeric) ? 0 : numeric;
  };

  const totalDownloads = [...apps, ...marketItems].reduce((sum, item) => sum + (item.rawDownloads || 0), 0);
  const totalReviews = marketItems.reduce((sum, item) => sum + item.reviews, 0);
  const totalCommerceRevenue = commercePurchases.reduce((sum, purchase) => {
    if (!['completed', 'claimed'].includes(purchase.status)) return sum;
    return sum + parseCurrency(purchase.itemPrice);
  }, 0);
  const activeCommerceLicenses = commercePurchases.filter(purchase => purchase.licenseStatus === 'active').length;
  const mockRevenue = `${new Intl.NumberFormat('vi-VN').format(totalCommerceRevenue)}đ`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hệ thống Quản trị (Admin)</h1>
          <p className="text-zinc-400 text-sm mt-1">Quản lý toàn bộ dữ liệu nền tảng SN Studio.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-bold text-brand-400 uppercase tracking-wider animate-pulse">
            <div className="w-2 h-2 rounded-full bg-brand-accent shadow-glow-red" />
            Super Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar (3/12) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-2 space-y-1 relative shadow-glass">
            {[
              { id: 'overview', icon: <LayoutDashboard size={14} />, label: 'Tổng quan hệ thống' },
              { id: 'users', icon: <Users size={14} />, label: 'Quản lý Người dùng' },
              { id: 'apps', icon: <Terminal size={14} />, label: 'Quản lý Ứng dụng' },
              { id: 'articles', icon: <FileText size={14} />, label: 'Quản lý Bài viết' },
              { id: 'marketplace', icon: <Cpu size={14} />, label: 'Quản lý Marketplace' },
              { id: 'settings', icon: <Settings size={14} />, label: 'Cài đặt Hệ thống' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'bg-brand-accent/15 text-brand-accent font-semibold pl-4'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span 
                    layoutId="activeAdminTabIndicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-brand-accent shadow-[0_0_6px_#ff003c]"
                  />
                )}
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content (9/12) */}
        <main className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Tổng ứng dụng', value: apps.length, suffix: 'Apps', color: 'text-blue-400' },
                    { label: 'Tổng lượt tải', value: totalDownloads.toLocaleString('vi-VN'), suffix: 'Downloads', color: 'text-brand-400' },
                    { label: 'Tổng đánh giá', value: totalReviews, suffix: 'Reviews', color: 'text-orange-400' },
                    { label: 'Doanh thu mô phỏng', value: mockRevenue, suffix: '', color: 'text-rose-400' }
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-glass relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 relative z-10">{stat.label}</p>
                      <div className="flex items-baseline gap-1.5 relative z-10">
                        <p className={`text-2xl font-extrabold font-mono tracking-tight ${stat.color}`}>{stat.value}</p>
                        {stat.suffix && <span className="text-[10px] font-semibold text-zinc-500 uppercase">{stat.suffix}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Revenue Chart */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-glass">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tăng trưởng Doanh thu & Người dùng</h4>
                      <span className="text-[9px] text-brand-400 font-mono bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 animate-pulse">LIVE</span>
                    </div>
                    <div className="h-40 w-full bg-zinc-950/80 rounded border border-zinc-900 p-2 flex items-end relative overflow-hidden">
                      <div className="absolute inset-x-0 top-1/4 h-[1px] bg-zinc-900/50" />
                      <div className="absolute inset-x-0 top-2/4 h-[1px] bg-zinc-900/50" />
                      <div className="absolute inset-x-0 top-3/4 h-[1px] bg-zinc-900/50" />
                      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff003c" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#ff003c" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="grad-users" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} d="M 0 80 Q 20 70 40 50 T 70 30 T 100 10 L 100 100 L 0 100 Z" fill="url(#grad-revenue)" />
                        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }} d="M 0 80 Q 20 70 40 50 T 70 30 T 100 10" fill="none" stroke="#ff003c" strokeWidth="2.5" />
                        
                        <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} d="M 0 95 Q 25 90 50 70 T 80 40 T 100 25 L 100 100 L 0 100 Z" fill="url(#grad-users)" />
                        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} d="M 0 95 Q 25 90 50 70 T 80 40 T 100 25" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 2" />
                      </svg>
                      <div className="absolute right-3 top-2 flex flex-col gap-1 text-[9px] font-mono">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 bg-brand-accent"></div> <span className="text-zinc-400">Doanh thu</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-0.5 bg-blue-400"></div> <span className="text-zinc-400">Người dùng</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Downloads Chart */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-glass">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lưu lượng Tải xuống Hệ thống</h4>
                    </div>
                    <div className="h-40 w-full flex items-end gap-2 px-2 pb-2 pt-6 border-b border-zinc-800">
                      {[35, 45, 30, 60, 80, 55, 90].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                          <div className="absolute -top-6 text-[9px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">{val}K</div>
                          <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: `${val}%` }} 
                            transition={{ duration: 0.8, delay: i * 0.1, type: 'spring' }}
                            className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 border-t-2 border-emerald-500 rounded-t-sm transition-colors" 
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] font-mono text-zinc-600 px-2">
                      <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                    </div>
                  </div>
                </div>

                {/* Top Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Top Apps */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-glass">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top Ứng dụng Tải nhiều</h4>
                    <div className="space-y-3">
                      {apps.slice(0, 4).sort((a,b) => parseFloat(b.downloads) - parseFloat(a.downloads)).map((app, i) => (
                        <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-zinc-600 font-mono w-4">#{i+1}</span>
                            <div>
                              <p className="text-xs font-bold text-white">{app.name}</p>
                              <p className="text-[10px] text-zinc-500">{app.categoryLabel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-400 font-mono">{app.downloads}</p>
                            <p className="text-[9px] text-zinc-500 uppercase">Lượt tải</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-glass">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Sản phẩm Doanh thu cao</h4>
                    <div className="space-y-3">
                      {marketItems.slice(0, 4).filter(m => m.price !== '0đ').map((item, i) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-zinc-600 font-mono w-4">#{i+1}</span>
                            <div>
                              <p className="text-xs font-bold text-white">{item.name}</p>
                              <p className="text-[10px] text-zinc-500">{item.seller}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-rose-400 font-mono">{item.price}</p>
                            <p className="text-[9px] text-zinc-500 uppercase">{item.downloads} sales</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass">
                    <h3 className="text-sm font-bold text-white mb-4">Nhật ký quản trị viên gần đây</h3>
                    <div className="space-y-4">
                      {[
                        { msg: 'Cập nhật cấu hình bảo mật toàn hệ thống', time: '10 phút trước', user: 'system', color: 'bg-brand-500' },
                        { msg: 'Xóa người dùng vi phạm chính sách [ID: u-spam-99]', time: '2 giờ trước', user: username, color: 'bg-red-500' },
                        { msg: 'Phê duyệt sản phẩm mới lên Marketplace', time: 'Hôm qua', user: 'Admin Lâm', color: 'bg-emerald-500' },
                        { msg: 'Sao lưu cơ sở dữ liệu định kỳ thành công', time: 'Hôm qua', user: 'system', color: 'bg-blue-500' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0 last:pb-0">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.color}`} />
                          <div>
                            <p className="text-sm text-zinc-200">{log.msg}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Thực hiện: <span className="text-zinc-400">{log.user}</span> • {log.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass space-y-4">
                    <h3 className="text-sm font-bold text-white mb-2">Thao tác Nhanh</h3>
                    <button onClick={() => handleActionMock('Clear Cache')} className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-brand-500/30 hover:bg-zinc-800 transition-all text-left">
                      <div>
                        <p className="text-xs font-bold text-white">Xóa Bộ nhớ Cache</p>
                        <p className="text-[10px] text-zinc-500">Dọn dẹp cache hệ thống (245MB)</p>
                      </div>
                      <Zap size={14} className="text-zinc-400" />
                    </button>
                    <button onClick={() => handleActionMock('Backup Database')} className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-brand-500/30 hover:bg-zinc-800 transition-all text-left">
                      <div>
                        <p className="text-xs font-bold text-white">Sao lưu Dữ liệu</p>
                        <p className="text-[10px] text-zinc-500">Tạo bản snapshot DB thủ công</p>
                      </div>
                      <Shield size={14} className="text-zinc-400" />
                    </button>
                    <button onClick={() => handleActionMock('Restart Services')} className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/10 transition-all text-left group">
                      <div>
                        <p className="text-xs font-bold text-red-400">Khởi động lại Core</p>
                        <p className="text-[10px] text-zinc-500 group-hover:text-red-300/70">Reload lại các microservices</p>
                      </div>
                      <Cpu size={14} className="text-red-400/50 group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Quản lý Người dùng</h3>
                    <p className="text-xs text-zinc-500 mt-1">Quản lý hồ sơ, quyền hạn và trạng thái của các thành viên.</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input 
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={userSearchQuery}
                      onChange={e => setUserSearchQuery(e.target.value)}
                      className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-brand-accent w-full sm:w-48"
                    />
                    <button 
                      onClick={() => {
                        setEditingUser(null);
                        setIsUserModalOpen(true);
                      }} 
                      className="whitespace-nowrap rounded bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors shadow-glow-red"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="text-[10px] uppercase bg-zinc-900/50 text-zinc-500 font-bold border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3">Thành viên</th>
                        <th className="px-4 py-3">Vai trò / Cấp bậc</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.filter(profile => {
                        const term = userSearchQuery.toLowerCase();
                        return (
                          (profile.display_name || '').toLowerCase().includes(term) ||
                          (profile.username || '').toLowerCase().includes(term) ||
                          (profile.email || '').toLowerCase().includes(term) ||
                          (profile.role || '').toLowerCase().includes(term)
                        );
                      }).map(profile => (
                        <tr key={profile.id} className="border-b border-zinc-800/50 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center font-bold text-brand-400 text-xs border border-brand-500/20 uppercase shrink-0 overflow-hidden">
                                {profile.avatar_url ? (
                                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  (profile.display_name || profile.username || profile.email || 'US').substring(0, 2)
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{profile.display_name || profile.username || 'Chưa đặt tên'}</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">@{profile.username || 'unknown'} • {profile.email || 'no-email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-zinc-300">{profile.role || 'user'}</div>
                            <div className="text-[10px] text-brand-400 font-semibold mt-0.5">{profile.id}</div>
                          </td>
                          <td className="px-4 py-3">
                            {profile.status === 'banned' ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-wider">BANNED</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider">ACTIVE</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleToggleBan(profile)}
                                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${profile.status === 'banned' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}
                              >
                                {profile.status === 'banned' ? 'Mở Khóa' : 'Đình Chỉ'}
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingUser(profile);
                                  setIsUserModalOpen(true);
                                }}
                                className="px-2 py-1 text-[10px] font-bold rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                              >
                                Sửa
                              </button>
                              <button 
                                onClick={() => handleDeleteMember(profile.id)}
                                className="px-2 py-1 text-[10px] font-bold rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'apps' && (
              <motion.div
                key="apps"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Quản lý Ứng dụng</h3>
                    <p className="text-xs text-zinc-500 mt-1">Kho phần mềm cốt lõi.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingApp(null);
                      setIsAppModalOpen(true);
                    }} 
                    className="rounded bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors shadow-glow-red"
                  >
                    + Thêm ứng dụng
                  </button>
                </div>
                
                <div className="space-y-3">
                  {apps.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-brand-500/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-brand-accent">
                          {app.iconType === 'terminal' && <Terminal size={20} />}
                          {app.iconType === 'shield' && <Shield size={20} />}
                          {app.iconType === 'code' && <Code size={20} />}
                          {app.iconType === 'zap' && <Zap size={20} />}
                          {app.iconType === 'cpu' && <Cpu size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{app.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{app.version} • {app.categoryLabel}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingApp(app);
                            setIsAppModalOpen(true);
                          }} 
                          className="px-3 py-1.5 text-[10px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        <button onClick={() => handleDeleteApp(app.id)} className="px-3 py-1.5 text-[10px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quản lý phiên bản ứng dụng</h4>
                    <p className="text-[11px] text-zinc-500 mt-1">Thêm hoặc xóa lịch sử phiên bản cho từng app.</p>
                  </div>

                  <form onSubmit={handleSaveAppVersion} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                    <select
                      required
                      value={appVersionDraft.appId}
                      onChange={e => setAppVersionDraft({ ...appVersionDraft, appId: e.target.value })}
                      className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent md:col-span-2"
                    >
                      <option value="">Chọn ứng dụng</option>
                      {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                    </select>
                    <input
                      required
                      value={appVersionDraft.version}
                      onChange={e => setAppVersionDraft({ ...appVersionDraft, version: e.target.value })}
                      placeholder="v1.0.0"
                      className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                    />
                    <input
                      type="date"
                      value={appVersionDraft.releaseDate}
                      onChange={e => setAppVersionDraft({ ...appVersionDraft, releaseDate: e.target.value })}
                      className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                    />
                    <button className="rounded bg-brand-accent px-3 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors">Lưu phiên bản</button>
                    <input
                      value={appVersionDraft.changelog}
                      onChange={e => setAppVersionDraft({ ...appVersionDraft, changelog: e.target.value })}
                      placeholder="Changelog"
                      className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent md:col-span-5"
                    />
                  </form>

                  <div className="space-y-2">
                    {apps.flatMap(app => (app.versions || []).map(version => ({ app, version }))).map(({ app, version }) => (
                      <div key={`${app.id}-${version.id || version.version}`} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2">
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{app.name} <span className="text-brand-400">{version.version}</span></p>
                          <p className="text-[10px] text-zinc-500">{version.releaseDate} • {version.changelog || 'Không có changelog'}</p>
                        </div>
                        <button onClick={() => handleDeleteAppVersion(version.id)} className="px-2 py-1 text-[10px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Xóa</button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'articles' && (
              <motion.div
                key="articles-list"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Quản lý Bài viết</h3>
                    <p className="text-xs text-zinc-500 mt-1">Nội dung chuyên môn và hướng dẫn.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingArticle(null);
                      setIsArticleModalOpen(true);
                    }} 
                    className="rounded bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors shadow-glow-red"
                  >
                    + Thêm bài viết
                  </button>
                </div>
                
                <div className="space-y-3">
                  {articles.map(art => (
                    <div key={art.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-brand-500/20 transition-colors">
                      <div className="flex items-center gap-4 w-2/3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
                          <img src={art.cover} alt={art.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">{art.title}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{art.author} • {art.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingArticle(art);
                            setIsArticleModalOpen(true);
                          }} 
                          className="px-3 py-1.5 text-[10px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        <button onClick={() => handleDeleteArticle(art.id)} className="px-3 py-1.5 text-[10px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'marketplace' && (
              <motion.div
                key="market-list"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Quản lý Marketplace</h3>
                    <p className="text-xs text-zinc-500 mt-1">Quản lý các sản phẩm, giao diện, plugin.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingMarket(null);
                      setIsMarketModalOpen(true);
                    }} 
                    className="rounded bg-brand-accent px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors shadow-glow-red"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
                
                <div className="space-y-3">
                  {marketItems.map(mItem => (
                    <div key={mItem.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-brand-500/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0 border border-zinc-800 text-zinc-400">
                          {/* Generic icon based on marketplace icon type */}
                          <div className="uppercase font-bold text-xs">{mItem.iconType.substring(0, 2)}</div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{mItem.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{mItem.price} • {mItem.categoryLabel}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingMarket(mItem);
                            setIsMarketModalOpen(true);
                          }} 
                          className="px-3 py-1.5 text-[10px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        <button onClick={() => handleDeleteMarket(mItem.id)} className="px-3 py-1.5 text-[10px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 border-t border-zinc-800 pt-6">
                  <div>
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Danh mục Marketplace</h4>
                      <p className="text-[11px] text-zinc-500 mt-1">Tạo, chỉnh sửa hoặc xóa danh mục sản phẩm.</p>
                    </div>

                    <form onSubmit={handleSaveMarketCategory} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <input
                        required
                        value={categoryDraft.name || ''}
                        onChange={e => setCategoryDraft({ ...categoryDraft, name: e.target.value })}
                        placeholder="Name"
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <input
                        value={categoryDraft.slug || ''}
                        onChange={e => setCategoryDraft({ ...categoryDraft, slug: e.target.value })}
                        placeholder="slug"
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <input
                        required
                        value={categoryDraft.label || ''}
                        onChange={e => setCategoryDraft({ ...categoryDraft, label: e.target.value })}
                        placeholder="Tên hiển thị"
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <button className="rounded bg-brand-accent px-3 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors">Lưu</button>
                    </form>

                    <div className="space-y-2">
                      {marketCategories.map(category => (
                        <div key={category.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2">
                          <div>
                            <p className="text-xs font-bold text-zinc-200">{category.label}</p>
                            <p className="text-[10px] text-zinc-500">{category.name} • {category.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setCategoryDraft(category)} className="px-2 py-1 text-[10px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors">Sửa</button>
                            <button onClick={() => handleDeleteMarketCategory(category.id)} className="px-2 py-1 text-[10px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Xóa</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Phiên bản Marketplace</h4>
                      <p className="text-[11px] text-zinc-500 mt-1">Quản lý file phát hành và changelog.</p>
                    </div>

                    <form onSubmit={handleSaveMarketVersion} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <select
                        required
                        value={marketVersionDraft.itemId}
                        onChange={e => setMarketVersionDraft({ ...marketVersionDraft, itemId: e.target.value })}
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent md:col-span-2"
                      >
                        <option value="">Chọn sản phẩm</option>
                        {marketItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                      <input
                        required
                        value={marketVersionDraft.version}
                        onChange={e => setMarketVersionDraft({ ...marketVersionDraft, version: e.target.value })}
                        placeholder="v1.0.0"
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <input
                        type="date"
                        value={marketVersionDraft.releaseDate}
                        onChange={e => setMarketVersionDraft({ ...marketVersionDraft, releaseDate: e.target.value })}
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <input
                        value={marketVersionDraft.filePath}
                        onChange={e => setMarketVersionDraft({ ...marketVersionDraft, filePath: e.target.value })}
                        placeholder="app-files path"
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent md:col-span-2"
                      />
                      <div className="md:col-span-2">
                        <input
                          type="file"
                          onChange={e => handleUploadMarketVersionFile(e.target.files?.[0])}
                          className="block w-full text-[11px] text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-zinc-200 hover:file:bg-zinc-700"
                        />
                        <p className="mt-1 text-[10px] text-zinc-500">
                          File size: {formatFileSize(marketVersionDraft.fileSize)}
                        </p>
                      </div>
                      <input
                        value={marketVersionDraft.changelog}
                        onChange={e => setMarketVersionDraft({ ...marketVersionDraft, changelog: e.target.value })}
                        placeholder="Changelog"
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <button className="rounded bg-brand-accent px-3 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors">Lưu phiên bản</button>
                    </form>

                    <div className="space-y-2">
                      {marketItems.flatMap(item => (item.versions || []).map(version => ({ item, version }))).map(({ item, version }) => (
                        <div key={version.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2">
                          <div>
                            <p className="text-xs font-bold text-zinc-200">{item.name} <span className="text-brand-400">{version.version}</span></p>
                            <p className="text-[10px] text-zinc-500">{version.releaseDate} • {version.filePath || 'Chưa có file'} • {formatFileSize(version.fileSize || 0)}</p>
                          </div>
                          <button onClick={() => handleDeleteMarketVersion(version.id)} className="px-2 py-1 text-[10px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Xóa</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Star size={14} className="text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quản lý đánh giá</h4>
                  </div>

                  {editingReview && (
                    <form onSubmit={handleSaveReview} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
                      <input
                        value={editingReview.authorName}
                        onChange={e => setEditingReview({ ...editingReview, authorName: e.target.value })}
                        className="rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editingReview.rating}
                        onChange={e => setEditingReview({ ...editingReview, rating: parseInt(e.target.value, 10) || 1 })}
                        className="rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                      <input
                        value={editingReview.comment}
                        onChange={e => setEditingReview({ ...editingReview, comment: e.target.value })}
                        className="rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent md:col-span-3"
                      />
                      <button className="rounded bg-brand-accent px-3 py-2 text-xs font-bold text-white hover:bg-brand-600 transition-colors">Lưu</button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {marketItems.flatMap(item => (item.reviewItems || []).map(review => ({ item, review }))).map(({ item, review }) => (
                      <div key={review.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2">
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{review.authorName} <span className="text-amber-400">{review.rating}★</span></p>
                          <p className="text-[10px] text-zinc-500">{item.name} • {review.comment}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingReview(review)} className="px-2 py-1 text-[10px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors">Sửa</button>
                          <button onClick={() => handleDeleteReview(review.id)} className="px-2 py-1 text-[10px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors">Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Database size={14} className="text-brand-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Commerce & Licensing</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Giao dịch', value: commercePurchases.length, color: 'text-brand-400' },
                      { label: 'License active', value: activeCommerceLicenses, color: 'text-emerald-400' },
                      { label: 'Nhật ký tải', value: commerceDownloads.length, color: 'text-blue-400' },
                      { label: 'Doanh thu', value: mockRevenue, color: 'text-rose-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">{stat.label}</p>
                        <p className={`mt-1 text-lg font-extrabold font-mono ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div>
                      <h5 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Giao dịch gần đây</h5>
                      <div className="space-y-2">
                        {commercePurchases.slice(0, 8).map((purchase) => (
                          <div key={purchase.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-white">{purchase.itemName}</p>
                                <p className="mt-0.5 text-[10px] text-zinc-500">
                                  {purchase.buyerDisplayName || purchase.buyerUsername || purchase.buyerEmail} • {purchase.purchaseDate} • {purchase.itemPrice}
                                </p>
                                <p className="mt-1 text-[10px] text-zinc-500">
                                  License: <span className="text-zinc-300">{maskLicenseKey(purchase.licenseLast4)}</span> • {purchase.licenseStatus}
                                </p>
                              </div>
                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                purchase.status === 'refunded'
                                  ? 'border-red-500/20 bg-red-500/10 text-red-400'
                                  : purchase.status === 'revoked'
                                    ? 'border-orange-500/20 bg-orange-500/10 text-orange-400'
                                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              }`}>
                                {purchase.status}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button onClick={() => handleRefundPurchase(purchase.id)} className="rounded bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/20">
                                Refund
                              </button>
                              <button onClick={() => handleRevokeLicense(purchase.id)} className="rounded bg-orange-500/10 px-2 py-1 text-[10px] font-bold text-orange-400 hover:bg-orange-500/20">
                                Revoke license
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Lượt tải gần đây</h5>
                      <div className="space-y-2">
                        {commerceDownloads.slice(0, 8).map((download) => (
                          <div key={download.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-white">{download.itemName}</p>
                                <p className="mt-0.5 text-[10px] text-zinc-500">
                                  {download.buyerDisplayName || download.buyerUsername || download.buyerEmail} • {download.createdAt}
                                </p>
                                <p className="mt-1 text-[10px] text-zinc-500">
                                  {download.versionString || 'unknown'} • {formatFileSize(download.fileSize)}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                                {download.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                className="space-y-6"
              >
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass">
                  <h3 className="text-sm font-bold text-white mb-6">Cài đặt Hệ thống (System Settings)</h3>
                  
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2"><Globe size={14} /> Website Info</h4>
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1">Tên Website (Site Name)</label>
                          <input
                            type="text"
                            value={sysSettings.siteName}
                            onChange={e => setSysSettings({...sysSettings, siteName: e.target.value})}
                            className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1">Email Liên hệ (Contact)</label>
                          <input
                            type="email"
                            value={sysSettings.contactEmail}
                            onChange={e => setSysSettings({...sysSettings, contactEmail: e.target.value})}
                            className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1">Logo URL (Tùy chọn)</label>
                          <input
                            type="text"
                            value={sysSettings.logoUrl}
                            onChange={e => setSysSettings({...sysSettings, logoUrl: e.target.value})}
                            className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2"><Settings size={14} /> Tùy chỉnh Nâng cao</h4>
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1">Chủ đề (Theme)</label>
                          <select
                            value={sysSettings.theme}
                            onChange={e => setSysSettings({...sysSettings, theme: e.target.value})}
                            className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                          >
                            <option value="dark">Chế độ Tối (Dark Mode)</option>
                            <option value="light">Chế độ Sáng (Light Mode - Beta)</option>
                            <option value="system">Theo hệ thống (System)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1">SEO Title (Tiêu đề Meta)</label>
                          <input
                            type="text"
                            value={sysSettings.seoTitle}
                            onChange={e => setSysSettings({...sysSettings, seoTitle: e.target.value})}
                            className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div className="pt-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={sysSettings.maintenanceMode}
                                onChange={e => setSysSettings({...sysSettings, maintenanceMode: e.target.checked})}
                              />
                              <div className={`block w-10 h-6 rounded-full transition-colors ${sysSettings.maintenanceMode ? 'bg-red-500' : 'bg-zinc-800'}`}></div>
                              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${sysSettings.maintenanceMode ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <div className="text-xs font-bold text-white">Bật Chế độ Bảo trì (Maintenance Mode)</div>
                          </label>
                          <p className="text-[10px] text-zinc-500 mt-1 pl-12">Khi bật, chỉ Admin mới có thể truy cập hệ thống.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-zinc-800">
                      <button type="submit" className="px-6 py-2 bg-brand-accent hover:bg-brand-600 text-white text-sm font-bold rounded-lg shadow-glow-red transition-all">
                        Lưu Cấu hình
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glass">
                  <h3 className="text-sm font-bold text-white mb-6">Sao lưu & Phục hồi Dữ liệu</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Database size={16} /></div>
                        <h4 className="text-sm font-bold text-white">Xuất Dữ liệu (Backup)</h4>
                      </div>
                      <p className="text-xs text-zinc-500 mb-4">Tải xuống toàn bộ dữ liệu cấu hình, người dùng, ứng dụng dưới định dạng JSON.</p>
                      <button onClick={handleBackup} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition-all">
                        Tải file Backup (.json)
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg"><Zap size={16} /></div>
                        <h4 className="text-sm font-bold text-white">Phục hồi (Restore)</h4>
                      </div>
                      <p className="text-xs text-zinc-500 mb-4">Ghi đè dữ liệu hiện tại bằng file JSON đã sao lưu trước đó. <span className="text-red-400">Cẩn thận!</span></p>
                      <button onClick={handleRestore} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition-all">
                        Chọn file Restore
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={`fixed right-4 top-4 z-[10000] flex w-[min(92vw,360px)] items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-50'
                : 'border-red-500/30 bg-red-500/10 text-red-50'
            }`}
          >
            <div className={`mt-0.5 rounded-full p-1.5 ${toast.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {toast.type === 'success' ? 'Thành công' : 'Lỗi'}
              </p>
              <p className="mt-1 text-sm leading-5">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-md p-1 text-current/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminAppModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        app={editingApp}
        onSave={handleSaveApp}
      />

      <AdminArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        article={editingArticle}
        onSave={handleSaveArticle}
      />

      <AdminMarketModal
        isOpen={isMarketModalOpen}
        onClose={() => setIsMarketModalOpen(false)}
        item={editingMarket}
        onSave={handleSaveMarket}
        categories={marketCategories}
      />

      <AdminUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={editingUser}
        onSave={handleSaveMember}
      />
    </div>
  );
};
