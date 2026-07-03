import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { MarketplaceCategoryRow, MarketplaceItem, uploadMarketplaceFile } from '../lib/marketplace';

interface AdminMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketplaceItem | null;
  onSave: (item: MarketplaceItem) => void;
  categories: MarketplaceCategoryRow[];
}

export const AdminMarketModal: React.FC<AdminMarketModalProps> = ({ isOpen, onClose, item, onSave, categories }) => {
  const [formData, setFormData] = useState<Partial<MarketplaceItem>>({});
  const [tagsStr, setTagsStr] = useState('');
  const [screenshotsStr, setScreenshotsStr] = useState('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setTagsStr(item.tags ? item.tags.join(', ') : '');
      setScreenshotsStr(item.screenshots ? item.screenshots.join('\\n') : '');
    } else {
      setFormData({
        id: `market-${Date.now()}`,
        name: '',
        description: '',
        price: '0đ',
        category: 'Plugins',
        categoryLabel: 'Plugin mở rộng',
        rating: 5,
        reviews: 0,
        downloads: '0',
        rawDownloads: 0,
        seller: 'Admin',
        badge: '',
        iconType: 'puzzle',
        cover: '',
        currentVersion: 'v1.0.0',
        downloadPath: ''
      });
      setTagsStr('');
      setScreenshotsStr('');
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedItem = {
      ...formData,
      tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
      screenshots: screenshotsStr.split('\\n').map(s => s.trim()).filter(Boolean)
    } as MarketplaceItem;
    onSave(updatedItem);
    onClose();
  };

  const uploadFile = async (type: 'icon' | 'download', file?: File | null) => {
    if (!file) return;
    const safeName = (formData.name || 'marketplace-item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    try {
      if (type === 'icon') {
        setIsUploadingIcon(true);
        const path = await uploadMarketplaceFile('app-icons', `marketplace/${safeName || 'item'}`, file);
        setFormData(prev => ({ ...prev, iconPath: path, cover: path }));
      } else {
        setIsUploadingFile(true);
        const path = await uploadMarketplaceFile('app-files', `marketplace/${safeName || 'item'}`, file);
        setFormData(prev => ({ ...prev, downloadPath: path }));
      }
    } catch (error: any) {
      alert(`Không thể upload file: ${error.message}`);
    } finally {
      setIsUploadingIcon(false);
      setIsUploadingFile(false);
    }
  };

  const isFree = formData.price === '0đ' || formData.price === 'Miễn phí';

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
            className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-xl font-bold text-white">
                {item ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Marketplace'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tên sản phẩm</label>
                  <input
                    required
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tác giả (Seller)</label>
                  <input
                    required
                    type="text"
                    value={formData.seller || ''}
                    onChange={e => setFormData({...formData, seller: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Giá bán (VD: 99.000đ, hoặc 0đ)</label>
                  <input
                    required
                    type="text"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Hiện đang tính là: {isFree ? 'Miễn phí (Free)' : 'Trả phí (Premium)'}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Danh mục ID</label>
                  <select
                    value={formData.category || 'Plugins'}
                    onChange={e => {
                      const selected = categories.find(category => category.name === e.target.value || category.slug === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                        categoryLabel: selected?.label || formData.categoryLabel,
                      });
                    }}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  >
                    {(categories.length ? categories : [
                      { id: 'themes', name: 'Themes', slug: 'themes', label: 'Giao diện' },
                      { id: 'plugins', name: 'Plugins', slug: 'plugins', label: 'Plugin mở rộng' },
                      { id: 'tools', name: 'Tools', slug: 'tools', label: 'Công cụ bổ trợ' },
                      { id: 'extensions', name: 'Extensions', slug: 'extensions', label: 'Tiện ích' },
                    ]).map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tên danh mục hiển thị</label>
                  <input
                    required
                    type="text"
                    value={formData.categoryLabel || ''}
                    onChange={e => setFormData({...formData, categoryLabel: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Icon Type</label>
                  <select
                    value={formData.iconType || 'puzzle'}
                    onChange={e => setFormData({...formData, iconType: e.target.value as any})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="palette">Palette</option>
                    <option value="puzzle">Puzzle</option>
                    <option value="wrench">Wrench</option>
                    <option value="plug">Plug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Badge</label>
                  <select
                    value={formData.badge || ''}
                    onChange={e => setFormData({...formData, badge: e.target.value as any})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="">Không có</option>
                    <option value="Đặc biệt">Đặc biệt</option>
                    <option value="Phổ biến">Phổ biến</option>
                    <option value="Mới">Mới</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Rating</label>
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
                    type="text"
                    value={formData.downloads || ''}
                    onChange={e => {
                      const downloads = e.target.value;
                      const rawDownloads = parseInt(downloads.replace(/[^\d]/g, ''), 10) || 0;
                      setFormData({...formData, downloads, rawDownloads});
                    }}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Ảnh đại diện (Storage path hoặc URL)</label>
                  <input
                    type="text"
                    value={formData.iconPath || formData.cover || ''}
                    onChange={e => setFormData({...formData, iconPath: e.target.value, cover: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                  <input
                    type="file"
                    accept="image/*,.svg"
                    disabled={isUploadingIcon}
                    onChange={e => uploadFile('icon', e.target.files?.[0])}
                    className="mt-2 block w-full text-[11px] text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-zinc-200 hover:file:bg-zinc-700"
                  />
                  {isUploadingIcon && <span className="text-[10px] text-zinc-500">Đang upload icon...</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">File tải xuống (Storage path)</label>
                  <input
                    type="text"
                    value={formData.downloadPath || ''}
                    onChange={e => setFormData({...formData, downloadPath: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                    placeholder="marketplace/product/file.zip"
                  />
                  <input
                    type="file"
                    disabled={isUploadingFile}
                    onChange={e => uploadFile('download', e.target.files?.[0])}
                    className="mt-2 block w-full text-[11px] text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-zinc-200 hover:file:bg-zinc-700"
                  />
                  {isUploadingFile && <span className="text-[10px] text-zinc-500">Đang upload file...</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Phiên bản hiện tại</label>
                  <input
                    type="text"
                    value={formData.currentVersion || ''}
                    onChange={e => setFormData({...formData, currentVersion: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                    placeholder="v1.0.0"
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
                  placeholder="ví dụ: theme, ui, dark mode"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Screenshots (Mỗi URL một dòng)</label>
                <textarea
                  rows={3}
                  value={screenshotsStr}
                  onChange={e => setScreenshotsStr(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent font-mono"
                  placeholder="https://... image1&#10;https://... image2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Mô tả ngắn</label>
                <textarea
                  required
                  rows={3}
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
