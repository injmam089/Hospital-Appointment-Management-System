// ============================================================
// HAMS Centralized Medical Design System Tokens
// ============================================================

export const tokens = {
  colors: {
    light: {
      background: '#F7F9FC',
      surface: '#FFFFFF',
      surfaceSecondary: '#F1F5F9',
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      softPrimary: '#EFF6FF',
      foreground: '#0F172A',
      secondary: '#475569',
      muted: '#64748B',
      border: '#E2E8F0',
      borderSubtle: '#F1F5F9',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#0EA5E9',
      focusRing: 'rgba(37, 99, 235, 0.25)',
    },
    dark: {
      background: '#07111F',
      surface: '#0D1B2A',
      surfaceSecondary: '#132238',
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      softPrimary: 'rgba(59, 130, 246, 0.12)',
      foreground: '#F8FAFC',
      secondary: '#CBD5E1',
      muted: '#94A3B8',
      border: '#243447',
      borderSubtle: '#1A283B',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      info: '#38BDF8',
      focusRing: 'rgba(59, 130, 246, 0.35)',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      display: ['Inter', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.625',
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '12px',
    xl: '14px',
    '2xl': '16px',
    full: '9999px',
  },
  shadows: {
    subtle: 'var(--shadow-subtle)',
    card: 'var(--shadow-card)',
    elevated: 'var(--shadow-elevated)',
    modal: 'var(--shadow-modal)',
  },
} as const;

export type DesignTokens = typeof tokens;
