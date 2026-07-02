import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { AppData } from '../data/mockData';

interface AdminAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppData | null;
  onSave: (app: AppData) => void;
}

export const AdminAppModal: React.FC<AdminAppModalProps> = ({ isOpen, onClose, app, onSave }) => {
  const [formData, setFormData] = useState<Partial<AppData>>({});
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    if (app) {
      setFormData(app);
      setTagsStr(app.tags.join(', '));
    } else {
      setFormData({
        id: `app-${Date.now()}`,
        name: '',
        version: '1.0.0',
        category: 'dev',
        categoryLabel: 'Phát triển',
        description: '',
        isFree: true,
        rating: 5.0,
        downloads: 0,
        tags: [],
        iconType: 'terminal'
      });
      setTagsStr('');
    }
  }, [app, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedApp = {
      ...formData,
      tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean)
    } as AppData;
    onSave(updatedApp);
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 px-4 py-12 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="relative mx-auto w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-xl font-bold text-white">
                {app ? 'Chỉnh sửa Ứng dụng' : 'Thêm Ứng dụng mới'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tên ứng dụng</label>
                  <input
                    required
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Phiên bản</label>
                  <input
                    required
                    type="text"
                    value={formData.version || ''}
                    onChange={e => setFormData({...formData, version: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Danh mục (ID)</label>
                  <input
                    required
                    type="text"
                    value={formData.category || ''}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tên danh mục (Hiển thị)</label>
                  <input
                    required
                    type="text"
                    value={formData.categoryLabel || ''}
                    onChange={e => setFormData({...formData, categoryLabel: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Icon Type</label>
                  <select
                    value={formData.iconType || 'terminal'}
                    onChange={e => setFormData({...formData, iconType: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="terminal">Terminal</option>
                    <option value="shield">Shield</option>
                    <option value="code">Code</option>
                    <option value="zap">Zap</option>
                    <option value="cpu">CPU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Đánh giá (Rating)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || 0}
                    onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Lượt tải</label>
                  <input
                    required
                    type="number"
                    value={formData.downloads || 0}
                    onChange={e => setFormData({...formData, downloads: parseInt(e.target.value)})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Thẻ Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={e => setTagsStr(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  placeholder="ví dụ: công cụ, tiện ích, hệ thống"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-white mt-4 mb-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={formData.isFree || false}
                    onChange={e => setFormData({...formData, isFree: e.target.checked})}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 accent-brand-accent"
                  />
                  Là ứng dụng Miễn phí
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Mô tả chi tiết</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-brand-accent hover:bg-brand-600 shadow-glow-red transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
