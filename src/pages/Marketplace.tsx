import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Palette, 
  Puzzle, 
  Wrench, 
  Plug,
  Star,
  ChevronDown
} from 'lucide-react';
import { MarketplaceItemModal } from '../components/MarketplaceItemModal';
import { fetchMarketplaceItems, MarketplaceItem } from '../lib/marketplace';

interface MarketplaceProps {
  isLoggedIn: boolean;
  setRoute: (route: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ isLoggedIn, setRoute }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [priceType, setPriceType] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'rating'>('newest');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 6;

  useEffect(() => {
    const loadMarketItems = async () => {
      setIsLoading(true);
      try {
        const result = await fetchMarketplaceItems({
          page,
          pageSize,
          search: searchQuery,
          category: selectedCategory,
          priceType,
          sortBy,
        });
        setMarketItems(result.items);
        setTotalItems(result.count);
      } catch (error) {
        console.error('Error loading marketplace:', error);
        setMarketItems([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketItems();
    window.addEventListener('market-db-updated', loadMarketItems);
    return () => window.removeEventListener('market-db-updated', loadMarketItems);
  }, [page, searchQuery, selectedCategory, priceType, sortBy]);

  const categories = ['Tất cả', 'Themes', 'Plugins', 'Tools', 'Extensions'];
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleAction = (item: MarketplaceItem) => {
    setSelectedItem(item);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'palette':
        return <Palette className="text-zinc-400 group-hover:text-brand-accent transition-colors duration-300" size={20} />;
      case 'puzzle':
        return <Puzzle className="text-zinc-400 group-hover:text-brand-accent transition-colors duration-300" size={20} />;
      case 'wrench':
        return <Wrench className="text-zinc-400 group-hover:text-brand-accent transition-colors duration-300" size={20} />;
      case 'plug':
        return <Plug className="text-zinc-400 group-hover:text-brand-accent transition-colors duration-300" size={20} />;
      default:
        return <Puzzle className="text-zinc-400 group-hover:text-brand-accent transition-colors duration-300" size={20} />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <span className="h-6 w-1.5 bg-brand-accent rounded-full" />
            Cửa Hàng Tiện Ích
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Giao diện (Themes), Plugins mở rộng và bộ công cụ cấu hình hữu ích được xây dựng bởi SN Studio & cộng đồng.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm plugin, giao diện..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors duration-250"
          />
          <Search className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            className={`rounded-lg px-4.5 py-2 text-xs font-semibold border transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-brand-accent/15 text-brand-accent border-brand-500/30 shadow-glow-red'
                : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white hover:border-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
        <div className="relative min-w-[135px]">
          <select
            value={priceType}
            onChange={(e) => {
              setPriceType(e.target.value as any);
              setPage(1);
            }}
            className="appearance-none w-full rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-850 py-2 pl-3 pr-9 text-xs font-semibold focus:outline-none focus:border-brand-accent"
          >
            <option value="all">Tất cả giá</option>
            <option value="free">Miễn phí</option>
            <option value="paid">Trả phí</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none" size={13} />
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setPage(1);
            }}
            className="appearance-none w-full rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-850 py-2 pl-3 pr-9 text-xs font-semibold focus:outline-none focus:border-brand-accent"
          >
            <option value="newest">Mới nhất</option>
            <option value="downloads">Tải nhiều nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none" size={13} />
        </div>
      </div>

      {marketItems.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {marketItems.map((item) => {
              const isFree = item.price === '0đ' || item.price === 'Miễn phí';
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  onClick={() => handleAction(item)}
                  className="group relative flex flex-col sm:flex-row justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all duration-400 hover:border-brand-500/35 hover:-translate-y-1 hover:shadow-glow-red glow-card-container cursor-pointer"
                >
                  <div className="flex-1 flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-all duration-300 overflow-hidden">
                      {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-7 w-7 object-contain" /> : renderIcon(item.iconType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors duration-300">
                          {item.name}
                        </h3>
                        {item.badge && (
                          <span className="rounded bg-brand-500/10 border border-brand-500/25 px-1.5 py-0.5 text-[8px] font-semibold text-brand-400 tracking-wider">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-sm group-hover:text-zinc-300 transition-colors duration-300">
                        {item.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-zinc-550">
                        <span>Bán bởi: <strong className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">{item.seller}</strong></span>
                        <span>●</span>
                        <div className="flex items-center gap-0.5 group-hover:text-zinc-400 transition-all duration-300">
                          <Star size={10} className="text-yellow-500" />
                          <span className="text-zinc-300 font-semibold">{item.rating}</span>
                          <span>({item.reviews})</span>
                        </div>
                        <span>●</span>
                        <span className="group-hover:text-zinc-400 transition-colors duration-300">{item.downloads} lượt tải</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:border-l border-zinc-850 sm:pl-5 flex sm:flex-col justify-between items-center sm:items-end gap-3 sm:w-28 shrink-0">
                    <div className="text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                      <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">Giá bán</span>
                      <span className={`text-sm font-extrabold transition-colors duration-300 ${isFree ? 'text-green-400' : 'text-white'}`}>
                        {item.price}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAction(item); }}
                      className={`w-full py-2 rounded-lg text-center text-xs font-bold transition-all duration-300 active:scale-95 border ${
                        isFree 
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-brand-accent hover:border-brand-500/30 hover:text-white' 
                          : 'bg-brand-accent border-brand-500/25 text-white hover:bg-brand-600 shadow-glow-red'
                      }`}
                    >
                      {isFree ? 'Cài ngay' : 'Xem chi tiết'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Đang tải marketplace từ Supabase...</p>
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20">
          <svg className="mx-auto h-12 w-12 text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-bold text-zinc-300">Không có sản phẩm tương ứng</h3>
          <p className="mt-2 text-xs text-zinc-550">Thử tìm kiếm với danh mục hoặc từ khóa khác.</p>
        </div>
      )}

      {totalItems > pageSize && (
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <p className="text-xs text-zinc-500">Trang {page}/{totalPages} · {totalItems} sản phẩm</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-400 disabled:opacity-40 hover:text-white hover:border-brand-500/30"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-400 disabled:opacity-40 hover:text-white hover:border-brand-500/30"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <MarketplaceItemModal
            item={selectedItem}
            isLoggedIn={isLoggedIn}
            setRoute={setRoute}
            onItemUpdated={setSelectedItem}
            onClose={() => setSelectedItem(null)}
            onOpenCart={() => {
              setSelectedItem(null);
              window.dispatchEvent(new Event('open-cart'));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
