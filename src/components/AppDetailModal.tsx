import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, appsData } from '../data/mockData';
import { 
  X, 
  Download, 
  Star, 
  Terminal, 
  Shield, 
  Code, 
  Zap, 
  Cpu,
  FileText,
  LayoutDashboard
} from 'lucide-react';

interface AppDetailModalProps {
  app: AppData;
  onClose: () => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({ app, onClose }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Parse download string (e.g., '8.4K') to a base number for simulation
  const parseDownloads = (str: string) => {
    if (str.includes('K')) return parseFloat(str) * 1000;
    if (str.includes('M')) return parseFloat(str) * 1000000;
    return parseInt(str.replace(/,/g, '')) || 0;
  };

  useEffect(() => {
    // Check local storage
    const downloaded = JSON.parse(localStorage.getItem('sn_downloaded_apps') || '[]');
    setIsDownloaded(downloaded.includes(app.id));

    const saved = JSON.parse(localStorage.getItem('sn_saved_apps') || '[]');
    setIsSaved(saved.includes(app.id));

    // Get dynamic stats
    const stats = JSON.parse(localStorage.getItem('sn_app_stats') || '{}');
    const base = parseDownloads(app.downloads);
    const extra = stats[app.id] || 0;
    setDownloadCount(base + extra);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [app, onClose]);

  const handleDownload = () => {
    if (isDownloaded) return;

    // Save to downloaded apps
    const downloaded = JSON.parse(localStorage.getItem('sn_downloaded_apps') || '[]');
    downloaded.push(app.id);
    localStorage.setItem('sn_downloaded_apps', JSON.stringify(downloaded));
    setIsDownloaded(true);

    // Increase stats
    const stats = JSON.parse(localStorage.getItem('sn_app_stats') || '{}');
    stats[app.id] = (stats[app.id] || 0) + 1;
    localStorage.setItem('sn_app_stats', JSON.stringify(stats));
    setDownloadCount(prev => prev + 1);

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('sn_saved_apps') || '[]');
    if (isSaved) {
      const newSaved = saved.filter((id: string) => id !== app.id);
      localStorage.setItem('sn_saved_apps', JSON.stringify(newSaved));
      setIsSaved(false);
    } else {
      saved.push(app.id);
      localStorage.setItem('sn_saved_apps', JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  const renderIcon = (iconType: string, size = 24) => {
    switch (iconType) {
      case 'terminal': return <Terminal size={size} />;
      case 'shield': return <Shield size={size} />;
      case 'code': return <Code size={size} />;
      case 'zap': return <Zap size={size} />;
      case 'cpu': return <Cpu size={size} />;
      default: return <Code size={size} />;
    }
  };

  const formatDownloads = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Find related apps (same category, exclude current)
  const relatedApps = appsData
    .filter(a => a.category === app.category && a.id !== app.id)
    .slice(0, 3);

  // Mock data for new requirements
  const fileSize = "45.2 MB";
  const features = [
    "Hỗ trợ giao diện Dark Premium",
    "Tích hợp công nghệ lõi SN Engine mới nhất",
    "Bảo mật dữ liệu end-to-end",
    "Tương thích hoàn toàn Windows 11 & macOS"
  ];
  const changelog = [
    { v: app.version, date: app.updateDate, text: "Cập nhật hiệu năng xử lý và vá lỗi giao diện." },
    { v: "Phiên bản trước", date: "Tháng trước", text: "Thêm tính năng đồng bộ đám mây và dark mode." }
  ];

  const modalContent = (
    <>
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
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-[#12121a] border border-white/[0.08] flex items-center justify-center text-brand-accent shadow-[0_0_30px_rgba(255,34,68,0.2)]">
                {renderIcon(app.iconType, 48)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{app.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${app.isFree ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-accent/10 text-brand-400'}`}>
                    {app.isFree ? 'Miễn phí' : 'Premium'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400 mb-4 font-medium">
                  <span className="text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded">{app.categoryLabel}</span>
                  <span>Phiên bản: {app.version}</span>
                  <span>Kích thước: {fileSize}</span>
                  <span>Cập nhật: {app.updateDate}</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloaded}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      isDownloaded 
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                        : 'bg-brand-accent text-white hover:bg-brand-600 shadow-[0_0_20px_rgba(255,34,68,0.4)] hover:shadow-[0_0_30px_rgba(255,34,68,0.6)] active:scale-95'
                    }`}
                  >
                    <Download size={18} />
                    {isDownloaded ? 'Đã tải xuống' : 'Tải xuống'}
                  </button>
                  <button
                    onClick={handleToggleSave}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                      isSaved
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                        : 'bg-transparent border-white/[0.1] text-zinc-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Star size={18} className={isSaved ? 'fill-brand-400' : ''} />
                    {isSaved ? 'Đã lưu' : 'Lưu ứng dụng'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 py-6 border-y border-white/[0.06]">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                  <Star size={16} className="fill-amber-400" />
                  <span className="font-bold text-lg">{app.rating}</span>
                </div>
                <p className="text-xs text-zinc-500">Đánh giá trung bình</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-white mb-1">{formatDownloads(downloadCount)}+</p>
                <p className="text-xs text-zinc-500">Lượt tải xuống</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-white mb-1">100%</p>
                <p className="text-xs text-zinc-500">Độ an toàn (Quét lõi)</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-white mb-1">64-bit</p>
                <p className="text-xs text-zinc-500">Kiến trúc hỗ trợ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* Main Content (Left 2/3) */}
              <div className="md:col-span-2 space-y-8">
                {/* Screenshots */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Giao diện nổi bật</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex-shrink-0 w-64 h-36 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/[0.05] flex items-center justify-center group overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform">
                          <LayoutDashboard size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Giới thiệu</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {app.description} Tích hợp các công nghệ tiên tiến nhất, sản phẩm này được thiết kế để tối ưu hóa hiệu suất làm việc và đảm bảo an toàn dữ liệu tuyệt đối cho quy trình của bạn.
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Tính năng chính</h3>
                  <ul className="space-y-2">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar Content (Right 1/3) */}
              <div className="space-y-8">
                {/* Tags */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Thẻ phân loại</h3>
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag, idx) => (
                      <span key={idx} className="rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-400 border border-white/[0.06]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Changelog */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <FileText size={16} /> Lịch sử cập nhật
                  </h3>
                  <div className="space-y-4">
                    {changelog.map((log, i) => (
                      <div key={i} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-brand-500 before:rounded-full">
                        <p className="text-xs font-bold text-white">{log.v} <span className="font-normal text-zinc-500 ml-1">{log.date}</span></p>
                        <p className="text-xs text-zinc-400 mt-1">{log.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Apps */}
            {relatedApps.length > 0 && (
              <div className="mt-10 pt-8 border-t border-white/[0.06]">
                <h3 className="text-lg font-bold text-white mb-4">Ứng dụng cùng thể loại</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedApps.map(relApp => (
                    <div key={relApp.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-accent">
                        {renderIcon(relApp.iconType, 20)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white truncate">{relApp.name}</p>
                        <p className="text-xs text-zinc-500">{relApp.rating} ★</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Success Toast Portal/Fixed Layer */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[110] flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#0a0a0e]/95 p-4 shadow-[0_8px_30px_rgba(16,185,129,0.2)] backdrop-blur-xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <Download size={16} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Tải xuống hoàn tất</h4>
              <p className="text-xs text-zinc-400">Ứng dụng đã được thêm vào Dashboard.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(modalContent, document.body);
};
