'use client';

/**
 * Generic Validation Hook
 *
 * @description Refactored generic validation hook using extracted utilities.
 * Provides a clean, reusable interface for form and field validation.
 */

import { useCallback, useState } from 'react';

import { ValidationResult, FieldValidationResult } from '@/types/shared/validation/validation';
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

  // Inline validation state management (avoiding missing utilities)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName] || null;
  }, [errors]);

  const hasFieldError = useCallback((fieldName: string) => {
    return Boolean(errors[fieldName]);
  }, [errors]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      setIsValid(Object.keys(newErrors).length === 0);
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
    setHasValidated(false);
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    setIsValid(false);
  }, []);

  const setErrorsHandler = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, []);

  const validationState = {
    errors,
    isValid,
    hasValidated,
    getFieldError,
    hasFieldError,
    clearFieldError,
    clearErrors,
    setFieldError,
    setErrors: setErrorsHandler,
  };

  // Create form validation executor (wrapping sync functions to return Promise)
  const validateForm = async (data: T): Promise<ValidationResult<T>> => {
    setHasValidated(true);
    const result = await Promise.resolve(validateFormFn(data));
    
    // Update validation state based on result
    if (result.errors && result.errors.length > 0) {
      const errorMap: Record<string, string> = {};
      result.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      setIsValid(false);
    } else {
      setErrors({});
      setIsValid(true);
    }
    
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
