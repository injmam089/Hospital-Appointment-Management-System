/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Primary
          700: '#1D4ED8', // Primary Hover
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        navy: {
          DEFAULT: '#0F172A', // Primary Text
          midnight: '#0B1224', // Deep Navy
          dark: '#0F172A',
          light: '#1E293B',
          slate: '#0F172A',
        },
        surface: {
          DEFAULT: '#F7F9FC', // App Background
          background: '#F7F9FC',
          card: '#FFFFFF',
        },
        card: '#FFFFFF',
        border: {
          DEFAULT: '#E2E8F0', // Border
          light: '#F1F5F9',
          subtle: '#E2E8F0',
        },
        muted: {
          DEFAULT: '#64748B', // Secondary Text
          foreground: '#94A3B8', // Muted
        },
        medical: {
          blue: '#2563EB',
          'blue-light': '#EFF6FF',
          'blue-text': '#1D4ED8',
          green: '#10B981', // Success
          'green-light': '#ECFDF5',
          'green-text': '#047857',
          amber: '#F59E0B', // Warning
          'amber-light': '#FFFBEB',
          'amber-text': '#B45309',
          red: '#EF4444', // Error
          'red-light': '#FEF2F2',
          'red-text': '#B91C1C',
          purple: '#8B5CF6',
          'purple-light': '#F5F3FF',
          'purple-text': '#6D28D9',
          info: '#0284C7',
          'info-light': '#F0F9FF',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        '3xl': '20px',
        card: '18px',
        btn: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 8px 25px -4px rgba(15, 23, 42, 0.08), 0 3px 6px -2px rgba(15, 23, 42, 0.04)',
        modal: '0 20px 45px -10px rgba(15, 23, 42, 0.18)',
        subtle: '0 1px 2px rgba(15, 23, 42, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
