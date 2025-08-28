/**
 * Validation Types - Comprehensive Form Validation Framework
 * 
 * @fileoverview Complete validation type system for the Citizenly RBI application.
 * Provides type-safe validation patterns for forms, API requests, and data processing
 * with support for synchronous, asynchronous, and schema-based validation.
 * 
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 * 
 * @example Basic Field Validation
 * ```typescript
 * import { ValidationResult, FieldValidator } from '@/types/validation';
 * 
 * const validateEmail: FieldValidator<string> = (value) => {
 *   if (!value.includes('@')) return 'Invalid email format';
 *   return null;
 * };
 * ```
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
}

/**
 * Validation result wrapper
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
 * Validation rule interface
 * Defines validation rules for fields
 */
export interface ValidationRule<T = any> {
  name: string;
  message: string;
  validator: (value: T, formData?: Record<string, any>) => boolean;
  required?: boolean;
}

/**
 * Cross-field validation context
 * For validations that depend on multiple fields
 */
export interface CrossFieldValidationContext {
  field: string;
  relatedFields: string[];
  formData: Record<string, any>;
  rules: ValidationRule[];
}

// =============================================================================
// ASYNC VALIDATION TYPES
// =============================================================================

/**
 * Async validation result
 * For validations that require API calls
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
// SCHEMA VALIDATION TYPES
// =============================================================================

/**
 * Schema validation options
 * Configuration for schema-based validation (Zod, Yup, etc.)
 */
export interface SchemaValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

/**
 * Field validation configuration
 * Defines how a field should be validated
 */
export interface FieldValidationConfig {
  required?: boolean;
  rules?: ValidationRule[];
  asyncValidation?: boolean;
  debounce?: ValidationDebounceOptions;
  crossField?: string[];
}

// =============================================================================
// FORM-SPECIFIC VALIDATION TYPES
// =============================================================================

/**
 * Form validation error
 * Specific to form submissions
 */
export interface FormValidationError extends ValidationError {
  field: string;
  message: string;
  type?: 'required' | 'format' | 'length' | 'custom';
}

/**
 * Validation progress state
 * Tracks validation progress in multi-step forms
 */
export interface ValidationProgressState {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  stepValidation: Record<number, boolean>;
  overallValid: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Validation function type
 * Generic validation function signature
 */
export type ValidationFunction<T = any> = (
  value: T,
  context?: Record<string, any>
) => ValidationResult<T> | Promise<ValidationResult<T>>;

/**
 * Field validator type
 * Function type for field-level validators
 */
export type FieldValidator<T = any> = (
  value: T,
  fieldName: string,
  formData: Record<string, any>
) => string | null | Promise<string | null>;

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Enhanced validation error with severity
 */
export interface ValidationErrorWithSeverity extends ValidationError {
  severity: ValidationSeverity;
  timestamp?: Date;
}

// =============================================================================
// EXTENDED VALIDATION TYPES (from lib/validation/types.ts)
// =============================================================================

/**
 * Field-level validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  sanitizedValue?: any;
}

/**
 * Enhanced validation error details
 */
export interface ValidationErrorDetailed {
  field: string;
  message: string;
  code: string;
  value?: any;
  context?: Record<string, unknown>;
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

/**
 * Form validator function type
 */
export type FormValidator<T = any> = (
  data: T,
  context?: ValidationContext
) => ValidationResult | Promise<ValidationResult>;

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

/**
 * Enhanced validation rule definition
 */
export interface ValidationRuleEnhanced {
  name: string;
  validator: FieldValidator;
  message: string;
  severity: 'error' | 'warning';
  condition?: (value: any, context?: ValidationContext) => boolean;
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
 * Async validation function type
 */
export type AsyncValidator<T = any> = (
  value: T,
  context?: ValidationContext
) => Promise<FieldValidationResult>;

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

/**
 * Zod-based validation result (for createValidationHook compatibility)
 */
export interface ZodValidationResult<T = any> {
  /** Whether the data is valid */
  isValid: boolean;
  /** Validation errors as string arrays (Zod format) */
  errors: Record<string, string[]>;
  /** Optional warnings by field name */
  warnings?: Record<string, string>;
  /** Parsed and validated data (if valid) */
  data?: T;
  /** Backward compatibility */
  success?: boolean;
  /** Raw Zod validation error */
  rawError?: any; // ZodError type to avoid Zod dependency here
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

/**
 * Simple validation result (for backward compatibility with utils)
 * Uses Record<string, string> format for errors instead of ValidationError[]
 */
export interface SimpleValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Enhanced validation result with Record format
 * Combines both formats for maximum compatibility
 */
export interface ValidationResultRecord<T = any> extends ValidationResult<T> {
  errorRecord?: Record<string, string>;
}