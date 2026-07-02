import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../data/mockData';
import { Terminal, Shield, Code, Zap, Cpu, Star, Download } from 'lucide-react';

interface AppCardProps {
  app: AppData;
  onDownload: (app: AppData) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onDownload }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
    // 3D tilt
    const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    }
  }, []);

  const renderIcon = () => {
    const iconClass = "text-brand-accent group-hover:text-white transition-colors duration-300";
    switch (app.iconType) {
      case 'terminal': return <Terminal className={iconClass} size={22} />;
      case 'shield':   return <Shield className={iconClass} size={22} />;
      case 'code':     return <Code className={iconClass} size={22} />;
      case 'zap':      return <Zap className={iconClass} size={22} />;
      case 'cpu':      return <Cpu className={iconClass} size={22} />;
      default:         return <Code className={iconClass} size={22} />;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onDownload(app)}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-[#0a0a0e]/80 p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-brand-accent/40 hover:shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_40px_rgba(255,34,68,0.25)] will-change-transform overflow-hidden cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Spotlight follow cursor */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(farthest-corner at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,34,68,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Shine animation */}
      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-[150%] pointer-events-none z-0 transition-transform duration-[1.2s] ease-in-out" style={{ mixBlendMode: 'overlay', width: '100%' }} />

      {/* Top border glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-accent/0 group-hover:via-brand-accent/40 to-transparent transition-all duration-700 rounded-t-2xl z-10" />

      <div className="relative z-10">
        {/* Icon & Badges */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] group-hover:border-brand-accent/30 group-hover:bg-brand-accent/[0.12] group-hover:scale-110 transition-all duration-500 origin-center shadow-[0_0_0_transparent] group-hover:shadow-[0_0_15px_rgba(255,34,68,0.3)]">
            {renderIcon()}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`rounded-full px-2.5 py-[3px] text-2xs font-semibold tracking-wide uppercase transition-all duration-300 ${
              app.isFree
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/15 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-brand-accent/10 text-brand-400 border border-brand-accent/20 group-hover:bg-brand-accent/15 group-hover:shadow-[0_0_12px_rgba(255,34,68,0.15)]'
            }`}>
              {app.isFree ? 'Miễn phí' : 'Premium'}
            </span>
            <span className="text-2xs text-zinc-600 font-mono">{app.version}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4">
          <h3 className="text-[15px] font-semibold text-white group-hover:text-brand-accent/90 transition-colors duration-300 tracking-tight">
            {app.name}
          </h3>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed min-h-[44px] group-hover:text-zinc-400 transition-colors duration-300">
            {app.description}
          </p>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {app.tags.map((tag, idx) => (
            <span key={idx} className="rounded-md bg-white/[0.03] px-2 py-[3px] text-2xs text-zinc-600 border border-white/[0.04] transition-all duration-300 group-hover:border-white/[0.08] group-hover:text-zinc-400">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/[0.04] pt-4">
        <div className="flex items-center gap-3.5 text-xs text-zinc-600">
          <div className="flex items-center gap-1">
            <Star className="text-amber-500/70 group-hover:text-amber-400 transition-colors duration-300" size={12} />
            <span className="font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors duration-300">{app.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={11} className="group-hover:text-zinc-400 transition-colors duration-300" />
            <span className="group-hover:text-zinc-400 transition-colors duration-300">{app.downloads}</span>
          </div>
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(app);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] hover:bg-brand-accent hover:text-white px-3.5 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-300 border border-white/[0.06] hover:border-brand-accent/60 hover:shadow-[0_0_25px_rgba(255,34,68,0.4)] group/btn relative overflow-hidden"
        >
          <div className="relative flex items-center justify-center w-3 h-3 overflow-hidden">
            <Download size={12} className="absolute transition-transform duration-300 group-hover/btn:translate-y-[150%]" />
            <Download size={12} className="absolute -translate-y-[150%] transition-transform duration-300 group-hover/btn:translate-y-0" />
          </div>
          <span className="relative z-10">{app.isFree ? 'Tải ngay' : 'Mua ngay'}</span>
        </motion.button>
      </div>
    </div>
  );
};
