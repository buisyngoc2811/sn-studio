/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
          accent: '#ff2244',
        },
        dark: {
          bg:     '#050507',
          card:   '#0a0a0e',
          border: '#16161a',
          input:  '#0e0e12',
          hover:  '#121218',
          active: '#18181f',
          surface: '#0c0c10',
        }
      },
      fontFamily: {
        sans: [
          'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'
        ],
        mono: [
          'JetBrains Mono', 'Fira Code', 'Cascadia Code',
          'ui-monospace', 'SFMono-Regular', 'monospace'
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        tight: '-0.02em',
      },
      boxShadow: {
        'glow-red':         '0 0 16px rgba(255, 34, 68, 0.2)',
        'glow-red-md':      '0 0 28px rgba(255, 34, 68, 0.3)',
        'glow-red-strong':  '0 0 45px rgba(255, 34, 68, 0.45)',
        'glow-red-xl':      '0 0 80px rgba(255, 34, 68, 0.35)',
        'card':             '0 1px 2px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)',
        'card-hover':       '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,34,68,0.15)',
        'glass':            '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        'float':            '0 20px 60px rgba(0,0,0,0.7)',
        'inner-glow':       'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-radial':        'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':         'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise':                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        'grid-pattern':           "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        'grid-fine':              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '48px 48px',
        'grid-fine': '24px 24px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'float-slow':     'float 9s ease-in-out infinite',
        'breathe':        'breathe 4s ease-in-out infinite',
        'pulse-slow':     'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-subtle':   'pulseSubtle 3s ease-in-out infinite',
        'shimmer':        'shimmer 2.2s linear infinite',
        'spin-slow':      'spin 20s linear infinite',
        'spin-reverse':   'spinReverse 16s linear infinite',
        'orbit':          'orbit 12s linear infinite',
        'glow-pulse':     'glowPulse 3s ease-in-out infinite',
        'fade-in':        'fadeIn 0.5s ease forwards',
        'slide-up':       'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'border-beam':    'borderBeam 3s linear infinite',
        'blob-1':         'blob1 14s ease-in-out infinite',
        'blob-2':         'blob2 18s ease-in-out infinite',
        'blob-3':         'blob3 12s ease-in-out infinite',
        'count-up':       'countUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'ripple':         'ripple 0.6s ease-out forwards',
        'particle':       'particleFloat 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.8', transform: 'scale(1.05)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(255,34,68,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(255,34,68,0.5)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        borderBeam: {
          '0%':   { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        blob1: {
          '0%,100%': { transform: 'translate(0,0) scale(1)', opacity: '0.08' },
          '33%':     { transform: 'translate(30px,-20px) scale(1.1)', opacity: '0.14' },
          '66%':     { transform: 'translate(-15px,25px) scale(0.95)', opacity: '0.1' },
        },
        blob2: {
          '0%,100%': { transform: 'translate(0,0) scale(1)', opacity: '0.06' },
          '33%':     { transform: 'translate(-25px,20px) scale(1.08)', opacity: '0.12' },
          '66%':     { transform: 'translate(20px,-30px) scale(0.92)', opacity: '0.08' },
        },
        blob3: {
          '0%,100%': { transform: 'translate(0,0) scale(1)', opacity: '0.05' },
          '50%':     { transform: 'translate(20px,15px) scale(1.12)', opacity: '0.1' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        particleFloat: {
          '0%':   { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%':  { opacity: '0.6' },
          '90%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(-10vh) translateX(40px)', opacity: '0' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
}
