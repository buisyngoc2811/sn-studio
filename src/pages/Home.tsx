import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { LaptopMockup } from '../components/LaptopMockup';
import { ShimmerButton } from '../components/ShimmerButton';
import { AppCard } from '../components/AppCard';
import { AppDetailModal } from '../components/AppDetailModal';
import { ArticleCard } from '../components/ArticleCard';
import { ArticleDetailModal } from '../components/ArticleDetailModal';
import { articlesData, membersData, ArticleData } from '../data/mockData';
import { fetchApps, AppData } from '../lib/apps';
import { Star, Code, Shield, Terminal, Cpu, Zap, Eye, ChevronRight } from 'lucide-react';

const HeroButton = ({ children, primary, onClick, className }: { children: React.ReactNode; primary?: boolean; onClick?: (e: React.MouseEvent) => void; className?: string }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'absolute rounded-full bg-white/30 pointer-events-none z-0';
      ripple.style.cssText = `left:${x}px;top:${y}px;width:0;height:0;transform:translate(-50%,-50%);animation:ripple 0.6s ease-out forwards;`;
      buttonRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      whileHover="hover"
      initial="rest"
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.03 }
      }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden flex items-center justify-center gap-2 group transition-all duration-300 ${
        primary 
          ? 'bg-brand-accent text-white shadow-[0_0_20px_rgba(255,34,68,0.3)] border border-brand-500/40' 
          : 'bg-white/[0.03] text-zinc-300 hover:text-white border border-white/[0.08] backdrop-blur-sm shadow-lg'
      } ${className}`}
    >
      {/* Shadows and Glows on hover via pseudo-element for smooth transition */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 ${
        primary 
          ? 'shadow-[0_0_40px_rgba(255,34,68,0.7)] border border-brand-400/80' 
          : 'bg-white/[0.08] border border-white/[0.2] shadow-[0_0_30px_rgba(255,255,255,0.15)]'
      }`} />

      {/* Gradient Shift Background for primary */}
      {primary && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-accent via-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradientShift -z-20" />
      )}
      
      <span className="relative z-10 flex items-center gap-2 font-semibold text-sm">
        {children}
        <motion.span
          variants={{
            rest: { x: 0 },
            hover: { x: 4 }
          }}
          className="flex items-center"
        >
          <ChevronRight size={16} />
        </motion.span>
      </span>
    </motion.button>
  );
};

interface HomeProps {
  setRoute: (route: string) => void;
  isLoggedIn: boolean;
  onLoginSuccess: (username: string) => void;
}

const CountUp = ({ to, suffix = '', className }: { to: number; suffix?: string; className?: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  React.useEffect(() => {
    if (!nodeRef.current) return;
    const controls = animate(0, to, {
      duration: 2.5,
      ease: "easeOut",
      onUpdate(value) {
        if (nodeRef.current) {
          const formatted = to % 1 !== 0 ? value.toFixed(1) : Math.round(value);
          nodeRef.current.textContent = `${formatted}${suffix}`;
        }
      }
    });
    return () => controls.stop();
  }, [to, suffix]);

  return <span ref={nodeRef} className={className}>0{suffix}</span>;
};

const StatItem = ({ end, suffix, label, colorClass = "text-zinc-300 group-hover:text-white group-hover:text-glow-red" }: any) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    itemRef.current.style.setProperty('--mouse-x', `${x}px`);
    itemRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={itemRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col justify-center py-4 md:py-2 px-2 group cursor-default transition-all overflow-hidden rounded-xl"
    >
      {/* Shine effect / Glow on hover tied to mouse */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
        background: 'radial-gradient(120px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,34,68,0.12), transparent 100%)'
      }} />
      
      {/* Border animation on hover */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-center" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-center" />

      {/* Mouse parallax container for content */}
      <motion.div 
        whileHover={{ y: -3, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative z-10"
      >
        <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight transition-all duration-300 relative inline-block ${colorClass}`}>
          {/* Number shine sweep on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent pointer-events-none mix-blend-overlay z-20" />
          <CountUp to={end} suffix={suffix} />
        </span>
        <span className="block text-[10px] text-zinc-550 group-hover:text-zinc-300 mt-1 uppercase font-bold tracking-wider transition-colors duration-300">
          {label}
        </span>
      </motion.div>
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ setRoute, isLoggedIn, onLoginSuccess }) => {
  const heroRef = useRef<HTMLElement>(null);
  
  const scrollSectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.05
      }
    }
  };

  const scrollItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    heroRef.current.style.setProperty('--px', x.toString());
    heroRef.current.style.setProperty('--py', y.toString());
  }, []);

  const [quickUser, setQuickUser] = useState('');
  const [quickPass, setQuickPass] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const [articles, setArticles] = useState<ArticleData[]>(articlesData);

  useEffect(() => {
    const loadData = () => {
      const storedArticles = localStorage.getItem('sn_articles_db');
      if (storedArticles) setArticles(JSON.parse(storedArticles));
    };
    loadData();
    window.addEventListener('articles-db-updated', loadData);
    return () => {
      window.removeEventListener('articles-db-updated', loadData);
    };
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      try {
        setApps(await fetchApps());
      } catch (error) {
        console.error('Error loading home apps:', error);
        setApps([]);
      }
    };

    loadApps();
    window.addEventListener('apps-db-updated', loadApps);
    return () => window.removeEventListener('apps-db-updated', loadApps);
  }, []);

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUser.trim() && quickPass.trim()) {
      onLoginSuccess(quickUser);
      setRoute('dashboard');
    } else {
      alert('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!');
    }
  };

  const handleDownloadApp = (app: AppData) => {
    setSelectedApp(app);
  };

  const handleArticleClick = (article: ArticleData) => {
    setSelectedArticle(article);
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION — Premium balanced 3-column grid */}
      <section 
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative min-h-[88vh] flex items-center overflow-hidden"
      >
        {/* --- PREMIUM HERO BACKGROUND --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Subtle Noise Texture */}
          <div className="absolute inset-0 noise-overlay opacity-30 mix-blend-overlay" />
          
          {/* Cyber Grid Background */}
          <div 
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 80%)',
              transform: 'translate(calc(var(--px, 0) * -15px), calc(var(--py, 0) * -15px))',
              transition: 'transform 0.1s ease-out'
            }}
          />

          {/* Large Radial Glows (Low Opacity) */}
          <div 
            className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full opacity-[0.06] blur-[120px] bg-brand-accent mix-blend-screen"
            style={{
              transform: 'translate(calc(var(--px, 0) * 30px), calc(var(--py, 0) * 30px))',
              transition: 'transform 0.1s ease-out'
            }}
          />
          <div 
            className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full opacity-[0.04] blur-[100px] bg-red-600 mix-blend-screen"
            style={{
              transform: 'translate(calc(var(--px, 0) * -40px), calc(var(--py, 0) * -40px))',
              transition: 'transform 0.1s ease-out'
            }}
          />
          
          {/* Animated Gradient Blob Behind Laptop (Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]">
            <div 
              className="absolute inset-0 rounded-full opacity-[0.04] blur-[80px] bg-gradient-to-r from-brand-accent via-red-500 to-orange-500 animate-spin-slow mix-blend-screen"
              style={{
                transform: 'translate(calc(var(--px, 0) * 20px), calc(var(--py, 0) * 20px))',
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0" style={{ transform: 'translate(calc(var(--px, 0) * -10px), calc(var(--py, 0) * -10px))', transition: 'transform 0.1s ease-out' }}>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-brand-accent/30 shadow-[0_0_8px_rgba(255,34,68,0.4)]"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -40, 0],
                  x: [0, (Math.random() - 0.5) * 30, 0],
                  opacity: [0.1, 0.6, 0.1],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        </div>
        {/* --- END BACKGROUND --- */}

        <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-8 lg:px-10 py-16 lg:py-0 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_35%_25%] items-center gap-10 lg:gap-8">

              {/* ── Column 1: Left — Branding & CTAs ── */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-7 text-center lg:text-left"
              >
                {/* Badge */}
                <motion.div
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/[0.08] px-4 py-1.5 text-xs font-semibold text-brand-400 hover:border-brand-500/50 transition-colors"
                >
                  <span className="flex h-2 w-2 rounded-full bg-brand-accent animate-pulse-subtle shadow-[0_0_8px_rgba(255,34,68,0.6)]" />
                  Phiên bản hè 2026 đã sẵn sàng
                </motion.div>

                {/* Headline — Staggered lines */}
                <h1 className="text-5xl sm:text-[3.5rem] lg:text-[3.75rem] font-extrabold tracking-tighter text-white leading-[1.15] flex flex-col gap-2">
                  <motion.span variants={itemVariants} className="block">
                    Không gian số
                  </motion.span>
                  <motion.span variants={itemVariants} className="block">
                    <span className="bg-gradient-to-r from-brand-accent via-red-500 to-red-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,34,68,0.4)] bg-[length:200%_auto] animate-gradientShift">
                      Dark Premium
                    </span>
                  </motion.span>
                </h1>

                {/* Paragraph — narrower */}
                <motion.p
                  variants={itemVariants}
                  className="text-[15px] text-zinc-400 leading-loose max-w-[520px] mx-auto lg:mx-0 pt-1"
                >
                  SN Studio cung cấp hệ sinh thái phần mềm tối ưu hiệu năng cao, các công cụ lập trình siêu tốc, tài liệu chuyên sâu và cộng đồng công nghệ chất lượng cao.
                </motion.p>

                {/* CTAs — equal height & spacing */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-1"
                >
                  <HeroButton
                    primary
                    onClick={() => setRoute('apps')}
                    className="w-full sm:w-auto rounded-xl px-7 py-3"
                  >
                    Khám phá ứng dụng
                  </HeroButton>

                  <HeroButton
                    onClick={() => setRoute('knowledge')}
                    className="w-full sm:w-auto rounded-xl px-7 py-3"
                  >
                    Đọc bài viết
                  </HeroButton>
                </motion.div>
              </motion.div>

              {/* ── Column 2: Center — Laptop Mockup ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative lg:translate-x-3 lg:translate-y-2" style={{ transform: 'scale(1.1)' }}>
                  <LaptopMockup />
                </div>
              </motion.div>

              {/* ── Column 3: Right — Quick Login & Widgets ── */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >

                {/* Quick Login Card / User Status */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0e]/70 p-5 backdrop-blur-sm transition-all duration-350 hover:border-brand-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <h3 className="text-2xs font-semibold text-zinc-500 uppercase tracking-widest">Đã kết nối</h3>
                      <div className="flex items-center gap-3 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
                        <div className="w-8 h-8 rounded-full bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center font-bold text-brand-400 text-xs">S</div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">Sơn Nguyễn</span>
                          <span className="text-2xs text-zinc-600 font-mono">ID: SN-9201</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setRoute('dashboard')}
                        className="w-full rounded-xl bg-brand-accent/10 border border-brand-accent/15 hover:bg-brand-accent/20 py-2.5 text-center text-xs font-semibold text-brand-400 transition-colors"
                      >
                        Vào Bảng Điều Khiển
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleQuickLogin} className="space-y-3">
                      <h3 className="text-2xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Kết nối nhanh</h3>
                      <input
                        type="text"
                        placeholder="Tài khoản (ví dụ: Admin)"
                        required
                        value={quickUser}
                        onChange={(e) => setQuickUser(e.target.value)}
                        className="premium-input !py-2.5 !px-3.5 !text-xs !rounded-xl"
                      />
                      <input
                        type="password"
                        placeholder="Mật khẩu"
                        required
                        value={quickPass}
                        onChange={(e) => setQuickPass(e.target.value)}
                        className="premium-input !py-2.5 !px-3.5 !text-xs !rounded-xl"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-brand-accent hover:bg-brand-600 py-2.5 text-center text-xs font-bold text-white transition-colors shadow-glow-red"
                      >
                        Kết nối ngay
                      </button>
                    </form>
                  )}
                </div>

                {/* Popular Categories */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0e]/70 p-5 backdrop-blur-sm transition-all duration-350 hover:border-brand-500/15 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <h3 className="text-2xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Danh mục phổ biến</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Terminal size={12} className="text-brand-accent" />, label: 'Hệ thống' },
                      { icon: <Code size={12} className="text-brand-accent" />, label: 'Phát triển' },
                      { icon: <Shield size={12} className="text-brand-accent" />, label: 'Bảo mật' },
                      { icon: <Zap size={12} className="text-brand-accent" />, label: 'Tự động' },
                    ].map((cat) => (
                      <button
                        key={cat.label}
                        onClick={() => setRoute('apps')}
                        className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] p-2 text-2xs text-zinc-400 hover:text-white border border-white/[0.04] hover:border-brand-accent/20 transition-all font-medium"
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Members */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0e]/70 p-5 backdrop-blur-sm transition-all duration-350 hover:border-brand-500/15 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] space-y-3">
                  <h3 className="text-2xs font-semibold text-zinc-500 uppercase tracking-widest">Hội viên hoạt động</h3>
                  <div className="space-y-2.5">
                    {membersData.slice(0, 2).map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-accent/10 border border-brand-accent/15 flex items-center justify-center text-2xs font-bold text-brand-400 uppercase">
                            {member.avatarSeed.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-zinc-200">{member.name}</span>
                            <span className="text-2xs text-zinc-600">{member.role}</span>
                          </div>
                        </div>
                        <span className="rounded-md bg-brand-accent/[0.08] border border-brand-accent/15 px-1.5 py-0.5 text-2xs font-semibold text-brand-400">
                          {member.rank}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STATS BAR (Transparent Glassmorphism Layout with Hover Highlight) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={scrollSectionVariants}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={scrollItemVariants} className="glass-panel rounded-2xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 text-center shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-white/[0.08] backdrop-blur-2xl bg-[#0a0a0e]/40 relative overflow-hidden group/stats">
          
          {/* Ambient section glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/5 via-transparent to-brand-accent/5 opacity-0 group-hover/stats:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <StatItem end={42} suffix="+" label="Ứng dụng tiện ích" />
          <StatItem end={328} suffix="+" label="Bài viết chia sẻ" colorClass="text-brand-accent/80 group-hover:text-brand-accent group-hover:text-glow-red" />
          <StatItem end={16.5} suffix="K+" label="Lượt tải phần mềm" />
          <StatItem end={3.2} suffix="K+" label="Thành viên tham gia" />
          <div className="col-span-2 md:col-span-1">
            <StatItem end={99} suffix="%" label="Đánh giá tích cực" colorClass="text-emerald-500/80 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
          </div>
        </motion.div>
      </motion.section>

      {/* 3. LATEST APPS SECTION (Viewport intersection scroll fade) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={scrollSectionVariants}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={scrollItemVariants} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="h-5 w-1 bg-brand-accent rounded-full" />
              Ứng Dụng Mới Nhất
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Các phiên bản phần mềm phát hành gần nhất đã tối ưu hóa tương thích hệ thống.</p>
          </div>
          <button 
            onClick={() => setRoute('apps')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 group"
          >
            Xem tất cả ứng dụng 
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.slice(0, 3).map((app) => (
            <motion.div key={app.id} variants={scrollItemVariants}>
              <AppCard 
                app={app} 
                onDownload={handleDownloadApp} 
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 4. FEATURED ARTICLES SECTION (Viewport intersection scroll fade) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={scrollSectionVariants}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={scrollItemVariants} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="h-5 w-1 bg-brand-accent rounded-full" />
              Bài Viết Nổi Bật
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Tài liệu, hướng dẫn lập trình và kiến thức bảo mật nâng cao do đội ngũ SN Studio chọn lọc.</p>
          </div>
          <button 
            onClick={() => setRoute('knowledge')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 group"
          >
            Xem tất cả bài viết 
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.slice(0, 4).map((art) => (
            <motion.div key={art.id} variants={scrollItemVariants}>
              <ArticleCard 
                article={art} 
                onClick={handleArticleClick} 
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

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
