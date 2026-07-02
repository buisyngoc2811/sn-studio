import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { ArticleData } from '../data/mockData';

interface AdminArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleData | null;
  onSave: (article: ArticleData) => void;
}

export const AdminArticleModal: React.FC<AdminArticleModalProps> = ({ isOpen, onClose, article, onSave }) => {
  const [formData, setFormData] = useState<Partial<ArticleData>>({});
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    if (article) {
      setFormData(article);
      setTagsStr(article.tags.join(', '));
    } else {
      setFormData({
        id: `art-${Date.now()}`,
        title: '',
        category: 'Lập trình',
        date: new Date().toLocaleDateString('vi-VN'),
        readTime: '5 phút',
        author: 'Admin',
        summary: '',
        content: '',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80',
        tags: [],
        views: 0,
        likes: 0,
        isFeatured: false
      });
      setTagsStr('');
    }
  }, [article, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedArticle = {
      ...formData,
      tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean)
    } as ArticleData;
    onSave(updatedArticle);
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
            className="relative mx-auto w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-xl font-bold text-white">
                {article ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết mới'}
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
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tiêu đề bài viết</label>
                  <input
                    required
                    type="text"
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Tác giả</label>
                  <input
                    required
                    type="text"
                    value={formData.author || ''}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Danh mục</label>
                  <input
                    required
                    type="text"
                    value={formData.category || ''}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Ngày xuất bản</label>
                  <input
                    required
                    type="text"
                    value={formData.date || ''}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Ảnh bìa (URL)</label>
                  <input
                    required
                    type="text"
                    value={formData.cover || ''}
                    onChange={e => setFormData({...formData, cover: e.target.value})}
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
                  placeholder="ví dụ: react, javascript, frontend"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-white mt-4 mb-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 accent-brand-accent"
                  />
                  Đánh dấu là Bài viết Nổi bật
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Mô tả ngắn (Summary)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary || ''}
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Nội dung bài viết (Markdown/HTML)</label>
                <textarea
                  required
                  rows={10}
                  value={formData.content || ''}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent font-mono"
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
