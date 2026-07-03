import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, Palette, Puzzle, Wrench, Plug, CheckCircle, Download, FileText, Key, Copy } from 'lucide-react';
import {
  MarketplaceItem,
  addMarketplaceReview,
} from '../lib/marketplace';
import {
  MarketplacePurchaseActionResult,
  downloadMarketplaceItem,
  fetchMarketplacePurchaseByItemId,
  purchaseMarketplaceItem,
} from '../lib/commerce';

interface MarketplaceItemModalProps {
  item: MarketplaceItem;
  isLoggedIn: boolean;
  setRoute: (route: string) => void;
  onClose: () => void;
  onOpenCart: () => void;
  onItemUpdated: (item: MarketplaceItem) => void;
}

export const MarketplaceItemModal: React.FC<MarketplaceItemModalProps> = ({
  item,
  isLoggedIn,
  setRoute,
  onClose,
  onOpenCart,
  onItemUpdated,
}) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<MarketplacePurchaseActionResult | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    const handleUpdate = () => {
      const cart = JSON.parse(localStorage.getItem('sn_cart') || '[]');
      setIsInCart(cart.some((cartItem: any) => (typeof cartItem === 'string' ? cartItem : cartItem.id) === item.id));
    };

    const loadPurchase = async () => {
      handleUpdate();
      try {
        const purchase = await fetchMarketplacePurchaseByItemId(item.id);
        setIsPurchased(!!purchase);
      } catch (error) {
        console.error('Error loading marketplace purchase state:', error);
      }
    };

    loadPurchase();
    window.addEventListener('cart-updated', handleUpdate);
    window.addEventListener('commerce-db-updated', loadPurchase);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('cart-updated', handleUpdate);
      window.removeEventListener('commerce-db-updated', loadPurchase);
      document.body.style.overflow = 'auto';
    };
  }, [item, onClose]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để tiếp tục.');
      setRoute('login');
      return;
    }
    if (isInCart || isPurchased) return;
    const cart = JSON.parse(localStorage.getItem('sn_cart') || '[]');
    cart.push(item.id);
    localStorage.setItem('sn_cart', JSON.stringify(Array.from(new Set(cart.map((entry: any) => typeof entry === 'string' ? entry : entry.id)))));
    setIsInCart(true);
    window.dispatchEvent(new Event('cart-updated'));
    onOpenCart();
  };

  const handleDownload = async () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để tiếp tục.');
      setRoute('login');
      return;
    }
    setIsDownloading(true);
    try {
      const isFree = item.price === '0đ' || item.price === 'Miễn phí';
      let purchaseResult: MarketplacePurchaseActionResult | null = null;

      if (!isPurchased) {
        if (!isFree) {
          alert('Vui lòng mua sản phẩm trước khi tải xuống.');
          return;
        }
        purchaseResult = await purchaseMarketplaceItem(item.id);
        setIsPurchased(true);
        setPurchaseNotice(purchaseResult);
        window.dispatchEvent(new Event('commerce-db-updated'));
      }

      const downloadResult = await downloadMarketplaceItem(item.id, item.versions?.[0]?.id);
      const url = downloadResult.downloadUrl;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      if (purchaseResult?.licenseKey) setPurchaseNotice(purchaseResult);
      window.dispatchEvent(new Event('market-db-updated'));
    } catch (error: any) {
      alert(`Không thể tải xuống: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để gửi đánh giá.');
      setRoute('login');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addMarketplaceReview(item.id, reviewRating, reviewComment.trim());
      setReviewComment('');
      window.dispatchEvent(new Event('market-db-updated'));
      alert('Đã gửi đánh giá thành công.');
    } catch (error: any) {
      alert(`Không thể gửi đánh giá: ${error.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
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
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-accent/20 to-transparent opacity-50 pointer-events-none rounded-t-2xl" />

          <div className="sticky top-4 z-50 flex justify-end px-4 pt-4 -mb-12 pointer-events-none">
            <button
              onClick={onClose}
              className="pointer-events-auto rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/[0.2] transition-colors bg-black/40 backdrop-blur-md border border-white/[0.1]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-[#12121a] border border-white/[0.08] flex items-center justify-center text-brand-accent shadow-[0_0_30px_rgba(255,34,68,0.2)] overflow-hidden">
                {item.iconUrl ? <img src={item.iconUrl} alt="" className="h-20 w-20 object-contain" /> : renderIcon(item.iconType)}
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
                  <span>Phiên bản: {item.currentVersion}</span>
                </div>
                
                <div className="flex items-center gap-6 bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">Giá sản phẩm</p>
                    <p className="text-2xl font-extrabold text-white">{item.price}</p>
                  </div>
                  <div className="w-[1px] h-12 bg-white/[0.08]" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-brand-accent hover:border-brand-500/30 hover:text-white transition-all disabled:opacity-60"
                    >
                      <Download size={18} />
                      {isDownloading ? 'Đang tải...' : 'Tải xuống'}
                    </button>
                    {isPurchased ? (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default">
                        <CheckCircle size={18} />
                        Đã sở hữu
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,34,68,0.3)] hover:shadow-[0_0_30px_rgba(255,34,68,0.5)] active:scale-95 border ${
                          isInCart
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed'
                            : 'bg-brand-accent border-brand-500/25 text-white hover:bg-brand-600'
                        }`}
                      >
                        <ShoppingCart size={18} />
                        {isInCart ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ'}
                      </button>
                    )}
                  </div>
                </div>
                {purchaseNotice?.licenseKey && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                          <Key size={11} />
                          License Key
                        </p>
                        <code className="mt-1 block break-all font-mono text-sm text-emerald-50">{purchaseNotice.licenseKey}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(purchaseNotice.licenseKey || '')}
                        className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/15 p-2 text-emerald-100 hover:bg-emerald-500/25"
                        title="Copy"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/[0.06] space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Chi tiết sản phẩm</h3>
                <p className="text-zinc-400 leading-relaxed text-[15px]">
                  {item.description} Đây là sản phẩm đạt chuẩn chất lượng cao cấp được kiểm duyệt bởi đội ngũ chuyên gia của SN Studio. 
                  Sử dụng sản phẩm này sẽ giúp tối ưu hóa hiệu suất làm việc và mang lại trải nghiệm chuyên nghiệp nhất cho dự án của bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText size={18}/> Lịch sử phiên bản</h3>
                  <div className="space-y-3">
                    {(item.versions || []).map(version => (
                      <div key={version.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                        <p className="text-sm font-bold text-white">{version.version} <span className="font-normal text-xs text-zinc-500 ml-2">{version.releaseDate}</span></p>
                        <p className="text-xs text-zinc-400 mt-1">{version.changelog}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Đánh giá & nhận xét</h3>
                  <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {(item.reviewItems || []).map(review => (
                      <div key={review.id} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">{review.authorName}</p>
                          <span className="text-xs text-amber-400">{review.rating} ★</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSubmitReview} className="mt-4 space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                        className="rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
                      >
                        {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} sao</option>)}
                      </select>
                      <input
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Viết đánh giá..."
                        className="flex-1 rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="rounded bg-brand-accent hover:bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-60"
                    >
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                </div>
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
