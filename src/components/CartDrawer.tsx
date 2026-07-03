import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, CheckCircle, Copy, Key } from 'lucide-react';
import { MarketplaceItem, fetchMarketplaceItemsByIds } from '../lib/marketplace';
import { supabase } from '../lib/supabase';
import { MarketplacePurchaseActionResult, purchaseMarketplaceItem } from '../lib/commerce';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<MarketplaceItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [purchaseResults, setPurchaseResults] = useState<MarketplacePurchaseActionResult[]>([]);

  const loadCart = async () => {
    const rawItems = JSON.parse(localStorage.getItem('sn_cart') || '[]');
    const ids = rawItems.map((entry: any) => typeof entry === 'string' ? entry : entry.id).filter(Boolean);
    if (ids.length === 0) {
      setCartItems([]);
      return;
    }

    try {
      setCartItems(await fetchMarketplaceItemsByIds(Array.from(new Set(ids))));
    } catch (error) {
      console.error('Error loading cart marketplace items:', error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
      setCheckoutSuccess(false);
      setPurchaseResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const removeFromCart = (id: string) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);
    localStorage.setItem('sn_cart', JSON.stringify(newItems.map(item => item.id)));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.price === '0đ' || item.price === 'Miễn phí') return total;
      const num = parseInt(item.price.replace(/[^\d]/g, ''), 10);
      return total + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Vui lòng đăng nhập để thanh toán.');
      return;
    }

    setIsCheckingOut(true);
    try {
      const results: MarketplacePurchaseActionResult[] = [];
      for (const item of cartItems) {
        results.push(await purchaseMarketplaceItem(item.id));
      }
      setPurchaseResults(results);
      localStorage.setItem('sn_cart', JSON.stringify([]));
      
      setCartItems([]);
      setCheckoutSuccess(true);
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('commerce-db-updated'));
    } catch (error: any) {
      alert(`Không thể thanh toán: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
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

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {checkoutSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Thanh toán thành công!</h3>
                  <p className="text-zinc-400 max-w-[250px]">
                    Sản phẩm và license đã được ghi nhận. License Key chỉ hiển thị một lần tại đây.
                  </p>
                  <div className="w-full max-w-lg space-y-3 pt-2 text-left">
                    {purchaseResults.map((purchase) => (
                      <div key={purchase.purchaseId} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-white">{purchase.itemName}</p>
                            <p className="text-[11px] text-zinc-500">
                              {purchase.purchaseStatus === 'claimed' ? 'Miễn phí' : 'Đã mua'} • {purchase.licenseStatus}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                            {purchase.purchaseStatus}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                              <Key size={11} />
                              License Key
                            </p>
                            <code className="mt-1 block break-all font-mono text-xs text-emerald-50">
                              {purchase.licenseKey || `••••-••••-••••-${purchase.licenseLast4 || '----'}`}
                            </code>
                          </div>
                          {purchase.licenseKey && (
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(purchase.licenseKey || '')}
                              className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-2 text-emerald-100 hover:bg-emerald-500/25"
                              title="Copy"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-600 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              ) : cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-brand-500/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                        <p className="text-xs text-zinc-500">{item.seller}</p>
                        <p className="text-sm font-semibold text-brand-400 mt-2">{item.price}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
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
                    {isCheckingOut ? 'Đang xử lý...' : 'Thanh toán ngay'}
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
