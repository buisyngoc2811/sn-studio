import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketplaceItem } from '../data/mockData';
import { X, ShoppingCart, Star, Palette, Puzzle, Wrench, Plug, CheckCircle } from 'lucide-react';

interface MarketplaceItemModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onOpenCart: () => void;
}

export const MarketplaceItemModal: React.FC<MarketplaceItemModalProps> = ({ item, onClose, onOpenCart }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Check cart
    const cart = JSON.parse(localStorage.getItem('sn_cart') || '[]');
    setIsInCart(cart.some((c: MarketplaceItem) => c.id === item.id));

    // Check purchases
    const purchases = JSON.parse(localStorage.getItem('sn_purchases') || '[]');
    setIsPurchased(purchases.some((p: any) => p.id === item.id));

    const handleUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('sn_cart') || '[]');
      setIsInCart(updatedCart.some((c: MarketplaceItem) => c.id === item.id));
      const updatedPurchases = JSON.parse(localStorage.getItem('sn_purchases') || '[]');
      setIsPurchased(updatedPurchases.some((p: any) => p.id === item.id));
    };

    window.addEventListener('cart-updated', handleUpdate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('cart-updated', handleUpdate);
      document.body.style.overflow = 'auto';
    };
  }, [item, onClose]);

  const handleAddToCart = () => {
    if (isInCart || isPurchased) return;
    const cart = JSON.parse(localStorage.getItem('sn_cart') || '[]');
    cart.push(item);
    localStorage.setItem('sn_cart', JSON.stringify(cart));
    setIsInCart(true);
    
    // Dispatch event so CartDrawer updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
    
    // Auto open cart
    onOpenCart();
  };

  const renderIcon = (type: string, size = 48) => {
    switch (type) {
      case 'palette': return <Palette size={size} />;
      case 'puzzle': return <Puzzle size={size} />;
      case 'wrench': return <Wrench size={size} />;
      case 'plug': return <Plug size={size} />;
      default: return <Puzzle size={size} />;
    }
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 px-4 pt-24 pb-24 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(255,34,68,0.1)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header background with gradient */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-accent/20 to-transparent opacity-50 pointer-events-none rounded-t-2xl" />

          {/* Sticky Close Button */}
          <div className="sticky top-4 z-50 flex justify-end px-4 pt-4 -mb-12 pointer-events-none">
            <button
              onClick={onClose}
              className="pointer-events-auto rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/[0.2] transition-colors bg-black/40 backdrop-blur-md border border-white/[0.1]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative z-10 p-8">
            {/* Top Info Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-[#12121a] border border-white/[0.08] flex items-center justify-center text-brand-accent shadow-[0_0_30px_rgba(255,34,68,0.2)]">
                {renderIcon(item.iconType)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight">{item.name}</h2>
                  {item.badge && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-accent/10 text-brand-400 border border-brand-accent/20 tracking-wider uppercase">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400 mb-6 font-medium">
                  <span className="text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded">{item.category}</span>
                  <span>Bán bởi: <strong className="text-white">{item.seller}</strong></span>
                  <span className="flex items-center gap-1 text-amber-400"><Star size={14} className="fill-amber-400"/> {item.rating} ({item.reviews} đánh giá)</span>
                  <span>{item.downloads} lượt tải</span>
                </div>
                
                <div className="flex items-center gap-6 bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Giá sản phẩm</p>
                    <p className="text-2xl font-extrabold text-white">{item.price}</p>
                  </div>
                  <div className="w-[1px] h-12 bg-white/[0.08]" />
                  <div className="flex-1">
                    {isPurchased ? (
                      <button
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                      >
                        <CheckCircle size={18} />
                        Đã sở hữu
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,34,68,0.3)] hover:shadow-[0_0_30px_rgba(255,34,68,0.5)] active:scale-95 border ${
                          isInCart
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed'
                            : 'bg-brand-accent border-brand-500/25 text-white hover:bg-brand-600'
                        }`}
                      >
                        <ShoppingCart size={18} />
                        {isInCart ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Details */}
            <div className="mt-12 pt-8 border-t border-white/[0.06] space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Chi tiết sản phẩm</h3>
                <p className="text-zinc-400 leading-relaxed text-[15px]">
                  {item.description} Đây là sản phẩm đạt chuẩn chất lượng cao cấp được kiểm duyệt bởi đội ngũ chuyên gia của SN Studio. 
                  Sử dụng sản phẩm này sẽ giúp tối ưu hóa hiệu suất làm việc và mang lại trải nghiệm chuyên nghiệp nhất cho dự án của bạn.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Quyền lợi khi mua</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Sở hữu vĩnh viễn', 'Cập nhật miễn phí 1 năm', 'Hỗ trợ kỹ thuật 24/7', 'Cấp License Key chính hãng', 'Hoàn tiền trong 7 ngày', 'Sử dụng cho không giới hạn domain'].map((perk, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                      <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                        <CheckCircle size={16} />
                      </div>
                      <span className="text-sm font-medium text-zinc-300">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
