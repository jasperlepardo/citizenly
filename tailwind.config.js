/** @type {import('tailwindcss').Config} */
// Note: Design tokens are defined in TypeScript, so we'll define them here for Tailwind
const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    warning: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    rbi: {
      flagBlue: '#0038a8',
      flagRed: '#ce1126',
      flagYellow: '#fcd116',
      govBlue: '#1e40af',
      govGold: '#f59e0b',
      laborForce: '#059669',
      senior: '#7c3aed',
      youth: '#3b82f6',
      pwd: '#ea580c',
      migrant: '#6366f1',
    },
  },
  typography: {
    fontFamily: {
      primary: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
      display: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace',
      ],
    },
    fontSize: {
      xs: ['12px', { lineHeight: '14px', letterSpacing: '0.05em' }],
      sm: ['14px', { lineHeight: '16px', letterSpacing: '0.025em' }],
      base: ['16px', { lineHeight: '20px', letterSpacing: '0em' }],
      lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.025em' }],
      xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.025em' }],
      '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.05em' }],
      '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.05em' }],
      '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.1em' }],
      '5xl': ['48px', { lineHeight: '48px', letterSpacing: '-0.1em' }],
      '6xl': ['60px', { lineHeight: '60px', letterSpacing: '-0.15em' }],
      '7xl': ['72px', { lineHeight: '72px', letterSpacing: '-0.15em' }],
      '8xl': ['96px', { lineHeight: '96px', letterSpacing: '-0.2em' }],
      '9xl': ['128px', { lineHeight: '128px', letterSpacing: '-0.2em' }],
    },
  },
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '2px',
    1: '4px',
    1.5: '6px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    3.5: '14px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    14: '56px',
    16: '64px',
    18: '72px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    88: '352px',
    96: '384px',
  },
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
  boxShadow: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    soft: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
    strong: '0 8px 24px 0 rgba(0, 0, 0, 0.15)',
    'primary-focus': '0 0 0 3px rgba(59, 130, 246, 0.1)',
    'secondary-focus': '0 0 0 3px rgba(124, 58, 237, 0.1)',
    'success-focus': '0 0 0 3px rgba(5, 150, 105, 0.1)',
    'warning-focus': '0 0 0 3px rgba(234, 88, 12, 0.1)',
    'danger-focus': '0 0 0 3px rgba(220, 38, 38, 0.1)',
  },
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Typography
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,

      // Colors - Complete system
      colors: designTokens.colors,

      // Spacing - Complete scale
      spacing: designTokens.spacing,

      // Shadows - Complete system
      boxShadow: designTokens.boxShadow,

      // Border radius
      borderRadius: designTokens.borderRadius,

      // Z-index scale
      zIndex: designTokens.zIndex,
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/forms'),
    // Custom plugin to add font utilities and semantic colors
    function ({ addUtilities }) {
      const newUtilities = {
        // Font utilities
        '.font-system': {
          fontFamily:
            'var(--font-montserrat, "Montserrat"), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        },
        '.font-display': {
          fontFamily:
            'var(--font-montserrat, "Montserrat"), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
          fontWeight: '600',
        },
        '.font-body': {
          fontFamily:
            'var(--font-montserrat, "Montserrat"), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
          fontWeight: '400',
        },
        '.font-mono': {
          fontFamily:
            'ui-monospace, "SFMono-Regular", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
        },
        // Semantic text color utilities
        '.text-primary': {
          color: 'var(--color-text-primary)',
        },
        '.text-secondary': {
          color: 'var(--color-text-secondary)',
        },
        '.text-muted': {
          color: 'var(--color-text-muted)',
        },
        '.text-inverse': {
          color: 'var(--color-text-inverse)',
        },
        // Semantic background color utilities
        '.bg-background': {
          backgroundColor: 'var(--color-background)',
        },
        '.bg-background-muted': {
          backgroundColor: 'var(--color-background-muted)',
        },
        '.bg-surface': {
          backgroundColor: 'var(--color-surface)',
        },
        '.bg-surface-hover': {
          backgroundColor: 'var(--color-surface-hover)',
        },
        '.bg-surface-active': {
          backgroundColor: 'var(--color-surface-active)',
        },
        // Semantic border color utilities
        '.border-default': {
          borderColor: 'var(--color-border)',
        },
        '.border-light': {
          borderColor: 'var(--color-border-light)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
