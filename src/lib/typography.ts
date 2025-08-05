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

// Typography class utilities
export const typography = {
  // System font classes (preferred approach)
  system: 'font-system',
  display: 'font-display',
  body: 'font-body',
  mono: 'font-mono',

  // Heading classes
  h1: 'font-display text-4xl font-bold tracking-tight',
  h2: 'font-display text-3xl font-semibold tracking-tight',
  h3: 'font-display text-2xl font-semibold tracking-tight',
  h4: 'font-display text-xl font-medium tracking-tight',
  h5: 'font-display text-lg font-medium',
  h6: 'font-display text-base font-medium',

  // Body text classes
  bodyLarge: 'font-body text-lg',
  bodyMedium: 'font-body text-base',
  bodySmall: 'font-body text-sm',
  caption: 'font-body text-xs',

  // UI element classes
  button: 'font-system font-medium',
  input: 'font-system',
  label: 'font-system font-medium',

  // Special purpose
  code: 'font-mono text-sm',
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
