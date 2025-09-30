/**
 * Validation Hooks Module
 *
 * @description Collection of validation hooks for form validation,
 * data validation, and input validation across the application.
 */

// NEW: Unified validation hook (replaces 6+ validation hooks)
export {
  useUnifiedResidentValidation,
  type UnifiedResidentValidationReturn,
} from './useUnifiedResidentValidation';

// LEGACY: Individual validation hooks (deprecated - use useUnifiedResidentValidation instead)
export {
  useOptimizedResidentValidation,
  useResidentFormValidation,
} from './useOptimizedResidentValidation';
export { useResidentValidationCore } from './useResidentValidationCore';
export { useResidentCrossFieldValidation } from '@/hooks/utilities/useResidentCrossFieldValidation';
export { useResidentAsyncValidation } from '@/hooks/utilities/useResidentAsyncValidation';
export { useResidentValidationProgress } from './useResidentValidationProgress';
export { useResidentValidationErrors } from './useResidentValidationErrors';

// Validation factory and utilities
export {
  createValidationHook,
  useEmailValidation,
  usePhoneValidation,
  useRequiredValidation,
  CommonSchemas,
} from '@/hooks/validation/createValidationHook';

// Advanced validation hooks using validation factory
export {
  useResidentValidation,
  ResidentValidationSections,
  validateResidentData,
} from './useResidentValidation';
export type { ResidentFormData } from './useResidentValidation';

// Export types
export type {
  ValidationResult,
  ValidationHookOptions,
  UseValidationReturn,
} from '@/hooks/validation/createValidationHook';
