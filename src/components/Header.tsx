import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { ShimmerButton } from './ShimmerButton';
import { recentNotifications } from '../data/mockData';
import { ShoppingCart } from 'lucide-react';
import { CartDrawer } from './CartDrawer';

interface HeaderProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  setRoute,
  isLoggedIn,
  username,
  onLogout,
  onSearchOpen
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('sn_cart') || '[]');
      setCartCount(cart.length);
    };
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('open-cart', handleOpenCart);
    };
  }, []);

  // Scroll-aware: glassmorphism + hide/reveal
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY > 300) {
        setVisible(currentY < lastScrollY.current || currentY < 100);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'apps', label: 'Ứng dụng' },
    { id: 'knowledge', label: 'Kiến thức' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'community', label: 'Cộng đồng' },
    { id: 'docs', label: 'Tài liệu' }
  ];

  const handleNavClick = (routeId: string) => {
    setRoute(routeId);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'py-2'
          : 'py-3.5'
      }`}
    >
      {/* Floating navbar container */}
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
        scrolled ? 'pt-2' : 'pt-0'
      }`}>
        <div className={`relative flex items-center justify-between rounded-2xl px-5 py-2.5 transition-all duration-500 backdrop-blur-[18px] ${
          scrolled
            ? 'bg-[#0a0a0e]/70 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,34,68,0.08)]'
            : 'bg-white/[0.02] border border-white/[0.04] shadow-lg'
        }`}>
          {/* Inner glow line at top when scrolled */}
          {scrolled && (
            <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent" />
          )}

          {/* Logo */}
          <motion.div
            onClick={() => handleNavClick('home')}
            className="flex cursor-pointer items-center gap-2.5 group select-none"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="relative flex items-center justify-center">
              <svg className="h-7 w-7 text-brand-accent transition-all duration-500 group-hover:rotate-12 group-hover:drop-shadow-[0_0_15px_rgba(255,34,68,0.8)] group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <div className="absolute inset-0 bg-brand-accent/30 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-glow-subtle">
              SN <span className="text-brand-accent">Studio</span>
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 relative">
            {menuItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 text-[13px] font-medium transition-all duration-300 rounded-lg group ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-lg bg-white/[0.08]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {/* Active underline */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-brand-accent shadow-[0_0_10px_rgba(255,34,68,0.8)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {/* Hover glow */}
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-[1.03] block">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => alert("SN Studio là hệ sinh thái được thành lập từ năm 2024, cung cấp các sản phẩm mã nguồn mở và cao cấp cho lập trình viên Việt Nam.")}
              className="relative px-3.5 py-2 text-[13px] font-medium text-zinc-400 hover:text-white transition-all duration-300 rounded-lg group"
            >
              <span className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="relative z-10 transition-transform duration-300 group-hover:scale-[1.03] block">Giới thiệu</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <motion.button
              onClick={onSearchOpen}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Tìm kiếm (⌘K)"
            >
              <Search size={16} className="transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" />
              <span className="hidden lg:flex items-center gap-1.5 text-2xs text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">
                <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono group-hover:bg-white/[0.08] transition-colors">⌘K</kbd>
              </span>
            </motion.button>

            {/* Theme */}
            <motion.button
              onClick={() => alert("Hệ thống đang chạy chế độ Dark Premium (Khuyên dùng).")}
              className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Chế độ giao diện"
            >
              <svg className="h-[16px] w-[16px] transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </motion.button>

            {/* Cart */}
            <motion.button
              onClick={() => setCartOpen(true)}
              className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 group relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Giỏ hàng"
            >
              <div className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                <ShoppingCart size={16} />
              </div>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(255,34,68,0.8)] text-[9px] font-bold text-white flex items-center justify-center border border-[#0a0a0e]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`rounded-lg p-2 transition-all duration-300 relative group hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] ${
                  notificationsOpen
                    ? 'bg-white/[0.1] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Thông báo"
              >
                <div className="transition-transform duration-300 group-hover:rotate-[15deg] group-hover:scale-110 origin-top">
                  <Bell size={16} />
                </div>
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-accent shadow-[0_0_6px_rgba(255,34,68,0.8)]">
                  <span className="absolute inset-0 rounded-full bg-brand-accent animate-ping opacity-50" />
                </span>
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/[0.06] bg-[#0a0a0e]/95 backdrop-blur-2xl p-0 shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <h4 className="text-xs font-semibold text-zinc-300">Thông báo</h4>
                      <span className="text-2xs text-brand-accent font-medium bg-brand-accent/10 px-2 py-0.5 rounded-full">3 mới</span>
                    </div>
                    <div className="py-1">
                      {recentNotifications.map((notif, i) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors group ${
                            notif.urgent ? 'border-l-2 border-brand-accent' : ''
                          }`}
                          whileHover={{ x: 2 }}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.urgent ? 'bg-brand-accent shadow-glow-red' : 'bg-zinc-700'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-300 leading-snug group-hover:text-white transition-colors">{notif.title}</p>
                            <span className="text-2xs text-zinc-600 mt-0.5 block">{notif.time}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setNotificationsOpen(false); alert("Tất cả thông báo đã được đọc."); }}
                      className="w-full text-center text-xs text-zinc-500 hover:text-brand-accent font-medium py-3 border-t border-white/[0.06] transition-colors"
                    >
                      Đánh dấu đã đọc
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-5 w-[1px] bg-white/[0.06] mx-1" />

            {/* Auth */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 group/user relative">
                <button
                  onClick={() => setRoute('dashboard')}
                  className="hidden sm:flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] pr-3 pl-1.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-all duration-200 active:scale-95"
                >
                  <div className="w-6 h-6 rounded-lg bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent text-2xs font-bold uppercase shadow-[0_0_8px_rgba(255,34,68,0.2)]">
                    {username ? username.substring(0, 2) : 'US'}
                  </div>
                  <span className="truncate max-w-[100px]">{username}</span>
                </button>
                <motion.button
                  onClick={onLogout}
                  className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  title="Đăng xuất"
                >
                  <LogOut size={16} />
                </motion.button>
              </div>
            ) : (
              <ShimmerButton
                onClick={() => setRoute('login')}
                className="text-xs font-semibold px-4 py-2"
              >
                Đăng nhập
              </ShimmerButton>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.04] hover:text-white md:hidden transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden mx-4 mt-2"
          >
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0e]/95 backdrop-blur-2xl p-4 space-y-1 shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
              {menuItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentRoute === item.id
                      ? 'text-white bg-white/[0.06]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="divider-gradient my-3" />
              {isLoggedIn ? (
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] py-3 text-sm font-medium text-white"
                  >
                    <LayoutDashboard size={15} /> Bảng điều khiển
                  </button>
                  <button
                    onClick={() => { handleNavClick('home'); onLogout(); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300"
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
                </div>
              ) : (
                <ShimmerButton
                  onClick={() => handleNavClick('login')}
                  className="w-full text-sm font-semibold py-3"
                >
                  Đăng nhập tài khoản
                </ShimmerButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </motion.header>
  );
};
