/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          background: 'var(--background)',
          card: 'var(--surface)',
        },
        card: 'var(--surface)',
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          light: 'var(--border-subtle)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted)',
          light: 'var(--muted-light)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          soft: 'var(--primary-soft)',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        navy: {
          DEFAULT: 'var(--foreground)',
          midnight: '#07111F',
          dark: '#0D1B2A',
          light: '#1E293B',
          slate: '#0F172A',
        },
        medical: {
          blue: 'var(--primary)',
          'blue-light': 'var(--primary-soft)',
          'blue-text': 'var(--primary)',
          green: 'var(--success)',
          'green-light': 'var(--success-soft)',
          'green-text': 'var(--success)',
          amber: 'var(--warning)',
          'amber-light': 'var(--warning-soft)',
          'amber-text': 'var(--warning)',
          red: 'var(--danger)',
          'red-light': 'var(--danger-soft)',
          'red-text': 'var(--danger)',
          purple: '#8B5CF6',
          'purple-light': '#F5F3FF',
          'purple-text': '#6D28D9',
          info: 'var(--info)',
          'info-light': 'var(--info-soft)',
        },
        success: {
          DEFAULT: 'var(--success)',
          soft: 'var(--success-soft)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          soft: 'var(--warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
        },
        info: {
          DEFAULT: 'var(--info)',
          soft: 'var(--info-soft)',
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
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-elevated)',
        elevated: 'var(--shadow-elevated)',
        modal: 'var(--shadow-modal)',
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
