'use client';

/**
 * Generic Validation Hook
 *
 * @description Refactored generic validation hook using extracted utilities.
 * Provides a clean, reusable interface for form and field validation.
 */

import { useCallback } from 'react';

import { ValidationResult, FieldValidationResult } from '@/types/shared/validation/validation';
import {
  useValidationState,
  createFormValidationExecutor,
  createFieldValidationExecutor,
} from '@/utils/validation/utilities';
import type { UseGenericValidationOptions, UseGenericValidationReturn } from '@/types/shared/hooks';

// Re-export for backward compatibility
export type { UseGenericValidationReturn };

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

  // Create form validation executor (wrapping sync functions to return Promise)
  const validateForm = async (data: T): Promise<ValidationResult<T>> => {
    const result = await Promise.resolve(validateFormFn(data));
    return result;
  };

  // Create field validation executor if field validator provided
  const validateField = validateFieldFn
    ? async (fieldName: string, value: any, formData?: any): Promise<ValidationResult<any>> => {
        const result = await Promise.resolve(validateFieldFn(fieldName, value, formData));

        // Handle different return types from validateField function
        if (typeof result === 'string') {
          // Field validator returns string error or null
          return {
            isValid: result === null,
            errors: result ? [{ field: fieldName, message: result }] : [],
            data: value,
          };
        } else if (result && typeof result === 'object' && 'isValid' in result) {
          // Field validator returns FieldValidationResult
          return {
            isValid: result.isValid,
            errors: result.error ? [{ field: fieldName, message: result.error }] : [],
            data: result.sanitizedValue || value,
          };
        }

        // Fallback - assume valid
        return {
          isValid: true,
          errors: [],
          data: value,
        };
      }
    : undefined;

  return {
    errors: validationState.errors,
    isValid: validationState.isValid,
    hasValidated: validationState.hasValidated,
    validateForm,
    validateField: validateField || (async () => ({ isValid: true, errors: [], data: undefined })),
    getFieldError: validationState.getFieldError,
    hasFieldError: validationState.hasFieldError,
    clearFieldError: validationState.clearFieldError,
    clearErrors: validationState.clearErrors,
    setError: validationState.setFieldError,
    setErrors: validationState.setErrors,
    setFieldError: validationState.setFieldError,
  };
}
