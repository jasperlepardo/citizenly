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
} from '@/lib/validation/types';
import {
  useValidationState,
  createFormValidationExecutor,
  createFieldValidationExecutor,
} from '@/lib/validation/utilities';
import type {
  UseGenericValidationOptions,
  UseGenericValidationReturn,
} from '@/types/hooks';

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
  const validateForm = createFormValidationExecutor(validateFormFn, validationState.setErrors);

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
