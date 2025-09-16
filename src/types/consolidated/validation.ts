/**
 * Consolidated Validation Types
 * 
 * @description Single source of truth for all validation-related types.
 * Consolidates definitions from multiple files to eliminate duplication:
 * - src/types/shared/validation/validation.ts
 * - src/types/shared/hooks/validationHooks.ts
 * - Various other type files with ValidationResult definitions
 * 
 * This file reduces ~15 duplicate type definitions to a single consolidated set.
 */

// =============================================================================
// CORE VALIDATION TYPES
// =============================================================================

/**
 * Standard validation error interface
 * Consolidates ValidationError from multiple files
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
  severity?: 'error' | 'warning' | 'info';
  timestamp?: Date;
  context?: Record<string, unknown>;
}

/**
 * Primary validation result interface
 * Generic validation result for any data type
 */
export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
  warnings?: string[];
  success?: boolean; // Backward compatibility alias for isValid
}

/**
 * Simple validation result (for backward compatibility)
 * Uses Record<string, string> format for errors instead of ValidationError[]
 */
export interface SimpleValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Field-level validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  sanitizedValue?: any;
}

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

/**
 * Form validation state
 * Tracks validation for entire forms
 */
export interface FormValidationState {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  fieldStates: Record<string, ValidationState>;
}

/**
 * Field validation state
 * Used by form components to track field-level validation
 */
export interface ValidationState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error: string | null;
  warnings: string[];
}

/**
 * Form validation error
 * Specific to form submissions
 */
export interface FormValidationError extends ValidationError {
  type?: 'required' | 'format' | 'length' | 'custom';
}

// =============================================================================
// VALIDATION RULES AND CONFIGURATION
// =============================================================================

/**
 * Validation rule interface
 */
export interface ValidationRule<T = any> {
  name: string;
  message: string;
  validator: (value: T, formData?: Record<string, any>) => boolean;
  required?: boolean;
  severity?: 'error' | 'warning';
  condition?: (value: any, context?: ValidationContext) => boolean;
}

/**
 * Field validation configuration
 */
export interface FieldValidationConfig {
  required?: boolean;
  rules?: ValidationRule[];
  asyncValidation?: boolean;
  debounce?: ValidationDebounceOptions;
  crossField?: string[];
}

/**
 * Validation context for contextual validation
 */
export interface ValidationContext {
  mode: 'create' | 'update' | 'view';
  userId?: string;
  userRole?: string;
  requestPath?: string;
  ipAddress?: string;
  timestamp: string;
}

// =============================================================================
// ASYNC VALIDATION TYPES
// =============================================================================

/**
 * Async validation result
 */
export interface AsyncValidationResult<T = any> extends ValidationResult<T> {
  isPending: boolean;
  lastValidated?: Date;
}

/**
 * Validation debounce options
 */
export interface ValidationDebounceOptions {
  delay: number;
  maxDelay?: number;
  immediate?: boolean;
}

// =============================================================================
// FUNCTION TYPES
// =============================================================================

/**
 * Generic validation function signature
 */
export type ValidationFunction<T = any> = (
  value: T,
  context?: Record<string, any>
) => ValidationResult<T> | Promise<ValidationResult<T>>;

/**
 * Field validator function type
 */
export type FieldValidator<T = any> = (
  value: T,
  fieldName: string,
  formData: Record<string, any>
) => string | null | Promise<string | null>;

/**
 * Form validator function type
 */
export type FormValidator<T = any> = (
  data: T,
  context?: ValidationContext
) => ValidationResult | Promise<ValidationResult>;

/**
 * Async validator function type
 */
export type AsyncValidator<T = any> = (
  value: T,
  context?: ValidationContext
) => Promise<FieldValidationResult>;

// =============================================================================
// HOOK-RELATED TYPES
// =============================================================================

/**
 * Validation hook options
 */
export interface ValidationHookOptions {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
  customMessages?: Record<string, string>;
}

/**
 * Generic validation hook options
 */
export interface UseGenericValidationOptions<T> extends FieldValidationConfig {
  validateForm: (data: T) => ValidationResult<T> | Promise<ValidationResult<T>>;
  validateField?: (
    fieldName: string,
    value: any,
    formData?: T
  ) => string | null | FieldValidationResult;
}

/**
 * Generic validation hook return type
 */
export interface UseGenericValidationReturn<T> {
  errors: Record<string, string>;
  isValid: boolean;
  hasValidated: boolean;
  validateForm: (data: T) => Promise<ValidationResult<T>>;
  validateField: (fieldName: string, value: any) => Promise<ValidationResult>;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setError: (fieldName: string, error: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasFieldError: (fieldName: string) => boolean;
}

/**
 * Return type for validation hooks
 */
export interface UseValidationReturn<T> {
  validation: ValidationResult<T>;
  validate: (data: unknown) => ValidationResult<T>;
  validateAsync: (data: unknown) => Promise<ValidationResult<T>>;
  clearErrors: () => void;
  isValidating: boolean;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
}

// =============================================================================
// SCHEMA VALIDATION TYPES
// =============================================================================

/**
 * Schema validation options
 */
export interface SchemaValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

/**
 * Schema validation configuration
 */
export interface SchemaValidationConfig {
  strict?: boolean;
  allowUnknownFields?: boolean;
  stripUnknownFields?: boolean;
  validateAsync?: boolean;
  context?: ValidationContext;
}

/**
 * Zod-based validation result
 */
export interface ZodValidationResult<T = any> {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string>;
  data?: T;
  success?: boolean;
  rawError?: any;
}

// =============================================================================
// PROGRESS AND CROSS-FIELD TYPES
// =============================================================================

/**
 * Validation progress state
 */
export interface ValidationProgressState {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  stepValidation: Record<number, boolean>;
  overallValid: boolean;
}

/**
 * Cross-field validation context
 */
export interface CrossFieldValidationContext {
  field: string;
  relatedFields: string[];
  formData: Record<string, any>;
  rules: ValidationRule[];
}

// =============================================================================
// SANITIZATION TYPES
// =============================================================================

/**
 * Sanitization options
 */
export interface SanitizationOptions {
  stripHtml?: boolean;
  trimWhitespace?: boolean;
  maxLength?: number;
  allowedChars?: RegExp;
  escapeHtml?: boolean;
  normalizeUnicode?: boolean;
}

// =============================================================================
// COMPOSITE AND PIPELINE TYPES
// =============================================================================

/**
 * Validation pipeline stage
 */
export interface ValidationStage {
  name: string;
  validator: FieldValidator | AsyncValidator;
  order: number;
  required: boolean;
}

/**
 * Composite validation result
 */
export interface CompositeValidationResult<T = any> extends ValidationResult<T> {
  fieldResults: Record<string, FieldValidationResult>;
  stageResults: Record<string, ValidationResult>;
  performance: {
    totalTime: number;
    stageTimings: Record<string, number>;
  };
}

// =============================================================================
// COMPATIBILITY TYPES
// =============================================================================

/**
 * Enhanced validation result with Record format
 * Combines both formats for maximum compatibility
 */
export interface ValidationResultRecord<T = any> extends ValidationResult<T> {
  errorRecord?: Record<string, string>;
}

/**
 * Base validation configuration
 */
export interface BaseValidationConfig {
  onValidationSuccess?: () => void;
  onValidationError?: (errors: Record<string, string>) => void;
  autoValidate?: boolean;
}

/**
 * Validation function types for hooks compatibility
 */
export type ValidateFormFunction<T = any> = (data: T) => ValidationResult<T>;
export type ValidateFieldFunction = (fieldName: string, value: any) => FieldValidationResult;

// =============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY
// =============================================================================

/** @deprecated Use ValidationError instead */
export type FormValidationErrorLegacy = ValidationError;

/** @deprecated Use ValidationResult instead */
export type ValidationResultLegacy<T = any> = ValidationResult<T>;

/** @deprecated Use FieldValidationResult instead */
export type FieldValidationResultLegacy = FieldValidationResult;