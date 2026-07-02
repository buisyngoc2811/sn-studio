import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FooterProps {
  setRoute: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setRoute }) => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    alert(`Cảm ơn bạn đã đăng ký bản tin! Chúng tôi sẽ gửi thông báo mới nhất đến email: ${email}`);
    setEmail('');
  };

  const footerLinks = [
    {
      title: 'Sản Phẩm',
      links: [
        { label: 'SN Terminal Pro', route: 'apps' },
        { label: 'SN Guardian Shield', route: 'apps' },
        { label: 'SN Code Compiler', route: 'apps' },
        { label: 'SN Flow Automation', route: 'apps' },
      ]
    },
    {
      title: 'Tài Nguyên',
      links: [
        { label: 'Kiến thức / Blog', route: 'knowledge' },
        { label: 'Tài liệu Hướng dẫn', route: 'docs' },
        { label: 'Thảo luận Cộng đồng', route: 'community' },
        { label: 'Chợ Marketplace', route: 'marketplace' },
      ]
    }
  ];

  return (
    <footer className="relative border-t border-white/[0.04] bg-[#050507] py-16 text-zinc-500 z-10">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-accent/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Logo & Intro */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setRoute('home')}
              whileHover={{ x: 2 }}
            >
              <svg className="h-6 w-6 text-brand-accent transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(255,34,68,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span className="text-base font-bold tracking-tight text-white">
                SN <span className="text-brand-accent">Studio</span>
              </span>
            </motion.div>
            <p className="text-sm max-w-sm leading-relaxed text-zinc-500">
              Thiết kế và phát triển các sản phẩm phần mềm tối ưu hiệu năng, bảo mật cao cấp và giao diện hiện đại hướng tới lập trình viên chuyên nghiệp.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-1">
              {[
                { title: 'GitHub', path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
                { title: 'Discord', path: 'M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011 13.983 13.983 0 0010.83 0 .075.075 0 01.078.01c.12.099.246.196.373.289a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107 14.36 14.36 0 001.226 1.99.076.076 0 00.084.03 19.793 19.793 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z' },
              ].map((social) => (
                <a
                  key={social.title}
                  href="#"
                  className="rounded-xl p-2 text-zinc-600 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                  title={social.title}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d={social.path} clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-2xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => setRoute(link.route)}
                      className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-2xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Đăng Ký Bản Tin</h3>
            <p className="text-xs leading-relaxed text-zinc-600">
              Nhận thông báo sớm nhất về các đợt phát hành phần mềm và tính năng mới.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn..."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input !py-2 !px-3 !text-xs !rounded-xl flex-1"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl bg-brand-accent hover:bg-brand-600 px-4 py-2 text-xs text-white font-semibold transition-colors shadow-glow-red shrink-0"
              >
                Gửi
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="divider-gradient mt-12 mb-0" />
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <p>© 2026 SN Studio. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
