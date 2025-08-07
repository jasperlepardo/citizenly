/**
 * Typography System for RBI System
 * Centralized font management and typography utilities
 */

// Font stack definitions
export const fontStacks = {
  system:
    'var(--font-montserrat, "Montserrat"), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  display:
    'var(--font-montserrat, "Montserrat"), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  body: 'var(--font-montserrat, "Montserrat"), -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  mono: 'ui-monospace, "SFMono-Regular", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
} as const;

// Typography class utilities - Aligned with Figma specifications
export const typography = {
  // System font classes (preferred approach)
  system: 'font-system',
  display: 'font-display',
  body: 'font-body',
  mono: 'font-mono',

  // Heading classes - Figma aligned line heights
  h1: 'font-display text-4xl font-bold leading-[3rem] tracking-tight', // 48px/48px
  h2: 'font-display text-3xl font-semibold leading-[2.5rem] tracking-tight', // 30px/40px
  h3: 'font-display text-2xl font-semibold leading-8 tracking-tight', // 24px/32px
  h4: 'font-display text-xl font-medium leading-7 tracking-tight', // 20px/28px
  h5: 'font-display text-lg font-medium leading-6', // 18px/24px
  h6: 'font-display text-base font-medium leading-5', // 16px/20px

  // Body text classes - Figma aligned (16px/20px standard)
  bodyLarge: 'font-body text-lg leading-6', // 18px/24px
  bodyMedium: 'font-body text-base leading-5', // 16px/20px - Figma standard
  bodySmall: 'font-body text-sm leading-4', // 14px/16px
  caption: 'font-body text-xs leading-[14px]', // 12px/14px

  // UI element classes - Figma standard
  button: 'font-system font-medium text-base leading-5', // 16px/20px as per Figma
  input: 'font-system text-base leading-5', // 16px/20px as per Figma
  label: 'font-system font-medium text-sm leading-4', // 14px/16px

  // Special purpose
  code: 'font-mono text-sm leading-5',
} as const;

// Helper function to combine typography classes - moved to utils.ts
// This is imported from @/lib/utils in components

// Typography component props helper
export type TypographyVariant = keyof typeof typography;

export interface TypographyProps {
  variant?: TypographyVariant;
  className?: string;
}

// Common typography combinations
export const typographyPresets = {
  pageTitle: `${typography.h1} text-neutral-900 mb-6`,
  sectionTitle: `${typography.h2} text-neutral-800 mb-4`,
  cardTitle: `${typography.h3} text-neutral-800 mb-3`,
  fieldLabel: `${typography.label} text-neutral-700 mb-2`,
  helpText: `${typography.bodySmall} text-neutral-500`,
  errorText: `${typography.bodySmall} text-danger-600`,
  successText: `${typography.bodySmall} text-success-600`,
} as const;

export default typography;
