import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        realm: {
          void: '#050608',
          basalt: '#0b0d13',
          slate: '#141824',
          card: '#10131d',
          border: 'rgba(212, 175, 55, 0.25)',
          gold: '#d4af37',
          amber: '#f59e0b',
          crimson: '#e11d48',
          sapphire: '#3b82f6',
          emerald: '#10b981',
          parchment: '#f4ecd8',
        },
        cyber: {
          dark: '#0a0a12',
          card: '#121220',
          border: '#1f1f38',
          cyan: '#00f0ff',
          magenta: '#ff007f',
          purple: '#8b5cf6',
          yellow: '#facc15',
          green: '#10b981',
        },
        lofi: {
          dark: '#1c1917',
          card: '#292524',
          border: '#44403c',
          amber: '#f59e0b',
          wood: '#b45309',
          cream: '#fef3c7',
        },
        retro: {
          dark: '#0f0f1b',
          card: '#1b1b2f',
          border: '#2c2c4d',
          gold: '#fbbf24',
          rune: '#a855f7',
          ruby: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cinzel', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        decorative: ['Cinzel Decorative', 'Cinzel', 'serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 24px rgba(0,240,255,0.8))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
