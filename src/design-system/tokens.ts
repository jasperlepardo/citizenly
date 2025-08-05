/**
 * Citizenly Design System - Design Tokens
 * Comprehensive design token system for the RBI (Records of Barangay Inhabitants) System
 * Based on Philippines government design principles and accessibility standards
 */

// =============================================================================
// COLOR SYSTEM
// =============================================================================

export const colors = {
  // Primary (Blue) - JSPR Design System colors from Figma
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Base primary
    600: '#2563eb', // Figma primary button color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary (Purple) - JSPR Design System colors from Figma
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed', // Figma secondary button color
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Success (Emerald) - JSPR Design System colors from Figma
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669', // Figma success button color
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Warning (Orange) - JSPR Design System colors from Figma
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c', // Figma warning button color
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // Danger (Red) - JSPR Design System colors from Figma
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // Figma danger button color
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Neutral (Gray) - JSPR Design System colors from Figma
  neutral: {
    0: '#ffffff', // Pure white - Figma background
    50: '#fafafa', // Figma disabled background
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4', // Figma neutral button colors
    400: '#a3a3a3',
    500: '#737373', // Figma disabled text color
    600: '#525252',
    700: '#404040', // Base text - Figma text colors
    800: '#262626', // Dark text
    900: '#171717',
    950: '#0a0a0a',
  },

  // Special colors for RBI system
  rbi: {
    // Philippines flag inspired
    flagBlue: '#0038a8',
    flagRed: '#ce1126',
    flagYellow: '#fcd116',

    // Government official colors
    govBlue: '#1e40af',
    govGold: '#f59e0b',

    // Sectoral classification colors
    laborForce: '#059669',
    senior: '#7c3aed',
    youth: '#3b82f6',
    pwd: '#ea580c',
    migrant: '#6366f1',
  },
} as const;

// =============================================================================
// TYPOGRAPHY SYSTEM (JSPR Design System - Figma)
// =============================================================================

export const typography = {
  // Font families - Based on Figma design system
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

  // Font sizes with line heights
  fontSize: {
    xs: ['12px', { lineHeight: '16px', letterSpacing: '0.05em' }],
    sm: ['14px', { lineHeight: '20px', letterSpacing: '0.025em' }],
    base: ['16px', { lineHeight: '24px', letterSpacing: '0em' }],
    lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.025em' }],
    xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.025em' }],
    '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.05em' }],
    '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.05em' }],
    '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.1em' }],
    '5xl': ['48px', { lineHeight: '48px', letterSpacing: '-0.1em' }],
    '6xl': ['60px', { lineHeight: '60px', letterSpacing: '-0.15em' }],
    '7xl': ['72px', { lineHeight: '72px', letterSpacing: '-0.15em' }], // For StatCard displays
    '8xl': ['96px', { lineHeight: '96px', letterSpacing: '-0.2em' }],
    '9xl': ['128px', { lineHeight: '128px', letterSpacing: '-0.2em' }],
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

// =============================================================================
// SPACING SYSTEM
// =============================================================================

export const spacing = {
  // Base spacing scale (4px increments)
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
  88: '352px', // Existing custom value
  96: '384px',
} as const;

// =============================================================================
// BORDER RADIUS SYSTEM
// =============================================================================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '6px', // Default
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// =============================================================================
// SHADOW SYSTEM
// =============================================================================

export const boxShadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Custom shadows for specific use cases
  soft: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
  medium: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
  strong: '0 8px 24px 0 rgba(0, 0, 0, 0.15)',

  // Color-specific shadows for focus states
  'primary-focus': '0 0 0 3px rgba(59, 130, 246, 0.1)',
  'secondary-focus': '0 0 0 3px rgba(124, 58, 237, 0.1)',
  'success-focus': '0 0 0 3px rgba(5, 150, 105, 0.1)',
  'warning-focus': '0 0 0 3px rgba(234, 88, 12, 0.1)',
  'danger-focus': '0 0 0 3px rgba(220, 38, 38, 0.1)',
} as const;

// =============================================================================
// ANIMATION & TRANSITION SYSTEM
// =============================================================================

export const animation = {
  // Duration
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Timing functions
  timingFunction: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transitions
  transition: {
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors:
      'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

export const components = {
  // Button tokens (JSPR Design System)
  button: {
    height: {
      sm: '32px',
      md: '36px',
      lg: '40px',
      regular: '36px', // Figma regular size (p=8, approximately 36px height)
    },
    padding: {
      sm: '6px 12px',
      md: '8px 16px',
      lg: '12px 20px',
      regular: '8px 8px', // p=8 from Figma specifications
    },
    borderRadius: borderRadius.md, // 6px - matches Figma rounded corners
    fontWeight: typography.fontWeight.medium, // 500 - Figma font weight
    fontFamily: typography.fontFamily.primary, // Montserrat from Figma
  },

  // Input tokens
  input: {
    height: {
      sm: '32px',
      md: '36px',
      lg: '40px',
    },
    padding: {
      sm: '6px 8px',
      md: '8px 12px',
      lg: '10px 16px',
    },
    borderRadius: borderRadius.md,
    borderWidth: '1px',
  },

  // Card tokens
  card: {
    padding: {
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
    },
    borderRadius: borderRadius.lg,
    shadow: boxShadow.md,
  },

  // Modal tokens
  modal: {
    borderRadius: borderRadius.xl,
    shadow: boxShadow.xl,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

// =============================================================================
// SEMANTIC TOKEN MAPPINGS
// =============================================================================

export const semantic = {
  // Text colors - Based on Figma design system
  text: {
    primary: colors.neutral[800],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    disabled: colors.neutral[500], // #737373 from Figma disabled states
    inverse: colors.neutral[0], // White text

    // State colors - Figma button text colors
    success: colors.success[700],
    warning: colors.warning[700],
    danger: colors.danger[700],
    info: colors.primary[700],
  },

  // Background colors - Based on Figma design system
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    tertiary: colors.neutral[200],
    elevated: colors.neutral[0], // Pure white - Figma background
    disabled: colors.neutral[50], // #fafafa from Figma disabled states

    // State backgrounds - Figma button backgrounds
    success: colors.success[50],
    warning: colors.warning[50],
    danger: colors.danger[50],
    info: colors.primary[50],
  },

  // Border colors
  border: {
    primary: colors.neutral[200],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],

    // State borders
    success: colors.success[300],
    warning: colors.warning[300],
    danger: colors.danger[300],
    info: colors.primary[300],
  },

  // RBI-specific semantic tokens
  rbi: {
    // Sectoral group colors
    laborForce: colors.success[600],
    unemployed: colors.warning[600],
    seniorCitizen: colors.secondary[600],
    youth: colors.primary[600],
    pwd: colors.warning[700],
    ofw: colors.primary[700],
    indigenous: colors.rbi.govGold,
    migrant: colors.secondary[500],

    // Household type colors
    nuclear: colors.primary[500],
    singleParent: colors.secondary[500],
    extended: colors.success[500],
    childless: colors.neutral[500],
    grandparents: colors.secondary[600],
    stepfamily: colors.primary[600],

    // Status colors
    active: colors.success[500],
    inactive: colors.neutral[400],
    pending: colors.warning[500],
    verified: colors.success[600],
    unverified: colors.warning[600],
  },
} as const;

// =============================================================================
// BREAKPOINTS (Responsive Design)
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
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
} as const;

// =============================================================================
// FIGMA DESIGN SYSTEM MAPPINGS
// =============================================================================

// Direct mappings from Figma design system for easy reference
export const figmaColors = {
  // Exact Figma color values for Button component
  button: {
    primary: {
      background: '#2563eb',
      hover: '#3b82f6',
      text: '#ffffff',
      disabled: {
        background: '#fafafa',
        text: '#737373',
      },
    },
    secondary: {
      background: '#7c3aed',
      hover: '#8b5cf6',
      text: '#ffffff',
    },
    success: {
      background: '#059669',
      hover: '#10b981',
      text: '#ffffff',
    },
    warning: {
      background: '#ea580c',
      hover: '#f97316',
      text: '#ffffff',
    },
    danger: {
      background: '#dc2626',
      hover: '#ef4444',
      text: '#ffffff',
    },
    neutral: {
      background: '#d4d4d4',
      hover: '#e5e5e5',
      text: '#404040',
    },
    ghost: {
      background: 'transparent',
      hover: '#e5e5e5',
      text: '#404040',
    },
  },
  // Figma typography
  typography: {
    fontFamily: 'Montserrat',
    fontWeight: {
      medium: '500',
    },
    fontSize: {
      base: '16px',
    },
    lineHeight: {
      base: '20px',
    },
  },
  // Figma spacing
  spacing: {
    buttonPadding: '8px', // p=8 from Figma
    borderRadius: '6px', // Default rounded corners
  },
} as const;

// Export all tokens as a single object for easy access
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animation,
  components,
  semantic,
  breakpoints,
  zIndex,
  figmaColors,
} as const;

export default designTokens;
