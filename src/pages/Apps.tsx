import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppCard } from '../components/AppCard';
import { AppDetailModal } from '../components/AppDetailModal';
import { fetchApps, AppData } from '../lib/apps';
import { Search, ChevronDown } from 'lucide-react';

interface AppsProps {
  isLoggedIn: boolean;
  setRoute: (route: string) => void;
}

export const Apps: React.FC<AppsProps> = ({ isLoggedIn, setRoute }) => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'rating'>('newest');
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      setIsLoading(true);
      try {
        setApps(await fetchApps());
      } catch (error) {
        console.error('Error fetching apps:', error);
        setApps([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadApps();
  }, []);

  const categories = ['Tất cả', ...Array.from(new Set(apps.map(app => app.categoryLabel)))];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Tất cả' || app.categoryLabel === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a: any, b: any) => {
    if (sortBy === 'newest') {
      return (b.rawDate || 0) - (a.rawDate || 0);
    } else if (sortBy === 'downloads') {
      return (b.rawDownloads || 0) - (a.rawDownloads || 0);
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const handleDownload = (app: AppData) => {
    setSelectedApp(app);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <span className="h-6 w-1.5 bg-brand-accent rounded-full" />
            Kho Ứng Dụng
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Tổng hợp các ứng dụng do SN Studio phát triển giúp tối ưu hóa hệ thống máy chủ và môi trường phát triển code.
          </p>
        </div>

        {/* Search Input and Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm ứng dụng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors duration-250"
            />
            <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto min-w-[140px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full rounded-lg bg-zinc-900 border border-zinc-800 py-2.5 pl-4 pr-10 text-sm text-zinc-300 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent cursor-pointer transition-colors"
            >
              <option value="newest">Mới nhất</option>
              <option value="downloads">Tải nhiều nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-3.5 text-zinc-500 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Category Selectors */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-4.5 py-2 text-xs font-semibold border transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-brand-accent/15 text-brand-accent border-brand-500/30 shadow-glow-red'
                : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white hover:border-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App Grid with smooth Layout Animations */}
      {filteredApps.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={app.id}
              >
                <AppCard
                  app={app}
                  onDownload={handleDownload}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Đang tải dữ liệu từ Supabase...</p>
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20">
          <svg className="mx-auto h-12 w-12 text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-bold text-zinc-300">Không tìm thấy ứng dụng</h3>
          <p className="mt-2 text-xs text-zinc-550">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
        </div>
      )}

      {/* App Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <AppDetailModal
            app={selectedApp}
            allApps={apps}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
