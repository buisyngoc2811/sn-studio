import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export const LaptopMockup: React.FC = () => {
  const laptopRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!laptopRef.current) return;
    const rect = laptopRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt calculation (inverted for natural feeling)
    const tiltX = (y - centerY) / 25; 
    const tiltY = (centerX - x) / 25;

    laptopRef.current.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!laptopRef.current) return;
    laptopRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[620px] py-10 px-4">
      {/* Breathing glow behind laptop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-[400px] h-[300px] bg-brand-accent/10 blur-[100px] rounded-full animate-breathe" />
      </div>

      {/* Orbit particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-5">
        <div className="relative w-[320px] h-[320px]">
          <div className="absolute w-2 h-2 rounded-full bg-brand-accent/60 shadow-[0_0_8px_rgba(255,34,68,0.6)] animate-orbit" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-brand-accent/40 shadow-[0_0_6px_rgba(255,34,68,0.4)]" style={{ animation: 'orbit 16s linear infinite reverse' }} />
          <div className="absolute w-1 h-1 rounded-full bg-red-400/30" style={{ animation: 'orbit 20s linear 2s infinite' }} />
        </div>
      </div>

      {/* Floating laptop container */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        className="relative z-10"
      >
        {/* 3D Tilt container */}
        <div
          ref={laptopRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transition: 'transform 0.15s ease-out', transformStyle: 'preserve-3d' }}
          className="relative group w-full"
        >
          {/* Breathing red glow underneath */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-[40px] bg-brand-accent/35 blur-[45px] rounded-full animate-breathe pointer-events-none -z-10" />

          {/* Screen Body */}
          <div className="relative border border-white/[0.08] bg-[#08080c] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.85),0_10px_40px_rgba(255,34,68,0.15)] overflow-hidden aspect-[16/10] flex flex-col transition-shadow duration-500 group-hover:shadow-[0_50px_120px_rgba(0,0,0,0.95),0_15px_60px_rgba(255,34,68,0.25)]">
            
            {/* Screen inner border glow */}
            <div className="absolute inset-0 rounded-2xl border border-white/[0.04] pointer-events-none z-30" />
            
            {/* Screen Reflection Overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.08] pointer-events-none z-20 mix-blend-overlay" />
            
            {/* Periodic Shine Animation */}
            <motion.div
              className="absolute top-0 w-[60%] h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent skew-x-[-30deg] z-30 pointer-events-none"
              initial={{ left: '-150%' }}
              animate={{ left: '200%' }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 6 }}
            />

            {/* Top notch */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-[#0a0a0e] rounded-b-md flex items-center justify-center gap-1 z-40 shadow-sm">
              <div className="w-1 h-1 rounded-full bg-blue-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>

            {/* Screen Content */}
            <div className="flex-1 flex flex-col text-[10px] select-none p-3 font-sans overflow-hidden z-10">
              {/* Mock Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/70 hover:bg-yellow-400 transition-colors" />
                    <div className="w-2 h-2 rounded-full bg-green-500/70 hover:bg-green-400 transition-colors" />
                  </div>
                  <span className="text-zinc-600 text-[8px] font-mono">sn-studio://dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-1.5 py-0.5 rounded-md bg-brand-accent/10 text-brand-accent border border-brand-accent/15 font-medium text-[7px] animate-pulse-subtle">
                    PRO ACTIVE
                  </span>
                  <span className="text-zinc-500 font-mono text-[8px]">v2.4.1</span>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
                {/* Sidebar */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="h-4 bg-white/[0.04] rounded-md w-full flex items-center px-1.5 text-[8px] text-zinc-300 font-medium border border-brand-accent/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mr-1.5 shadow-[0_0_4px_rgba(255,34,68,0.6)]" /> Bảng Điều Khiển
                    </div>
                    <div className="h-4 rounded-md flex items-center px-1.5 text-[8px] text-zinc-500 hover:bg-white/[0.02] transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mr-1.5" /> Kho Ứng Dụng
                    </div>
                    <div className="h-4 rounded-md flex items-center px-1.5 text-[8px] text-zinc-500 hover:bg-white/[0.02] transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mr-1.5" /> Chợ Plugins
                    </div>
                    <div className="h-4 rounded-md flex items-center px-1.5 text-[8px] text-zinc-500 hover:bg-white/[0.02] transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mr-1.5" /> Tài Liệu API
                    </div>
                  </div>
                  <div className="border-t border-white/[0.04] pt-1.5 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center font-bold text-brand-accent text-[8px]">S</div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-[8px] font-medium leading-none">Sơn Nguyễn</span>
                      <span className="text-zinc-600 text-[6px] leading-none mt-0.5">Admin Developer</span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-span-2 flex flex-col gap-2 min-h-0">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col">
                      <span className="text-zinc-600 text-[6px] uppercase font-medium tracking-wider">Lượt Tải</span>
                      <span className="text-brand-accent text-xs font-bold font-mono mt-0.5">16.5K</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col">
                      <span className="text-zinc-600 text-[6px] uppercase font-medium tracking-wider">Đã Cài</span>
                      <span className="text-zinc-200 text-xs font-bold font-mono mt-0.5">4 Apps</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col">
                      <span className="text-zinc-600 text-[6px] uppercase font-medium tracking-wider">Uy Tín</span>
                      <span className="text-emerald-400 text-xs font-bold font-mono mt-0.5">99.8%</span>
                    </div>
                  </div>

                  {/* Terminal */}
                  <div className="flex-1 bg-[#060608] border border-white/[0.04] rounded-lg p-2 font-mono text-[7px] text-zinc-500 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-1 mb-1.5 text-[6px]">
                      <span className="text-zinc-600 tracking-wider">TERMINAL</span>
                      <span className="text-brand-accent animate-pulse-subtle font-bold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-brand-accent shadow-[0_0_4px_rgba(255,34,68,0.6)]" />
                        LIVE
                      </span>
                    </div>
                    <div className="space-y-0.5 flex-1 overflow-hidden leading-relaxed">
                      <p className="text-zinc-600">$ sn-terminal-pro --status</p>
                      <p className="text-emerald-500/80">[OK] GPU acceleration initialized (WebGL v2.0)</p>
                      <p className="text-zinc-500">[INFO] Connected to sn-network-primary</p>
                      <p className="text-zinc-500">[INFO] Loaded sn-guardian-shield.dylib</p>
                      <p className="text-brand-accent/80 font-medium">[SCAN] Packages integrity... 100% Secure</p>
                      <p className="text-zinc-600">$ <span className="animate-pulse">_</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base */}
          <div className="relative -mt-1 mx-auto w-[108%] -left-[4%] flex flex-col items-center z-20">
            <div className="w-[82%] h-1.5 bg-zinc-800 rounded-t-sm" />
            <div className="w-full h-3.5 bg-gradient-to-b from-zinc-700/80 to-zinc-900 border-t border-zinc-600/30 rounded-b-xl flex flex-col items-center relative">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />
              <div className="w-3/4 h-[3px] bg-zinc-950 rounded-full mt-1 opacity-50" />
              <div className="w-16 h-1 bg-zinc-850 rounded-b border-x border-b border-zinc-700/40 mt-0.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
