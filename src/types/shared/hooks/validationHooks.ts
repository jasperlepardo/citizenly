/**
 * @deprecated This file has been consolidated into @/types/consolidated/validation.
 * Use the consolidated types instead for better maintainability and to avoid duplicates.
 * 
 * This file provides backward compatibility exports during the migration period.
 * It will be removed in a future version.
 * 
 * ARCHITECTURAL NOTE: Type definitions should be consolidated to avoid duplication.
 */

// Re-export validation hook types from consolidated validation types
export type {
  UseGenericValidationOptions,
  UseGenericValidationReturn,
  UseValidationReturn,
  ValidationHookOptions,
  ValidationResult,
  FieldValidationConfig,
  FieldValidationResult,
  ValidateFormFunction,
  ValidateFieldFunction,
  BaseValidationConfig,
} from '@/types/consolidated/validation';