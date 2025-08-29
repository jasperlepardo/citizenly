/**
 * Validation Hooks Module
 *
 * @description Collection of validation hooks for form validation,
 * data validation, and input validation across the application.
 */

// Core validation hooks
// DEPRECATED: useGenericValidation - generic utility not currently used
// export { useGenericValidation } from './useGenericValidation';
export {
  useOptimizedResidentValidation,
  useResidentFormValidation,
} from './useOptimizedResidentValidation';
// DEPRECATED: useOptimizedHouseholdValidation - not currently used
// export {
//   useOptimizedHouseholdValidation,
//   useHouseholdValidation
// } from './useOptimizedHouseholdValidation';

// Specialized resident validation hooks
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
} from '@/lib/validation/createValidationHook';

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
} from '@/lib/validation/createValidationHook';
