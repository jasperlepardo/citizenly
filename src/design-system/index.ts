/**
 * Citizenly Design System - Main Export
 * Comprehensive design system for Philippine government digital services
 *
 * This design system provides:
 * - Complete color palette (Primary, Secondary, Semantic, RBI-specific)
 * - Typography scale with proper line heights and letter spacing
 * - Spacing system based on 4px grid
 * - Shadow system for elevation and focus states
 * - Component tokens for consistent UI elements
 * - Utility functions for design token usage
 * - RBI-specific semantic tokens and utilities
 */

// Export design tokens
export {
  designTokens,
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
} from './tokens';

// Export utility functions
export {
  getColor,
  getRBIColor,
  getColorVariant,
  getSpacing,
  getResponsiveSpacing,
  getFontSize,
  getHeadingStyle,
  getButtonStyles,
  getInputStyles,
  checkContrast,
  getFocusRing,
  validateDesignTokenUsage,
  getSectoralBadgeColor,
  getHouseholdTypeStyle,
} from './utils';

// Re-export default utils
export { default as designSystemUtils } from './utils';

// Design system metadata
export const DESIGN_SYSTEM_VERSION = '1.0.0';
export const DESIGN_SYSTEM_NAME = 'Citizenly RBI Design System';

/**
 * Design System Quick Reference
 *
 * ## Color Usage:
 * ```tsx
 * import { getColor, getRBIColor } from '@/design-system';
 *
 * const primaryColor = getColor('primary.500');        // #3b82f6
 * const successColor = getColor('success.600');        // #059669
 * const sectoralColor = getRBIColor('laborForce');     // #059669
 * ```
 *
 * ## Spacing Usage:
 * ```tsx
 * import { getSpacing, getResponsiveSpacing } from '@/design-system';
 *
 * const spacing = getSpacing('4');                     // 16px
 * const responsive = getResponsiveSpacing('4');        // { base: '16px', sm: '16px', md: '20px', lg: '24px' }
 * ```
 *
 * ## Component Styles:
 * ```tsx
 * import { getButtonStyles, getInputStyles } from '@/design-system';
 *
 * const buttonStyles = getButtonStyles('primary', 'md');
 * const inputStyles = getInputStyles('focus');
 * ```
 *
 * ## Tailwind Classes:
 * The design tokens are automatically available as Tailwind classes:
 * ```tsx
 * <div className="bg-primary-500 text-neutral-50 p-4 rounded-lg shadow-md">
 * <div className="bg-rbi-labor-force text-white p-2 rounded">
 * <div className="focus-ring-primary border-primary-500">
 * ```
 *
 * ## RBI-Specific Usage:
 * ```tsx
 * import { getSectoralBadgeColor, getHouseholdTypeStyle } from '@/design-system';
 *
 * const badgeColor = getSectoralBadgeColor('seniorCitizen', 'solid');
 * const householdStyle = getHouseholdTypeStyle('nuclear');
 * ```
 */

// Type exports for better developer experience
export type {} from // Color types
'./tokens';

// Constants for common use cases
export const COMMON_COLORS = {
  // Philippine flag colors
  FLAG_BLUE: '#0038a8',
  FLAG_RED: '#ce1126',
  FLAG_YELLOW: '#fcd116',

  // Government official colors
  GOV_BLUE: '#1e40af',
  GOV_GOLD: '#f59e0b',

  // Status colors
  SUCCESS: '#059669',
  WARNING: '#ea580c',
  DANGER: '#dc2626',
  INFO: '#3b82f6',

  // Text colors
  TEXT_PRIMARY: '#262626',
  TEXT_SECONDARY: '#525252',
  TEXT_MUTED: '#737373',
} as const;

export const COMMON_SPACING = {
  XS: '4px', // spacing-1
  SM: '8px', // spacing-2
  MD: '16px', // spacing-4
  LG: '24px', // spacing-6
  XL: '32px', // spacing-8
  XXL: '48px', // spacing-12
} as const;

export const COMMON_RADIUS = {
  SM: '4px', // radius-sm
  MD: '6px', // radius-md (default)
  LG: '8px', // radius-lg
  XL: '12px', // radius-xl
  FULL: '9999px', // radius-full
} as const;

/**
 * Design System Best Practices
 *
 * 1. **Always use design tokens** instead of hardcoded values
 * 2. **Use semantic colors** (success, warning, danger) for states
 * 3. **Use RBI-specific colors** for sectoral classifications
 * 4. **Follow the 4px spacing grid** for consistent layout
 * 5. **Use proper contrast ratios** for accessibility (WCAG AA minimum)
 * 6. **Test components** with all color variants and states
 * 7. **Document color usage** in component stories/documentation
 * 8. **Validate designs** using the validation utilities
 */
