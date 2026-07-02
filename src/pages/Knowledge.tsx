import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleDetailModal } from '../components/ArticleDetailModal';
import { articlesData, ArticleData } from '../data/mockData';
import { Search } from 'lucide-react';

export const Knowledge: React.FC = () => {
  const [articles, setArticles] = useState<ArticleData[]>(articlesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);

  useEffect(() => {
    const loadArticles = () => {
      const storedArticles = localStorage.getItem('sn_articles_db');
      if (storedArticles) {
        setArticles(JSON.parse(storedArticles));
      } else {
        localStorage.setItem('sn_articles_db', JSON.stringify(articlesData));
        setArticles(articlesData);
      }
    };
    loadArticles();

    window.addEventListener('articles-db-updated', loadArticles);
    return () => window.removeEventListener('articles-db-updated', loadArticles);
  }, []);

  const categories = ['Tất cả', 'Lập trình', 'Bảo mật', 'DevOps', 'Hệ điều hành'];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Tất cả' || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleArticleClick = (art: ArticleData) => {
    setSelectedArticle(art);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <span className="h-6 w-1.5 bg-brand-accent rounded-full" />
            Kiến Thức Chuyên Sâu
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Các bài viết phân tích, hướng dẫn kỹ thuật lập trình nâng cao, cấu hình hạ tầng và hardening bảo mật hệ thống.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
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

      {/* Articles Grid with smooth layouts */}
      {filteredArticles.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((art) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={art.id}
              >
                <ArticleCard
                  article={art}
                  onClick={handleArticleClick}
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
          <h3 className="mt-4 text-sm font-bold text-zinc-300">Không tìm thấy bài viết nào</h3>
          <p className="mt-2 text-xs text-zinc-550">Thử thay đổi từ khóa tìm kiếm hoặc lọc chuyên mục khác.</p>
        </div>
      )}

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleDetailModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
