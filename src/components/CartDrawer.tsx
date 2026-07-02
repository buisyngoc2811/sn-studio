import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Key, CheckCircle } from 'lucide-react';
import { MarketplaceItem } from '../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<MarketplaceItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('sn_cart') || '[]');
    setCartItems(items);
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
      setCheckoutSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const removeFromCart = (index: number) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
    localStorage.setItem('sn_cart', JSON.stringify(newItems));
    window.dispatchEvent(newEvent('cart-updated'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.price === '0đ' || item.price === 'Miễn phí') return total;
      const num = parseInt(item.price.replace(/[^\d]/g, ''));
      return total + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) key += '-';
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCheckout = () => {
    const isLoggedIn = !!localStorage.getItem('sn_user');
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để thanh toán.');
      return;
    }

    setIsCheckingOut(true);
    setTimeout(() => {
      const purchases = JSON.parse(localStorage.getItem('sn_purchases') || '[]');
      
      const newPurchases = cartItems.map(item => ({
        ...item,
        purchaseDate: new Date().toLocaleDateString('vi-VN'),
        licenseKey: generateLicenseKey()
      }));

      localStorage.setItem('sn_purchases', JSON.stringify([...purchases, ...newPurchases]));
      localStorage.setItem('sn_cart', JSON.stringify([]));
      
      setCartItems([]);
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      window.dispatchEvent(newEvent('cart-updated'));
    }, 1500); // Mock processing time
  };

  // Helper for CustomEvent
  const newEvent = (name: string) => {
    if (typeof Event === 'function') {
      return new Event(name);
    } else {
      const event = document.createEvent('Event');
      event.initEvent(name, true, true);
      return event;
    }
  };

  const total = calculateTotal();

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-[#0a0a0e] border-l border-white/[0.08] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08] shrink-0">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="text-brand-accent" />
                  Giỏ hàng
                </h2>
                {!checkoutSuccess && cartItems.length > 0 && (
                  <span className="text-xs text-zinc-400 mt-1">{cartItems.length} sản phẩm</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.1] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {checkoutSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Thanh toán thành công!</h3>
                  <p className="text-zinc-400 max-w-[250px]">
                    Sản phẩm và License Key đã được lưu vào Dashboard của bạn.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-600 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              ) : cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-brand-500/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                        <p className="text-xs text-zinc-500">{item.seller}</p>
                        <p className="text-sm font-semibold text-brand-400 mt-2">{item.price}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                  <ShoppingCart size={48} className="text-zinc-600 mb-4" />
                  <p className="text-zinc-400">Giỏ hàng của bạn đang trống.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!checkoutSuccess && cartItems.length > 0 && (
              <div className="p-6 border-t border-white/[0.08] bg-[#0a0a0e] shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-400">Tổng cộng</span>
                  <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full flex justify-center items-center py-3.5 rounded-xl bg-brand-accent text-white font-bold shadow-[0_0_20px_rgba(255,34,68,0.4)] hover:shadow-[0_0_30px_rgba(255,34,68,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      'Thanh toán ngay'
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isCheckingOut}
                    className="w-full flex justify-center items-center py-3.5 rounded-xl bg-transparent border border-white/[0.1] text-zinc-300 font-bold hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};
