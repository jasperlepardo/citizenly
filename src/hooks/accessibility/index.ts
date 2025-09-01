/**
 * Accessibility Hooks
 * Standardized hooks for implementing accessibility patterns in components
 */

export { useFieldAccessibility, useFieldGroupAccessibility } from './useFieldAccessibility';

// Types are now exported from centralized @/types
export type {
  FieldAccessibilityOptions,
  FieldAccessibilityIds,
  FieldAccessibilityProps,
  FieldGroupAccessibilityReturn,
} from '@/types';
