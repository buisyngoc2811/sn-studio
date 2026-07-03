import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ShieldAlert } from 'lucide-react';
import { ProfileRow } from '../lib/profiles';

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileRow | null;
  onSave: (user: ProfileRow) => Promise<void>;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState<Partial<ProfileRow>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        id: crypto.randomUUID(),
        username: '',
        display_name: '',
        email: '',
        role: 'user',
        status: 'active',
        avatar_url: '',
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData as ProfileRow);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 px-4 py-12 backdrop-blur-md flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {user ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Tên hiển thị</label>
                <input
                  required
                  type="text"
                  value={formData.display_name || ''}
                  onChange={e => setFormData({...formData, display_name: e.target.value})}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Username</label>
                <input
                  required
                  type="text"
                  value={formData.username || ''}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Avatar URL</label>
                <input
                  type="text"
                  value={formData.avatar_url || ''}
                  onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Quyền hạn (Role)</label>
                  <select
                    value={formData.role || 'user'}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="user">User</option>
                    <option value="developer">Developer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Trạng thái (Status)</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={e => setFormData({...formData, status: e.target.value as ProfileRow['status']})}
                    className={`w-full rounded bg-zinc-900 border px-3 py-2 text-sm focus:outline-none focus:border-brand-accent ${formData.status === 'banned' ? 'border-red-500/50 text-red-400' : 'border-zinc-800 text-emerald-400'}`}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="banned">Bị cấm (Banned)</option>
                  </select>
                </div>
              </div>

              {formData.status === 'banned' && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2">
                  <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-300">Tài khoản này hiện đang bị đình chỉ trong hồ sơ Supabase.</p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-brand-accent hover:bg-brand-600 shadow-glow-red transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
