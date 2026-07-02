import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Ripple effect
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'absolute rounded-full bg-white/30 pointer-events-none';
      ripple.style.cssText = `left:${x}px;top:${y}px;width:0;height:0;transform:translate(-50%,-50%);animation:ripple 0.6s ease-out forwards;`;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }
    onClick?.(e);
  }, [onClick]);

  if (variant === 'secondary') {
    return (
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className={`relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.08] px-5 py-2.5 font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group ${className}`}
        {...props}
      >
        {/* Animated border on hover */}
        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,34,68,0.15), transparent 40%, transparent 60%, rgba(255,34,68,0.15))',
          }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-xl bg-brand-accent px-5 py-2.5 font-semibold text-white shadow-[0_0_20px_rgba(255,34,68,0.25)] hover:shadow-[0_0_36px_rgba(255,34,68,0.45)] border border-brand-500/30 hover:border-brand-400/50 transition-all duration-300 group ${className}`}
      {...props}
    >
      {/* Shimmer sweep */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-0"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 2.2,
          ease: 'linear',
          repeatDelay: 1,
        }}
        style={{ width: '50%' }}
      />

      {/* Top highlight */}
      <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

      {/* Hover glow fill */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
