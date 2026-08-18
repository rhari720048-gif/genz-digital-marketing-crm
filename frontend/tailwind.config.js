/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Royal blue primary accent
          700: '#1d4ed8',
          800: '#1e40af', // Royal blue deep tone
          900: '#1e3a8a',
          950: '#172554',
        },
        neural: {
          dark: '#0F172A',
          slate: '#334155',
          light: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'royal-glow': '0 4px 20px -2px rgba(37, 99, 235, 0.25)',
        'royal-card': '0 10px 30px -5px rgba(30, 64, 175, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'glass': '0 8px 32px 0 rgba(30, 64, 175, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(37, 99, 235, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(37, 99, 235, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
