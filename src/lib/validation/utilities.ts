'use client';

/**
 * Validation Utilities
 * Helper functions for validation operations
 */

import type {
  ValidationResult,
  FieldValidationResult,
  ValidationError,
  SimpleValidationResult,
} from '@/types/validation';
import { debounce } from '@/utils/async-utils';

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if Philippine mobile number is valid
 */
export function isValidPhilippineMobile(mobile: string): boolean {
  if (!mobile || typeof mobile !== 'string') {
    return false;
  }

  const cleaned = mobile.replace(/\D/g, '');
  return /^09\d{9}$/.test(cleaned) || /^639\d{9}$/.test(cleaned);
}

/**
 * Check if PhilSys format is valid
 */
export function isValidPhilSysFormat(philsys: string): boolean {
  if (!philsys || typeof philsys !== 'string') {
    return false;
  }

  return /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(philsys);
}

/**
 * Check if name is valid (contains only allowed characters)
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  return /^[a-zA-Z\s\-'\.]*$/.test(name) && name.trim().length > 0;
}

/**
 * Check if age is valid
 */
export function isValidAge(age: number): boolean {
  return typeof age === 'number' && Number.isInteger(age) && age >= 0 && age <= 150;
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: ValidationError): string {
  const field = error.field.replace(/([A-Z])/g, ' $1').toLowerCase();
  return `${field}: ${error.message}`;
}

/**
 * Create a validation result object
 */
export function createValidationResult(
  isValid: boolean,
  errors: Record<string, string> = {},
  warnings: Record<string, string> = {},
  data?: any
): SimpleValidationResult {
  return {
    isValid,
    errors,
  };
}

/**
 * Create a field validation result object
 */
export function createFieldValidationResult(
  isValid: boolean,
  error?: string,
  warning?: string,
  sanitizedValue?: any
): FieldValidationResult {
  return {
    isValid,
    error,
    warning,
    sanitizedValue,
  };
}

/**
 * Merge multiple validation results
 */
export function mergeValidationResults(
  ...results: SimpleValidationResult[]
): SimpleValidationResult {
  const mergedErrors: Record<string, string> = {};
  let mergedData: any = {};

  for (const result of results) {
    Object.assign(mergedErrors, result.errors);
    if ('data' in result && result.data) {
      mergedData = { ...mergedData, ...result.data };
    }
  }

  return createValidationResult(
    Object.keys(mergedErrors).length === 0,
    mergedErrors,
    {},
    mergedData
  );
}

/**
 * Extract field names from validation errors
 */
export function getErrorFields(validationResult: SimpleValidationResult): string[] {
  return Object.keys(validationResult.errors);
}

/**
 * Check if validation result has specific field error
 */
export function hasFieldError(
  validationResult: SimpleValidationResult,
  fieldName: string
): boolean {
  return fieldName in validationResult.errors;
}

/**
 * Get error message for specific field
 */
export function getFieldError(
  validationResult: SimpleValidationResult,
  fieldName: string
): string | undefined {
  return validationResult.errors[fieldName];
}

/**
 * Check if validation result has warnings
 */
export function hasWarnings(validationResult: SimpleValidationResult): boolean {
  return false; // SimpleValidationResult doesn't support warnings
}

/**
 * Convert validation result to error array
 */
export function validationResultToErrors(
  validationResult: SimpleValidationResult
): ValidationError[] {
  return Object.entries(validationResult.errors).map(([field, message]) => ({
    field,
    message: message,
    code: 'VALIDATION_ERROR',
  }));
}

/**
 * Filter out empty validation errors
 */
export function filterEmptyErrors(errors: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};

  for (const [field, message] of Object.entries(errors)) {
    if (message && message.trim()) {
      filtered[field] = message;
    }
  }

  return filtered;
}

/**
 * Normalize field name for display
 */
export function normalizeFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Create validation summary
 */
export function createValidationSummary(validationResult: SimpleValidationResult): {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  summary: string;
} {
  const errorCount = Object.keys(validationResult.errors).length;
  const warningCount = 0; // SimpleValidationResult doesn't support warnings

  let summary: string;
  if (validationResult.isValid) {
    summary = 'Valid';
  } else {
    summary = `${errorCount} error${errorCount === 1 ? '' : 's'}`;
  }

  return {
    isValid: validationResult.isValid,
    errorCount,
    warningCount,
    summary,
  };
}

/**
 * Debounce validation function (uses centralized debounce utility)
 */
export function debounceValidation<T extends (...args: any[]) => any>(
  validationFn: T,
  delay: number = 300
): T {
  return debounce(validationFn, delay) as T;
}

/**
 * Create validation pipeline
 */
export function createValidationPipeline<T>(
  ...validators: ((data: T) => SimpleValidationResult | Promise<SimpleValidationResult>)[]
): (data: T) => Promise<SimpleValidationResult> {
  return async (data: T) => {
    const results: SimpleValidationResult[] = [];

    for (const validator of validators) {
      try {
        const result = await validator(data);
        results.push(result);

        // Stop on first validation failure if desired
        if (!result.isValid) {
          break;
        }
      } catch (error) {
        results.push(
          createValidationResult(false, {
            _pipeline: 'Validation pipeline error',
          })
        );
        break;
      }
    }

    return mergeValidationResults(...results);
  };
}

/**
 * Validate with timeout
 */
export async function validateWithTimeout<T>(
  validationFn: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    validationFn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), timeoutMs);
    }),
  ]);
}

// React Hook-based validation utilities (moved from validation-utilities.ts)

import { useState, useCallback } from 'react';

/**
 * Validation state interface for React hooks
 */
export interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  hasValidated: boolean;
}

/**
 * Create initial validation state
 */
export function createValidationState(): ValidationState {
  return {
    errors: {},
    isValid: true,
    hasValidated: false,
  };
}

/**
 * Validation state management hook
 */
export function useValidationState(config: any = {}) {
  const [state, setState] = useState<ValidationState>(createValidationState);

  const setErrors = useCallback((errors: Record<string, string>) => {
    const isValid = Object.keys(errors).length === 0;

    setState({
      errors,
      isValid,
      hasValidated: true,
    });
  }, []);

  const clearErrors = useCallback(() => {
    setState(createValidationState());
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
      hasValidated: true,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      const isValid = Object.keys(newErrors).length === 0;

      return {
        errors: newErrors,
        isValid,
        hasValidated: prev.hasValidated,
      };
    });
  }, []);

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return state.errors[field];
    },
    [state.errors]
  );

  const hasFieldError = useCallback(
    (field: string): boolean => {
      return Boolean(state.errors[field]);
    },
    [state.errors]
  );

  return {
    ...state,
    setErrors,
    clearErrors,
    setFieldError,
    clearFieldError,
    getFieldError,
    hasFieldError,
  };
}

/**
 * Create validation executor for forms
 */
export function createFormValidationExecutor<T>(
  validateFn: any,
  setErrors: (errors: Record<string, string>) => void
) {
  return (formData: T): SimpleValidationResult => {
    const result = validateFn(formData);

    const normalizedResult: SimpleValidationResult = {
      isValid: result.isValid || result.success === true,
      errors: result.errors || {},
    };

    setErrors(normalizedResult.errors);

    return normalizedResult;
  };
}

/**
 * Create field validation executor
 */
export function createFieldValidationExecutor(
  validateFn: any,
  setFieldError: (field: string, error: string) => void,
  clearFieldError: (field: string) => void
) {
  return (fieldName: string, value: any): FieldValidationResult => {
    const result = validateFn(fieldName, value);

    if (result.isValid) {
      clearFieldError(fieldName);
    } else if (result.error) {
      setFieldError(fieldName, result.error);
    }

    return result;
  };
}

/**
 * Async validation utilities
 */
export const asyncValidationUtils = {
  /**
   * Create debounced async validator
   */
  createDebouncedAsyncValidator: (
    asyncValidator: (value: any) => Promise<FieldValidationResult>,
    delay = 500
  ) => {
    let timeoutId: NodeJS.Timeout;

    return (fieldName: string, value: any, onResult: (result: FieldValidationResult) => void) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncValidator(value);
          onResult(result);
        } catch (error) {
          onResult({
            isValid: false,
            error: 'Validation failed',
          });
        }
      }, delay);
    };
  },

  /**
   * Create batch async validator
   */
  createBatchAsyncValidator: (
    asyncValidators: Record<string, (value: any) => Promise<FieldValidationResult>>
  ) => {
    return async (data: Record<string, any>): Promise<Record<string, string>> => {
      const validationPromises = Object.entries(asyncValidators).map(async ([field, validator]) => {
        try {
          const result = await validator(data[field]);
          return [field, result.error] as const;
        } catch (error) {
          return [field, 'Validation failed'] as const;
        }
      });

      const results = await Promise.all(validationPromises);
      const errors: Record<string, string> = {};

      results.forEach(([field, error]) => {
        if (error) {
          errors[field] = error;
        }
      });

      return errors;
    };
  },
};
