import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { communityThreads as initialThreads, CommunityThread } from '../data/mockData';
import { MessageSquare, ThumbsUp, Send } from 'lucide-react';

interface CommunityProps {
  isLoggedIn: boolean;
  username: string;
  setRoute: (route: string) => void;
}

export const Community: React.FC<CommunityProps> = ({ isLoggedIn, username, setRoute }) => {
  const [threads, setThreads] = useState<CommunityThread[]>(initialThreads);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCat, setNewCat] = useState<'Thảo luận' | 'Hỏi đáp' | 'Showcase' | 'Góp ý'>('Thảo luận');

  const categories = ['Tất cả', 'Thảo luận', 'Hỏi đáp', 'Showcase', 'Góp ý'];

  const filteredThreads = threads.filter(t => 
    selectedCategory === 'Tất cả' || t.category === selectedCategory
  );

  const handleLike = (id: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, likes: t.likes + 1 };
      }
      return t;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để đăng bài viết thảo luận mới!');
      setRoute('login');
      return;
    }

    if (!newTitle.trim() || !newContent.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!');
      return;
    }

    const newThread: CommunityThread = {
      id: `thread-${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: username,
      role: 'Active Member',
      avatarSeed: username.toLowerCase().replace(/\s+/g, ''),
      category: newCat,
      replies: 0,
      likes: 0,
      timeAgo: 'Vừa xong'
    };

    setThreads([newThread, ...threads]);
    setNewTitle('');
    setNewContent('');
    alert('Đăng bài viết thảo luận thành công!');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Category selector & threads lists (8/12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                <span className="h-6 w-1.5 bg-brand-accent rounded-full" />
                Cộng Đồng Thảo Luận
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Kết nối, chia sẻ kinh nghiệm sử dụng phần mềm và giải quyết bài toán kỹ thuật.</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition-all duration-300 ${
                    selectedCategory === c
                      ? 'bg-brand-accent/15 text-brand-accent border-brand-500/35 shadow-glow-red'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Threads list with Layout Transitions */}
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredThreads.map((thread) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={thread.id}
                  className={`rounded-xl border p-5 bg-zinc-950/60 transition-all duration-300 ${
                    thread.isPinned 
                      ? 'border-brand-500/20 shadow-glow-red bg-zinc-950' 
                      : 'border-zinc-800 hover:border-brand-500/25 hover:shadow-glow-red'
                  }`}
                >
                  {/* Thread Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* User profile avatar placeholder */}
                      <div className="h-7 w-7 rounded-full bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-[10px] font-bold text-brand-400 uppercase">
                        {thread.author.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-200">{thread.author}</span>
                          <span className={`rounded px-1.5 py-0.2 text-[8px] font-semibold uppercase tracking-wider ${
                            thread.role === 'Administrator'
                              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                              : thread.role === 'Developer'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                              : thread.role === 'VIP Member'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                              : 'bg-zinc-900 text-zinc-550'
                          }`}>
                            {thread.role}
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-550 mt-0.5">{thread.timeAgo}</span>
                      </div>
                    </div>

                    <span className="rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 text-[9px] font-semibold text-zinc-400 uppercase">
                      {thread.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 hover:text-brand-400 cursor-pointer transition-colors duration-200">
                      {thread.isPinned && <span className="text-brand-accent text-xs">📌 [Ghim]</span>}
                      {thread.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {thread.content}
                    </p>
                  </div>

                  {/* Footer interactive buttons */}
                  <div className="flex items-center gap-6 mt-4.5 pt-3.5 border-t border-white/5 text-xs text-zinc-500">
                    <button 
                      onClick={() => handleLike(thread.id)}
                      className="flex items-center gap-1.5 hover:text-brand-400 transition-colors duration-200 group"
                    >
                      <ThumbsUp size={13} className="group-hover:scale-110 transition-transform" />
                      <span>Thích ({thread.likes})</span>
                    </button>
                    <button 
                      onClick={() => alert('Chức năng bình luận đang được phát triển, dữ liệu sẽ được liên kết ở phiên bản tiếp theo.')}
                      className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
                    >
                      <MessageSquare size={13} />
                      <span>Trả lời ({thread.replies})</span>
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Side: Create post form (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-glass transition-all hover:border-brand-500/20">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Send size={14} className="text-brand-accent" />
                Đăng bài thảo luận
              </h3>
              <p className="text-zinc-500 text-xs mt-1">Tạo chủ đề thảo luận mới để hỏi ý kiến cộng đồng hoặc chia sẻ thành quả của bạn.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Chuyên mục</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                >
                  <option value="Thảo luận">Thảo luận</option>
                  <option value="Hỏi đáp">Hỏi đáp</option>
                  <option value="Showcase">Showcase (Trình diễn)</option>
                  <option value="Góp ý">Góp ý</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tiêu đề</label>
                <input
                  type="text"
                  placeholder="Tiêu đề bài viết..."
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nội dung</label>
                <textarea
                  rows={5}
                  placeholder="Nội dung thảo luận chi tiết..."
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded bg-brand-accent hover:bg-brand-600 py-2.5 text-center text-xs font-bold text-white transition-colors duration-300 shadow-glow-red"
              >
                Gửi bài viết
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
