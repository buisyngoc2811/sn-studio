import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppCard } from '../components/AppCard';
import { AppDetailModal } from '../components/AppDetailModal';
import { appsData, AppData } from '../data/mockData';
import { Search } from 'lucide-react';

interface AppsProps {
  isLoggedIn: boolean;
  setRoute: (route: string) => void;
}

export const Apps: React.FC<AppsProps> = ({ isLoggedIn, setRoute }) => {
  const [apps, setApps] = useState<AppData[]>(appsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);

  useEffect(() => {
    const loadApps = () => {
      const storedApps = localStorage.getItem('sn_apps_db');
      if (storedApps) {
        setApps(JSON.parse(storedApps));
      } else {
        localStorage.setItem('sn_apps_db', JSON.stringify(appsData));
        setApps(appsData);
      }
    };
    loadApps();

    window.addEventListener('apps-db-updated', loadApps);
    return () => window.removeEventListener('apps-db-updated', loadApps);
  }, []);

  const categories = ['Tất cả', 'Hệ thống', 'Bảo mật', 'Phát triển', 'Tự động hóa'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Tất cả' || app.categoryLabel === selectedCategory;

    return matchesSearch && matchesCategory;
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

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm ứng dụng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors duration-250"
          />
          <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
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
            onClose={() => setSelectedApp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
