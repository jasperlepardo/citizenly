/**
 * Validation Types
 * Standardized type definitions for validation system
 */

/**
 * Primary validation result interface
 * This is the single source of truth for validation results across the application
 */
export interface ValidationResult<T = any> {
  /** Whether the data is valid */
  isValid: boolean;
  /** Validation errors by field name */
  errors: Record<string, string>;
  /** Optional warnings by field name */
  warnings?: Record<string, string>;
  /** Parsed and validated data (if valid) */
  data?: T;
  /** Backward compatibility */
  success?: boolean;
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

/**
 * Validation error details
 */
export interface ValidationError {
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
 * Field validator function type
 */
export type FieldValidator<T = any> = (
  value: T,
  context?: ValidationContext
) => FieldValidationResult | Promise<FieldValidationResult>;

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
 * Validation rule definition
 */
export interface ValidationRule {
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
