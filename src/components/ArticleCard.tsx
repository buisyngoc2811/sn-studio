import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArticleData } from '../data/mockData';
import { Eye, FileText } from 'lucide-react';

interface ArticleCardProps {
  article: ArticleData;
  onClick: (article: ArticleData) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  const getGradientBackground = () => {
    switch (article.iconType) {
      case 'react':    return 'from-cyan-950/30 via-cyan-900/5 to-transparent';
      case 'linux':    return 'from-amber-950/30 via-amber-900/5 to-transparent';
      case 'cloud':    return 'from-blue-950/30 via-blue-900/5 to-transparent';
      default:         return 'from-brand-950/30 via-brand-900/5 to-transparent';
    }
  };

  const getIconColor = () => {
    switch (article.iconType) {
      case 'react':    return 'text-cyan-400';
      case 'linux':    return 'text-amber-400';
      case 'cloud':    return 'text-blue-400';
      default:         return 'text-brand-accent';
    }
  };

  return (
    <article
      ref={cardRef}
      onClick={() => onClick(article)}
      onMouseMove={handleMouseMove}
      className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-[#0a0a0e]/80 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-brand-accent/20 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,34,68,0.06)] flex flex-col justify-between relative will-change-transform"
    >
      {/* Cursor spotlight */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(farthest-corner at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,34,68,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Thumbnail */}
      <div className={`relative h-44 w-full bg-gradient-to-br ${getGradientBackground()} flex items-center justify-center p-6 overflow-hidden`}>
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-fine bg-grid-fine opacity-[0.08]" />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700" />

        {/* Glow orb */}
        <div className="absolute h-24 w-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 group-hover:scale-150 transition-all duration-700"
          style={{ background: `radial-gradient(circle, ${article.iconType === 'react' ? 'rgba(34,211,238,0.4)' : article.iconType === 'linux' ? 'rgba(245,158,11,0.4)' : article.iconType === 'cloud' ? 'rgba(96,165,250,0.4)' : 'rgba(255,34,68,0.4)'} 0%, transparent 70%)` }}
        />

        {/* Icon with zoom on hover */}
        <div className={`relative z-10 transition-all duration-700 group-hover:scale-110 ${getIconColor()}`}>
          {article.iconType === 'react' && (
            <svg className="h-16 w-16 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="2" />
              <path d="M12 3a9 3 0 0 1 0 18 9 3 0 0 1 0-18z" transform="rotate(30 12 12)" />
              <path d="M12 3a9 3 0 0 1 0 18 9 3 0 0 1 0-18z" transform="rotate(90 12 12)" />
              <path d="M12 3a9 3 0 0 1 0 18 9 3 0 0 1 0-18z" transform="rotate(150 12 12)" />
            </svg>
          )}
          {article.iconType === 'linux' && (
            <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
              <path d="M17 10h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" />
              <path d="M7 10H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1" />
              <path d="M12 17a5 5 0 0 0-4.9-4H16.9a5 5 0 0 0-4.9 4z" />
            </svg>
          )}
          {article.iconType === 'cloud' && (
            <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.48 0-.93.07-1.39.2A6.5 6.5 0 0 0 3 13.5C3 16.54 5.46 19 8.5 19h9z" />
            </svg>
          )}
          {article.iconType === 'terminal' && (
            <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          )}
        </div>

        {/* Bottom divider */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-accent/10 border border-brand-accent/15 px-2 py-[2px] text-2xs font-semibold text-brand-400 uppercase tracking-wider group-hover:bg-brand-accent/15 transition-all duration-300">
              {article.category}
            </span>
            <span className="text-2xs text-zinc-600 transition-colors duration-300 group-hover:text-zinc-500">{article.date}</span>
          </div>

          <h3 className="mt-3 text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors duration-400 line-clamp-2 tracking-tight leading-snug">
            {article.title}
          </h3>

          <p className="mt-2.5 text-xs text-zinc-500 line-clamp-3 leading-relaxed transition-colors duration-300 group-hover:text-zinc-400">
            {article.summary}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.04] pt-4 text-2xs text-zinc-600">
          <span className="font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">{article.author}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 group-hover:text-zinc-400 transition-colors duration-300">
              <Eye size={11} />
              {article.views}
            </span>
            <span className="flex items-center gap-1 group-hover:text-zinc-400 transition-colors duration-300">
              <FileText size={11} />
              {article.readTime}
            </span>
          </div>
        </div>

        {/* Read more reveal on hover */}
        <motion.div
          className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
        >
          <span className="text-2xs font-semibold text-brand-accent flex items-center gap-1">
            Đọc thêm
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </motion.div>
      </div>
    </article>
  );
};
