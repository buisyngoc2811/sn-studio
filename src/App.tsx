import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Apps } from './pages/Apps';
import { Knowledge } from './pages/Knowledge';
import { Marketplace } from './pages/Marketplace';
import { Community } from './pages/Community';
import { Docs } from './pages/Docs';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { AppDetailPage } from './pages/AppDetailPage';
import { VersionHistory } from './pages/VersionHistory';
import { Search, X } from 'lucide-react';
import { articlesData } from './data/mockData';
import { supabase } from './lib/supabase';
import { fetchApps, AppData } from './lib/apps';
import { fetchProfileById } from './lib/profiles';

interface Particle {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
}

const pageTransition = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
};

const pageTransitionConfig = {
  duration: 0.45,
  ease: [0.16, 1, 0.3, 1] as const,
};

export const App: React.FC = () => {
  const [currentRoute, setRoute] = useState<string>('home');
  const [username, setUsername] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [searchApps, setSearchApps] = useState<AppData[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const applySession = async (session: any) => {
      if (!isMounted) return;

      if (!session) {
        setIsLoggedIn(false);
        setUsername('');
        setIsAuthLoading(false);
        return;
      }

      try {
        const profile = await fetchProfileById(session.user.id);
        if (!isMounted) return;

        if (profile?.status === 'banned') {
          setAuthNotice('Tài khoản của bạn đã bị đình chỉ.');
          setIsLoggedIn(false);
          setUsername('');
          setIsAuthLoading(false);
          await supabase.auth.signOut();
          if (isMounted) setRoute('login');
          return;
        }

        setAuthNotice(null);
        setIsLoggedIn(true);
        setUsername(profile?.email || session.user.email || '');
      } catch (error) {
        console.error('Error loading auth profile:', error);
        setIsLoggedIn(!!session);
        setUsername(session?.user?.email || '');
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadSearchApps = async () => {
      try {
        setSearchApps(await fetchApps());
      } catch (error) {
        console.error('Error loading apps for search:', error);
        setSearchApps([]);
      }
    };

    loadSearchApps();
    window.addEventListener('apps-db-updated', loadSearchApps);
    return () => window.removeEventListener('apps-db-updated', loadSearchApps);
  }, []);

  // Mouse spotlight tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    document.documentElement.style.setProperty('--spotlight-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--spotlight-y', `${e.clientY}px`);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Generate particles
  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 20 }).map((_, idx) => ({
      id: idx,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${14 + Math.random() * 14}s`,
      size: `${1.2 + Math.random() * 1.8}px`,
      opacity: 0.15 + Math.random() * 0.35,
    }));
    setParticles(generated);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto-redirect admin from dashboard to admin panel
    if (currentRoute === 'dashboard' && (username === 'admin@gmail.com' || username === 'admin@snstudio.vn')) {
      setRoute('admin');
    }
  }, [currentRoute, username]);

  // ESC to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) setIsSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleLogout = async () => {
    setAuthNotice(null);
    await supabase.auth.signOut();
    setRoute('login');
  };

  const handleLoginSuccess = (user: string) => {
    // Session state handled by onAuthStateChange
  };

  if (isAuthLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#050507] text-white">Đang tải...</div>;
  }

  // Search filtering
  const matchingApps = globalSearchQuery.trim() === '' ? [] : searchApps.filter(app =>
    app.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const matchingArticles = globalSearchQuery.trim() === '' ? [] : articlesData.filter(art =>
    art.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    art.summary.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const handleSearchNavigate = (routeId: string) => {
    setRoute(routeId);
    setIsSearchOpen(false);
    setGlobalSearchQuery('');
  };

  const renderContent = () => {
    if (currentRoute.startsWith('app-detail:')) {
      return <AppDetailPage appId={currentRoute.replace('app-detail:', '')} setRoute={setRoute} />;
    }

    switch (currentRoute) {
      case 'home':
        return <Home setRoute={setRoute} isLoggedIn={isLoggedIn} onLoginSuccess={handleLoginSuccess} />;
      case 'apps':
        return <Apps isLoggedIn={isLoggedIn} setRoute={setRoute} />;
      case 'knowledge':
        return <Knowledge />;
      case 'marketplace':
        return <Marketplace isLoggedIn={isLoggedIn} setRoute={setRoute} />;
      case 'version-history':
        return <VersionHistory setRoute={setRoute} />;
      case 'community':
        return <Community isLoggedIn={isLoggedIn} username={username} setRoute={setRoute} />;
      case 'docs':
        return <Docs />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} setRoute={setRoute} authNotice={authNotice} />;
      case 'admin':
        if (isLoggedIn && (username === 'admin@gmail.com' || username === 'admin@snstudio.vn')) {
          return <Admin username={username} setRoute={setRoute} />;
        } else {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Truy cập bị từ chối</h2>
              <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">Khu vực này chỉ dành cho Ban Quản trị hệ thống SN Studio. Vui lòng đăng nhập với tài khoản cấp quyền cao nhất.</p>
              <button onClick={() => setRoute('login')} className="px-5 py-2.5 bg-brand-accent text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-all shadow-glow-red active:scale-95">
                Quay lại Đăng nhập
              </button>
            </div>
          );
        }
      case 'dashboard':
        return isLoggedIn ? (
          <Dashboard username={username} setRoute={setRoute} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} setRoute={setRoute} />
        );
      default:
        return <Home setRoute={setRoute} isLoggedIn={isLoggedIn} onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-200 flex flex-col justify-between selection:bg-brand-accent/30 selection:text-white relative overflow-hidden">

      {/* Mouse Spotlight */}
      <div ref={spotlightRef} className="spotlight" />

      {/* Ambient Blobs */}
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
      <div className="ambient-blob ambient-blob-3" />

      {/* Floating Red Particles */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-brand-accent shadow-[0_0_6px_rgba(255,34,68,0.6)]"
            style={{
              left: p.left,
              bottom: '-10px',
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `particleFloat ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Main Structure */}
      <div className="relative z-10">
        <Header
          currentRoute={currentRoute}
          setRoute={setRoute}
          isLoggedIn={isLoggedIn}
          username={username}
          onLogout={handleLogout}
          onSearchOpen={() => setIsSearchOpen(true)}
        />

        {/* Page Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransitionConfig}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <Footer setRoute={setRoute} />

      {/* ──── SEARCH MODAL ──── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-xl p-4 pt-[12vh]"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0a0a0e]/95 backdrop-blur-2xl p-0 shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(255,34,68,0.08)] relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
                <Search className="text-zinc-500 shrink-0" size={18} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Tìm kiếm ứng dụng, bài viết, tài liệu..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[15px] text-white placeholder-zinc-500 focus:outline-none font-medium"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ESC
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {globalSearchQuery.trim() !== '' ? (
                  <div className="p-4 space-y-5">
                    {/* Apps */}
                    <div>
                      <h4 className="text-2xs font-semibold text-zinc-500 uppercase tracking-widest mb-2.5 px-1">
                        Ứng dụng ({matchingApps.length})
                      </h4>
                      {matchingApps.length > 0 ? (
                        <div className="space-y-1">
                          {matchingApps.map(app => (
                            <motion.div
                              key={app.id}
                              onClick={() => handleSearchNavigate('apps')}
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group"
                              whileHover={{ x: 2 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-xs font-bold">
                                  {app.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors block">{app.name}</span>
                                  <span className="text-2xs text-zinc-500">{app.categoryLabel}</span>
                                </div>
                              </div>
                              <span className="text-2xs font-semibold text-brand-400">{app.isFree ? 'Miễn phí' : 'Premium'}</span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600 px-1">Không tìm thấy.</p>
                      )}
                    </div>

                    {/* Articles */}
                    <div>
                      <h4 className="text-2xs font-semibold text-zinc-500 uppercase tracking-widest mb-2.5 px-1">
                        Bài viết ({matchingArticles.length})
                      </h4>
                      {matchingArticles.length > 0 ? (
                        <div className="space-y-1">
                          {matchingArticles.map(art => (
                            <motion.div
                              key={art.id}
                              onClick={() => handleSearchNavigate('knowledge')}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group"
                              whileHover={{ x: 2 }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 text-xs font-bold">
                                {art.title.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors block truncate">{art.title}</span>
                                <span className="text-2xs text-zinc-500">{art.category} · {art.author}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-600 px-1">Không tìm thấy.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                      <Search size={20} className="text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">Nhập từ khóa để tìm kiếm</p>
                    <p className="text-2xs text-zinc-600 mt-1">Ứng dụng, bài viết, tài liệu hướng dẫn...</p>
                  </div>
                )}
              </div>

              {/* Search Footer */}
              <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between text-2xs text-zinc-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono">↵</kbd>
                    chọn
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono">ESC</kbd>
                    đóng
                  </span>
                </div>
                <span className="font-medium">SN Studio</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
