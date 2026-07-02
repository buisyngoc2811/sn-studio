import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArticleData, articlesData } from '../data/mockData';
import { 
  X, 
  Bookmark, 
  Heart, 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  Eye, 
  Calendar, 
  User,
  List
} from 'lucide-react';

interface ArticleDetailModalProps {
  article: ArticleData;
  onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Parse views string to a base number for simulation
  const parseNumber = (str: string) => {
    if (str.includes('K')) return parseFloat(str) * 1000;
    if (str.includes('M')) return parseFloat(str) * 1000000;
    return parseInt(str.replace(/[^0-9]/g, '')) || 0;
  };

  useEffect(() => {
    // Check saved state
    const saved = JSON.parse(localStorage.getItem('sn_saved_articles') || '[]');
    setIsSaved(saved.includes(article.id));

    // Check liked state
    const liked = JSON.parse(localStorage.getItem('sn_liked_articles') || '[]');
    setIsLiked(liked.includes(article.id));

    // Get dynamic stats for likes (base 42 + local clicks)
    const stats = JSON.parse(localStorage.getItem('sn_article_likes') || '{}');
    const extra = stats[article.id] || 0;
    setLikeCount(42 + extra);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [article, onClose]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    if (scrollHeight > 0) {
      const progress = (target.scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    }
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('sn_saved_articles') || '[]');
    if (isSaved) {
      const newSaved = saved.filter((id: string) => id !== article.id);
      localStorage.setItem('sn_saved_articles', JSON.stringify(newSaved));
      setIsSaved(false);
    } else {
      saved.push(article.id);
      localStorage.setItem('sn_saved_articles', JSON.stringify(saved));
      setIsSaved(true);
      showNotification('Đã lưu bài viết vào Dashboard');
    }
  };

  const handleToggleLike = () => {
    if (isLiked) return; // Prevent duplicate likes

    const liked = JSON.parse(localStorage.getItem('sn_liked_articles') || '[]');
    liked.push(article.id);
    localStorage.setItem('sn_liked_articles', JSON.stringify(liked));
    setIsLiked(true);

    const stats = JSON.parse(localStorage.getItem('sn_article_likes') || '{}');
    stats[article.id] = (stats[article.id] || 0) + 1;
    localStorage.setItem('sn_article_likes', JSON.stringify(stats));
    
    setLikeCount(prev => prev + 1);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getGradientBackground = () => {
    switch (article.iconType) {
      case 'react':    return 'from-cyan-900/40 via-[#0a0a0e] to-[#0a0a0e]';
      case 'linux':    return 'from-amber-900/40 via-[#0a0a0e] to-[#0a0a0e]';
      case 'cloud':    return 'from-blue-900/40 via-[#0a0a0e] to-[#0a0a0e]';
      default:         return 'from-brand-900/40 via-[#0a0a0e] to-[#0a0a0e]';
    }
  };

  // Find related articles (same category, exclude current)
  const relatedArticles = articlesData
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  // Mock content for the article
  const articleContent = `
Đây là nội dung mô phỏng cho bài viết **${article.title}**. Trong kỷ nguyên công nghệ hiện nay, việc tối ưu hóa hiệu suất và bảo mật không chỉ là một yêu cầu kỹ thuật mà còn là yếu tố sống còn của mọi hệ thống.

## Tầm quan trọng của kiến trúc hệ thống

Khi xây dựng các ứng dụng quy mô lớn, chúng ta cần quan tâm đến cách phân bổ luồng dữ liệu. Dưới đây là một số nguyên tắc cơ bản:
1. Giảm thiểu render thừa.
2. Quản lý trạng thái (State) ở mức thấp nhất có thể.
3. Sử dụng các cấu trúc dữ liệu phù hợp.

### Ví dụ về mã nguồn

Dưới đây là một đoạn code cấu hình cơ bản để giải quyết vấn đề trên:

\`\`\`typescript
interface Config {
  enableCache: boolean;
  maxRetries: number;
  endpoints: string[];
}

const optimizeSystem = (config: Config) => {
  if (config.enableCache) {
    console.log("Caching is enabled. Optimizing performance...");
    // Initialize Redis cache pool
    initializeCachePool(config.endpoints);
  }
  
  return {
    status: 'optimized',
    timestamp: Date.now()
  };
};

// Khởi chạy hệ thống
optimizeSystem({
  enableCache: true,
  maxRetries: 3,
  endpoints: ['redis://local', 'redis://replica']
});
\`\`\`

## Kết luận

Việc áp dụng các kỹ thuật tiên tiến giúp ứng dụng của bạn không chỉ hoạt động nhanh hơn mà còn chịu tải tốt hơn trong điều kiện lưu lượng truy cập tăng đột biến. Hãy luôn cập nhật các bản vá bảo mật và theo dõi logs hệ thống thường xuyên.
  `;

  // Parse markdown for code blocks manually (simple parser)
  const renderContent = () => {
    const blocks = articleContent.split(/```/);
    return blocks.map((block, index) => {
      if (index % 2 === 1) { // It's a code block
        const lines = block.trim().split('\n');
        const lang = lines[0];
        const code = lines.slice(1).join('\n');
        return (
          <div key={index} className="relative my-6 rounded-xl overflow-hidden border border-white/[0.08] bg-[#12121a]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.04]">
              <span className="text-xs text-zinc-400 font-mono">{lang}</span>
              <button 
                onClick={() => copyToClipboard(code, index)}
                className="text-zinc-500 hover:text-white transition-colors"
                title="Sao chép"
              >
                {copiedCode === index ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto custom-scrollbar">
              {code}
            </pre>
          </div>
        );
      }
      
      // Text block - simple markdown formatting
      let text = block;
      // Headers
      text = text.replace(/### (.*)/g, '<h4 class="text-xl font-bold text-white mt-8 mb-4">$1</h4>');
      text = text.replace(/## (.*)/g, '<h3 class="text-2xl font-bold text-white mt-10 mb-5">$1</h3>');
      // Bold
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      // Paragraphs (naive split by double newline)
      return (
        <div 
          key={index} 
          className="text-zinc-400 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: text.replace(/\n\n/g, '<br/><br/>') }}
        />
      );
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-full md:h-[90vh] md:max-w-4xl md:rounded-3xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/[0.05] z-50">
            <div 
              className="h-full bg-brand-accent transition-all duration-100 ease-out shadow-[0_0_10px_rgba(255,34,68,0.5)]"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Header Controls */}
          <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-40 bg-gradient-to-b from-[#0a0a0e] to-transparent">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-white/[0.06] border border-white/[0.06] px-2.5 py-1 text-xs font-semibold text-zinc-300">
                {article.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSave}
                className="rounded-full p-2.5 text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                title="Lưu bài viết"
              >
                <Bookmark size={18} className={isSaved ? "fill-brand-accent text-brand-accent" : ""} />
              </button>
              <button
                onClick={handleToggleLike}
                className="rounded-full p-2.5 text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                title="Yêu thích"
              >
                <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
              </button>
              <button
                onClick={() => showNotification('Đã sao chép liên kết bài viết!')}
                className="rounded-full p-2.5 text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                title="Chia sẻ"
              >
                <Share2 size={18} />
              </button>
              <div className="w-[1px] h-6 bg-white/[0.1] mx-2" />
              <button
                onClick={onClose}
                className="rounded-full p-2.5 text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar relative"
          >
            {/* Hero Banner */}
            <div className={`relative pt-24 pb-16 px-8 md:px-16 bg-gradient-to-b ${getGradientBackground()}`}>
              <div className="absolute inset-0 bg-grid-fine opacity-[0.05]" />
              
              <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {article.title}
                </h1>
                
                <p className="text-base text-zinc-400 leading-relaxed">
                  {article.summary}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-zinc-500">
                  <span className="flex items-center gap-1.5"><User size={14} /> {article.author}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {article.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {article.readTime}</span>
                  <span className="flex items-center gap-1.5"><Eye size={14} /> {article.views}</span>
                  <span className="flex items-center gap-1.5 text-brand-400"><Heart size={14} /> {likeCount} lượt thích</span>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="max-w-2xl mx-auto px-6 md:px-0 py-12">
              {/* Table of Contents */}
              <div className="mb-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <List size={16} /> Mục lục bài viết
                </h3>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="hover:text-brand-accent cursor-pointer transition-colors">Tầm quan trọng của kiến trúc hệ thống</li>
                  <li className="hover:text-brand-accent cursor-pointer transition-colors pl-4">Ví dụ về mã nguồn</li>
                  <li className="hover:text-brand-accent cursor-pointer transition-colors">Kết luận</li>
                </ul>
              </div>

              {/* Rich Content */}
              <div className="article-content">
                {renderContent()}
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="border-t border-white/[0.06] bg-[#0d0d12] px-8 md:px-16 py-16">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-8">Bài viết liên quan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedArticles.map(rel => (
                      <div key={rel.id} className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-[#0a0a0e] p-5 hover:border-brand-accent/30 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xs font-semibold text-brand-400 bg-brand-accent/10 px-2 py-0.5 rounded uppercase">
                            {rel.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-accent transition-colors">
                          {rel.title}
                        </h4>
                        <div className="flex items-center gap-3 text-2xs text-zinc-500">
                          <span className="flex items-center gap-1"><Clock size={12}/> {rel.readTime}</span>
                          <span className="flex items-center gap-1"><Eye size={12}/> {rel.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[110] flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#0a0a0e]/95 p-4 shadow-[0_8px_30px_rgba(16,185,129,0.2)] backdrop-blur-xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <Bookmark size={16} className="fill-emerald-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Thành công</h4>
              <p className="text-xs text-zinc-400">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
