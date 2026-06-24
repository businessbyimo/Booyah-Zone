/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#0F0F1A',
          card: '#13131F',
          elevated: '#1A1A2E',
        },
        cyan: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc',
          300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4',
          600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63',
        },
        fuchsia: {
          50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe',
          300: '#f0abfc', 400: '#e879f9', 500: '#d946ef',
          600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75',
        },
        dark: {
          900: '#0A0A0F', 800: '#0F0F1A', 700: '#13131F',
          600: '#1A1A2E', 500: '#16213e', 400: '#0f3460',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite',
        'glow-fuchsia': 'glowFuchsia 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'count-up': 'countUp 0.5s ease-out',
        'ticker': 'ticker 20s linear infinite',
        'live-pulse': 'livePulse 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        glowCyan: { '0%, 100%': { boxShadow: '0 0 20px rgba(34,211,238,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(34,211,238,0.6)' } },
        glowFuchsia: { '0%, 100%': { boxShadow: '0 0 20px rgba(217,70,239,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(217,70,239,0.6)' } },
        slideUp: { '0%': { transform: 'translateY(100%)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        ticker: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(-100%)' } },
        livePulse: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      boxShadow: {
        'cyan': '0 4px 24px rgba(34,211,238,0.25)',
        'cyan-lg': '0 8px 40px rgba(34,211,238,0.35)',
        'fuchsia': '0 4px 24px rgba(217,70,239,0.25)',
        'fuchsia-lg': '0 8px 40px rgba(217,70,239,0.35)',
        'card': '0 2px 16px rgba(0,0,0,0.4)',
        'bottom-nav': '0 -4px 32px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        '3xl': '1.5rem', '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
