/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          300: '#fdba74', 400: '#fb923c', 500: '#f97316',
          600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12'
        },
        brand: { DEFAULT: '#FF6B00', light: '#FF8C42', dark: '#CC5500' },
        purple: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff',
          300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7',
          600: '#9333ea', 700: '#7c3aed', 800: '#6b21a8', 900: '#581c87'
        },
        dark: {
          900: '#0f0f1a', 800: '#1a1a2e', 700: '#16213e', 600: '#0f3460', 500: '#533483',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
        'orange': '0 8px 32px rgba(255, 107, 0, 0.3)',
      },
      borderRadius: {
        '3xl': '1.5rem', '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
