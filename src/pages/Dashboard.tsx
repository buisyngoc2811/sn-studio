import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, 
  Shield, 
  Terminal, 
  Zap, 
  Code,
  Download, 
  Settings,
  Star,
  LayoutDashboard,
  Bell,
  FileText,
  ShoppingCart,
  Key
} from 'lucide-react';
import { articlesData, recentNotifications } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { fetchApps, AppData } from '../lib/apps';
import { fetchProfileById } from '../lib/profiles';
import { fetchMarketplacePurchases, MarketplacePurchaseRecord, maskLicenseKey } from '../lib/commerce';

interface DashboardProps {
  username: string;
  setRoute: (route: string) => void;
}

type DashTab = 'overview' | 'downloads' | 'articles' | 'purchases' | 'notifications' | 'activity' | 'settings';

export const Dashboard: React.FC<DashboardProps> = ({ username, setRoute }) => {
  const [activeTab, setActiveTab] = useState<DashTab>('overview');
  
  // Settings Form states
  const [profileName, setProfileName] = useState(username);
  const [profileEmail, setProfileEmail] = useState(`${username.toLowerCase().replace(/\s+/g, '')}@snstudio.vn`);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [apps, setApps] = useState<AppData[]>([]);
  const [articles, setArticles] = useState<any[]>(articlesData);
  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<MarketplacePurchaseRecord[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setRoute('login');
        return;
      }
      
      const data = await fetchProfileById(session.user.id);
      if (!data) {
        setRoute('login');
        return;
      }

      if (data.status === 'banned') {
        await supabase.auth.signOut();
        setRoute('login');
        return;
      }

      setProfile(data);
      setProfileName(data.display_name || data.username);
      setProfileEmail(data.email);
      setAvatarUrl(data.avatar_url || '');
    };
    
    fetchProfile();
    const loadArticles = () => {
      const storedArticles = localStorage.getItem('sn_articles_db');
      if (storedArticles) setArticles(JSON.parse(storedArticles));
    };
    const loadApps = async () => {
      try {
        setApps(await fetchApps());
      } catch (error) {
        console.error('Error loading dashboard apps:', error);
        setApps([]);
      }
    };
    const loadPurchases = async () => {
      try {
        setPurchases(await fetchMarketplacePurchases());
      } catch (error) {
        console.error('Error loading dashboard purchases:', error);
        setPurchases([]);
      }
    };

    loadArticles();
    loadApps();
    loadPurchases();
    window.addEventListener('apps-db-updated', loadApps);
    window.addEventListener('articles-db-updated', loadArticles);
    window.addEventListener('commerce-db-updated', loadPurchases);
    return () => {
      window.removeEventListener('apps-db-updated', loadApps);
      window.removeEventListener('articles-db-updated', loadArticles);
      window.removeEventListener('commerce-db-updated', loadPurchases);
    };
  }, []);

  // Local Storage Data
  const downloadedIds = JSON.parse(localStorage.getItem('sn_downloaded_apps') || '[]');
  const savedArtIds = JSON.parse(localStorage.getItem('sn_saved_articles') || '[]');
  const downloadedApps = downloadedIds.length > 0 
    ? apps.filter(app => downloadedIds.includes(app.id)) 
    : [];

  const savedArticles = savedArtIds.length > 0
    ? articles.filter(art => savedArtIds.includes(art.id))
    : articles.slice(0, 1); // fallback mock

  const joinDate = new Date().toLocaleDateString('vi-VN');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Không tìm thấy phiên đăng nhập!');
      return;
    }
    
      const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        username: profile?.username || username.split('@')[0],
        display_name: profileName,
        email: profileEmail,
        avatar_url: avatarUrl,
        role: profile?.role || 'user'
      });

    if (error) {
      alert(`Lỗi cập nhật: ${error.message}`);
    } else {
      alert('Cập nhật hồ sơ cá nhân thành công!');
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data);
        setProfileName(data.display_name || data.username);
        setProfileEmail(data.email);
        setAvatarUrl(data.avatar_url || '');
      }
    }
  };

  const handleAppAction = (appName: string, action: string) => {
    alert(`Đang khởi chạy tác vụ [${action}] đối với ứng dụng "${appName}"...`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Profile Summary & Tabs (3/12 cols) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* User Bio Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-center relative overflow-hidden transition-all hover:border-brand-500/25">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-accent via-red-500 to-transparent" />
            
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-400 text-2xl uppercase mb-3.5 shadow-glow-red overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.display_name?.substring(0, 2) || username.substring(0, 2)
              )}
            </div>
            
            <h2 className="text-base font-bold text-white">{profile?.display_name || username}</h2>
            <p className="text-[10px] text-zinc-400 mt-0.5">@{profile?.username || username.split('@')[0]}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{profile?.email || profileEmail}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Tham gia: {joinDate}</p>
            <span className="inline-block mt-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 text-[9px] font-bold text-brand-400 uppercase tracking-wider animate-pulse">
              {profile?.role === 'admin' ? 'Quản trị viên' : profile?.role === 'developer' ? 'Nhà phát triển' : 'Hội viên Kim Cương'}
            </span>

            {/* Minor info stats */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/5 text-center">
              <div className="group cursor-default">
                <span className="block text-xs font-bold text-white font-mono group-hover:text-glow-red transition-all">4</span>
                <span className="text-[9px] text-zinc-550 uppercase">Đã cài</span>
              </div>
              <div className="group cursor-default">
                <span className="block text-xs font-bold text-brand-400 font-mono group-hover:text-glow-red transition-all">82</span>
                <span className="text-[9px] text-zinc-550 uppercase">Điểm</span>
              </div>
              <div className="group cursor-default">
                <span className="block text-xs font-bold text-green-400 font-mono group-hover:text-glow-red transition-all">99%</span>
                <span className="text-[9px] text-zinc-550 uppercase">Uy tín</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-2 space-y-1 relative">
            {[
              { id: 'overview', icon: <LayoutDashboard size={14} />, label: 'Bảng điều khiển chung' },
              { id: 'downloads', icon: <Download size={14} />, label: 'Ứng dụng đã tải' },
              { id: 'articles', icon: <FileText size={14} />, label: 'Bài viết đã lưu' },
              { id: 'purchases', icon: <ShoppingCart size={14} />, label: 'Sản phẩm đã mua' },
              { id: 'notifications', icon: <Bell size={14} />, label: 'Thông báo' },
              { id: 'activity', icon: <Star size={14} />, label: 'Hoạt động gần đây' },
              { id: 'settings', icon: <Settings size={14} />, label: 'Cấu hình tài khoản' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashTab)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'bg-brand-accent/15 text-brand-accent font-semibold pl-4'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span 
                    layoutId="activeDashTabIndicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-brand-accent shadow-[0_0_6px_#ff003c]"
                  />
                )}
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

        </aside>

        {/* Right Side: Tab content (9/12 cols) */}
        <main className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview-tab"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                {/* Welcome Alert banner */}
                <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-6 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-brand-500/20 shadow-glass">
                  <div className="absolute inset-0 bg-grid opacity-10" />
                  <div className="relative z-10 space-y-1">
                    <h3 className="text-lg font-bold text-white leading-tight">Chào mừng quay trở lại, {username}!</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
                      Hệ thống máy chủ SN Studio đang hoạt động ổn định. Cập nhật các bản vá bảo mật mới nhất cho các tool của bạn bên dưới.
                    </p>
                  </div>
                  <button 
                    onClick={() => setRoute('apps')}
                    className="relative z-10 rounded bg-brand-accent hover:bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-colors shrink-0 shadow-glow-red active:scale-95 duration-200"
                  >
                    Cập nhật ứng dụng
                  </button>
                </div>

                {/* Graphic chart summary */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lưu lượng biên dịch code & Tải CPU</h4>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Phân tích hiệu năng thời gian thực</span>
                    </div>
                    <span className="text-[10px] text-brand-400 font-mono bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 animate-pulse">● LIVE METRICS</span>
                  </div>

                  {/* SVG Graph with Self-Drawing path transitions */}
                  <div className="h-32 w-full bg-zinc-950/80 rounded border border-zinc-900 p-2 flex items-end relative overflow-hidden">
                    <div className="absolute inset-x-0 top-1/4 h-[1px] bg-zinc-900/50" />
                    <div className="absolute inset-x-0 top-2/4 h-[1px] bg-zinc-900/50" />
                    <div className="absolute inset-x-0 top-3/4 h-[1px] bg-zinc-900/50" />

                    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff003c" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#ff003c" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Fill Area underneath curve */}
                      <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        d="M 0 90 Q 15 45 30 70 T 60 25 T 80 50 T 100 20 L 100 100 L 0 100 Z"
                        fill="url(#gradient-area)"
                      />
                      {/* Stroke Curve line with self-drawing effect */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.3, ease: 'easeInOut' }}
                        d="M 0 90 Q 15 45 30 70 T 60 25 T 80 50 T 100 20"
                        fill="none"
                        stroke="#ff003c"
                        strokeWidth="2.2"
                      />
                    </svg>
                    
                    <span className="absolute right-4 top-2 text-[8px] text-zinc-500 font-mono">Max: 84 ms</span>
                    <span className="absolute left-4 bottom-2 text-[8px] text-zinc-500 font-mono">Min: 12 ms</span>
                  </div>
                </div>

                {/* Installed Apps Management */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-glass transition-all hover:border-brand-500/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ứng dụng đã cài đặt ({downloadedApps.length})</h4>
                    <button onClick={() => setActiveTab('downloads')} className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold transition-colors">Xem tất cả →</button>
                  </div>
                  
                  <div className="divide-y divide-zinc-900">
                    {downloadedApps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent/10 transition-colors">
                            {app.iconType === 'terminal' && <Terminal size={18} />}
                            {app.iconType === 'shield' && <Shield size={18} />}
                            {app.iconType === 'code' && <Code size={18} />}
                            {app.iconType === 'zap' && <Zap size={18} />}
                            {app.iconType === 'cpu' && <Cpu size={18} />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block group-hover:text-glow-subtle transition-all">{app.name}</span>
                            <span className="text-[10px] text-zinc-550 font-mono mt-0.5 block">{app.version} ● {app.categoryLabel}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAppAction(app.name, 'Open')}
                            className="rounded bg-zinc-900 hover:bg-brand-accent hover:text-white border border-zinc-800 hover:border-brand-500/30 text-zinc-350 px-3.5 py-1.5 text-[10px] font-semibold transition-colors duration-250"
                          >
                            Mở
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'downloads' ? (
              <motion.div
                key="downloads-tab"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-glass hover:border-brand-500/20 transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Lịch sử tải xuống</h3>
                  <p className="text-zinc-500 text-xs mt-1">Quản lý các ứng dụng và giấy phép bạn đã tải về từ kho ứng dụng.</p>
                </div>
                
                {downloadedApps.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                    <Download size={24} className="text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm font-medium">Bạn chưa tải ứng dụng nào</p>
                    <button onClick={() => setRoute('apps')} className="mt-4 text-xs font-semibold text-brand-400 hover:text-brand-300">Khám phá ứng dụng →</button>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-900">
                    {downloadedApps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between py-4 first:pt-0">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-brand-accent">
                            {app.iconType === 'terminal' && <Terminal size={20} />}
                            {app.iconType === 'shield' && <Shield size={20} />}
                            {app.iconType === 'code' && <Code size={20} />}
                            {app.iconType === 'zap' && <Zap size={20} />}
                            {app.iconType === 'cpu' && <Cpu size={20} />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block">{app.name}</span>
                            <span className="text-[11px] text-zinc-500 mt-0.5 block">{app.description.substring(0, 50)}...</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">{app.version}</span>
                          <span className="text-[10px] text-brand-400 font-medium">{app.isFree ? 'Bản quyền miễn phí' : 'Giấy phép Premium'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'articles' ? (
              <motion.div
                key="articles-tab"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-glass hover:border-brand-500/20 transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Bài viết đã lưu</h3>
                  <p className="text-zinc-500 text-xs mt-1">Danh sách các tài liệu và bài viết bạn đã lưu để đọc lại.</p>
                </div>

                {savedArticles.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                    <FileText size={24} className="text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm font-medium">Chưa có bài viết nào được lưu</p>
                    <button onClick={() => setRoute('knowledge')} className="mt-4 text-xs font-semibold text-brand-400 hover:text-brand-300">Đọc bài viết mới →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedArticles.map((art) => (
                      <div key={art.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-brand-500/30 transition-colors cursor-pointer" onClick={() => setRoute('knowledge')}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider bg-brand-500/10 px-2 py-0.5 rounded">{art.category}</span>
                          <span className="text-[10px] text-zinc-500">{art.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug mb-1">{art.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2">{art.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'purchases' ? (
              <motion.div
                key="purchases-tab"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-glass hover:border-brand-500/20 transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Sản phẩm & License</h3>
                  <p className="text-zinc-500 text-xs mt-1">Danh sách sản phẩm bạn đã mua từ Marketplace và License Key tương ứng.</p>
                </div>

                {purchases.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                    <ShoppingCart size={24} className="text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm font-medium">Bạn chưa mua sản phẩm nào</p>
                    <button onClick={() => setRoute('marketplace')} className="mt-4 text-xs font-semibold text-brand-400 hover:text-brand-300">Khám phá Marketplace →</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((item, idx: number) => (
                      <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-brand-500/30 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-white leading-snug">{item.itemName}</h4>
                              {item.badge && (
                                <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">{item.badge}</span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400">{item.seller} • Mua ngày {item.purchaseDate} • {item.status}</p>
                          </div>
                          
                          <div className="flex-shrink-0 bg-black/40 border border-white/[0.06] rounded-lg p-3 w-full md:w-auto">
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-1 flex items-center gap-1"><Key size={12}/> License Key</p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-emerald-400 font-mono select-all bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                {maskLicenseKey(item.licenseLast4)}
                              </code>
                              <button onClick={() => alert('License chỉ hiển thị một lần sau khi thanh toán.')} className="text-zinc-500 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              </button>
                            </div>
                            <p className="mt-2 text-[10px] text-zinc-500">Trạng thái license: {item.licenseStatus}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'notifications' ? (
              <motion.div
                key="notifications-tab"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-glass hover:border-brand-500/20 transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Thông báo hệ thống</h3>
                  <p className="text-zinc-500 text-xs mt-1">Cập nhật và cảnh báo từ SN Studio.</p>
                </div>
                <div className="divide-y divide-zinc-900">
                  {recentNotifications.map((notif) => (
                    <div key={notif.id} className="py-4 first:pt-0">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.urgent ? 'bg-brand-accent shadow-[0_0_8px_rgba(255,34,68,0.8)]' : 'bg-zinc-600'}`} />
                        <div>
                          <p className={`text-sm ${notif.urgent ? 'text-white font-semibold' : 'text-zinc-300'}`}>{notif.title}</p>
                          <span className="text-[10px] text-zinc-500 mt-1 block">{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'activity' ? (
              <motion.div
                key="activity-tab"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-glass hover:border-brand-500/20 transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Hoạt động gần đây</h3>
                  <p className="text-zinc-500 text-xs mt-1">Lịch sử tương tác của bạn trên nền tảng.</p>
                </div>
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-zinc-800">
                  {[
                    { title: 'Đăng nhập thành công', time: 'Vài giây trước', type: 'auth' },
                    { title: 'Cập nhật hồ sơ cá nhân', time: 'Hôm qua', type: 'settings' },
                    { title: 'Đã tải SN Terminal Pro', time: '2 ngày trước', type: 'download' },
                  ].map((act, i) => (
                    <div key={i} className="flex gap-4 relative z-10">
                      <div className="h-6 w-6 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center shrink-0">
                        <div className="h-2 w-2 rounded-full bg-brand-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{act.title}</p>
                        <span className="text-[10px] text-zinc-500">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Settings Tab content */
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-glass hover:border-brand-500/20 transition-all duration-300"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Cài đặt tài khoản</h3>
                  <p className="text-zinc-500 text-xs mt-1">Cấu hình hồ sơ cá nhân và cài đặt ứng dụng trên hệ thống.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Tên hiển thị</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Địa chỉ Email (Không đổi)</label>
                      <input
                        type="email"
                        disabled
                        value={profileEmail}
                        className="w-full rounded bg-zinc-900/50 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">Avatar URL (Link ảnh)</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="w-full rounded bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
                    />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Cấu hình cập nhật</h4>
                    
                    {/* Toggle 1: auto update */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-200 block font-semibold">Tự động tải cập nhật</span>
                        <span className="text-[10px] text-zinc-500">Cập nhật ứng dụng ngầm khi có phiên bản vá lỗi mới</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoUpdate}
                        onChange={(e) => setAutoUpdate(e.target.checked)}
                        className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 accent-brand-accent cursor-pointer"
                      />
                    </div>

                    {/* Toggle 2: notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-zinc-200 block font-semibold">Nhận cảnh báo bảo mật</span>
                        <span className="text-[10px] text-zinc-500">Gửi thông báo đẩy khi Guardian phát hiện mã nguồn nhiễm virus</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        className="h-4 w-4 rounded bg-zinc-900 border-zinc-800 accent-brand-accent cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      className="rounded bg-brand-accent hover:bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition-colors duration-300 shadow-glow-red active:scale-95"
                    >
                      Lưu các thay đổi
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};
