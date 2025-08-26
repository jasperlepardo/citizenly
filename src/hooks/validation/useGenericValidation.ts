'use client';

/**
 * Generic Validation Hook
 * 
 * @description Refactored generic validation hook using extracted utilities.
 * Provides a clean, reusable interface for form and field validation.
 */

import { useCallback } from 'react';

import {
  ValidationResult,
  FieldValidationResult,
  BaseValidationConfig,
  ValidateFormFunction,
  ValidateFieldFunction,
} from '@/lib/validation/types';
import {
  useValidationState,
  createFormValidationExecutor,
  createFieldValidationExecutor,
} from '@/lib/validation/utilities';

/**
 * Generic validation options
 */
export interface UseGenericValidationOptions<T> extends BaseValidationConfig {
  validateForm: ValidateFormFunction<T>;
  validateField?: ValidateFieldFunction;
}

/**
 * Return type for useGenericValidation hook
 */
export interface UseGenericValidationReturn<T> {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Whether validation has been attempted */
  hasValidated: boolean;
  /** Validate entire form */
  validateForm: (formData: T) => ValidationResult;
  /** Validate single field (if validator provided) */
  validateField?: (fieldName: string, value: any) => FieldValidationResult;
  /** Get error for specific field */
  getFieldError: (field: string) => string | undefined;
  /** Check if field has error */
  hasFieldError: (field: string) => boolean;
  /** Clear error for specific field */
  clearFieldError: (field: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Set errors programmatically */
  setErrors: (errors: Record<string, string>) => void;
  /** Set error for specific field */
  setFieldError: (field: string, error: string) => void;
}

/**
 * Generic validation hook
 * 
 * @description Provides comprehensive validation functionality with clean state management,
 * error handling, and both form-level and field-level validation support.
 */
export function useGenericValidation<T>(
  options: UseGenericValidationOptions<T>
): UseGenericValidationReturn<T> {
  const { validateForm: validateFormFn, validateField: validateFieldFn, ...config } = options;

  // Use validation state management
  const validationState = useValidationState(config);

  // Create form validation executor
  const validateForm = createFormValidationExecutor(
    validateFormFn,
    validationState.setErrors
  );

  // Create field validation executor if field validator provided
  const validateField = validateFieldFn 
    ? createFieldValidationExecutor(
        validateFieldFn,
        validationState.setFieldError,
        validationState.clearFieldError
      )
    : undefined;

  return {
    errors: validationState.errors,
    isValid: validationState.isValid,
    hasValidated: validationState.hasValidated,
    validateForm,
    validateField,
    getFieldError: validationState.getFieldError,
    hasFieldError: validationState.hasFieldError,
    clearFieldError: validationState.clearFieldError,
    clearAllErrors: validationState.clearErrors,
    setErrors: validationState.setErrors,
    setFieldError: validationState.setFieldError,
  };
}