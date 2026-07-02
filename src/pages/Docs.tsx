import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { docSections } from '../data/mockData';

export const Docs: React.FC = () => {
  // Set default active section & item IDs
  const [activeSectionId, setActiveSectionId] = useState(docSections[0].id);
  const [activeItemId, setActiveItemId] = useState(docSections[0].items[0].id);

  // Find active item
  const activeSection = docSections.find(s => s.id === activeSectionId) || docSections[0];
  const activeItem = activeSection.items.find(i => i.id === activeItemId) || activeSection.items[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Sidebar Navigation (3/12 cols) */}
        <aside className="md:col-span-3 space-y-6 md:sticky md:top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
          <div className="pb-4 border-b border-white/5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tài liệu kỹ thuật</h3>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Cập nhật: v2.4.1</span>
          </div>

          <nav className="space-y-5">
            {docSections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide px-2">
                  {section.title}
                </h4>
                <div className="space-y-1 pl-2 border-l border-zinc-850">
                  {section.items.map((item) => {
                    const isActive = activeItemId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSectionId(section.id);
                          setActiveItemId(item.id);
                        }}
                        className={`w-full text-left rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 relative ${
                          isActive 
                            ? 'bg-brand-accent/15 text-brand-accent font-semibold pl-3' 
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                        }`}
                      >
                        {isActive && (
                          <motion.span 
                            layoutId="activeDocIndicator"
                            className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-brand-accent"
                          />
                        )}
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Side: Content Reader (9/12 cols) */}
        <main className="md:col-span-9 rounded-xl border border-zinc-800 bg-zinc-950/40 p-6 md:p-8 backdrop-blur-sm min-h-[500px] prose prose-invert max-w-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItemId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">{activeSection.title}</span>
                  <span className="text-zinc-650 text-xs">/</span>
                  <span className="text-xs text-zinc-500">{activeItem.title}</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{activeItem.title}</h2>
              </div>

              <div className="text-zinc-300 text-sm leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {activeItem.content.split('\n\n').map((paragraph, index) => {
                  // Simple markdown parser helper for code blocks in mock data
                  if (paragraph.startsWith('```')) {
                    const lines = paragraph.split('\n');
                    const lang = lines[0].replace('```', '') || 'bash';
                    const code = lines.slice(1, -1).join('\n');
                    return (
                      <div key={index} className="my-5 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-200">
                        <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-900/50 px-4 py-1.5 text-[10px] text-zinc-550 select-none">
                          <span>{lang.toUpperCase()}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(code);
                              alert('Đã sao chép mã nguồn vào clipboard!');
                            }}
                            className="hover:text-white transition-colors duration-200"
                          >
                            Sao chép
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto leading-relaxed"><code>{code}</code></pre>
                      </div>
                    );
                  }
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};
