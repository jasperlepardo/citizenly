/**
 * @deprecated This file has been consolidated into @/types/consolidated/validation.
 * Use the consolidated types instead for better maintainability and to avoid duplicates.
 * 
 * This file provides backward compatibility exports during the migration period.
 * It will be removed in a future version.
 * 
 * ARCHITECTURAL NOTE: Type definitions should be consolidated to avoid duplication.
 */

// Re-export all types from the consolidated validation types
export * from '@/types/consolidated/validation';

// Specific re-exports for commonly used types to maintain exact compatibility
export type {
  ValidationError,
  ValidationResult,
  SimpleValidationResult,
  FieldValidationResult,
  FormValidationState,
  ValidationState,
  FormValidationError,
  ValidationRule,
  FieldValidationConfig,
  ValidationContext,
  AsyncValidationResult,
  ValidationDebounceOptions,
  ValidationFunction,
  FieldValidator,
  FormValidator,
  AsyncValidator,
  ValidationHookOptions,
  UseGenericValidationOptions,
  UseGenericValidationReturn,
  UseValidationReturn,
  SchemaValidationOptions,
  SchemaValidationConfig,
  ZodValidationResult,
  ValidationProgressState,
  CrossFieldValidationContext,
  SanitizationOptions,
  ValidationStage,
  CompositeValidationResult,
  ValidationResultRecord,
  BaseValidationConfig,
  ValidateFormFunction,
  ValidateFieldFunction,
} from '@/types/consolidated/validation';