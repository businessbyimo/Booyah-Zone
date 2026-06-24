/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
        magenta: { 400: '#e879f9', 500: '#d946ef', 600: '#c026d3' },
        gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        dark: {
          900: '#050510',
          800: '#0a0a1f',
          700: '#0f0f2e',
          600: '#1a1a3e',
          500: '#252550',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: { from: { boxShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee' }, to: { boxShadow: '0 0 20px #22d3ee, 0 0 40px #22d3ee, 0 0 60px #22d3ee' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
      }
    },
  },
  plugins: [],
};
