/**
 * @deprecated This file is deprecated. Use consolidated validation types from @/types/validation
 * All validation types have been moved to the centralized type system.
 */

// Re-export from consolidated types for backward compatibility
export type {
  ValidationResult,
  FieldValidationResult,
  ValidationError,
  ValidationContext,
  FieldValidator,
  FormValidator,
  SanitizationOptions,
  ValidationRule,
  SchemaValidationConfig,
  AsyncValidator,
  ValidationStage,
  CompositeValidationResult,
  ZodValidationResult,
  BaseValidationConfig,
  ValidateFormFunction,
  ValidateFieldFunction
} from '../../types/validation';
