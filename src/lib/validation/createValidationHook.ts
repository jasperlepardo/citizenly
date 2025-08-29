'use client';

/**
 * Validation Hook Factory
 *
 * @description Factory function for creating type-safe validation hooks.
 * Provides a consistent pattern for validation across the application.
 */

import { useState, useCallback, useMemo } from 'react';
import { z, ZodSchema, ZodError } from 'zod';

import { useAsyncErrorBoundary } from '@/hooks/utilities/useAsyncErrorBoundary';
import { useLogger } from '@/hooks/utilities/useLogger';
import { ZodValidationResult } from '@/lib/validation/types';

/**
 * Use the centralized ZodValidationResult type
 */
export type ValidationResult<T> = ZodValidationResult<T>;

/**
 * Validation hook options
 */
export interface ValidationHookOptions {
  /** Whether to validate on blur (default: true) */
  validateOnBlur?: boolean;
  /** Whether to validate on change (default: false) */
  validateOnChange?: boolean;
  /** Debounce delay for validation in ms (default: 300) */
  debounceMs?: number;
  /** Custom error messages */
  customMessages?: Record<string, string>;
}

/**
 * Validation hook return type
 */
export interface UseValidationReturn<T> {
  /** Current validation state */
  validation: ValidationResult<T>;
  /** Validate the provided data */
  validate: (data: unknown) => ValidationResult<T>;
  /** Validate the provided data asynchronously */
  validateAsync: (data: unknown) => Promise<ValidationResult<T>>;
  /** Clear validation errors */
  clearErrors: () => void;
  /** Whether validation is currently running */
  isValidating: boolean;
  /** Set custom error for a field */
  setFieldError: (field: string, error: string) => void;
  /** Clear error for a specific field */
  clearFieldError: (field: string) => void;
}

/**
 * Creates a validation hook factory for a specific schema
 *
 * @param schema - Zod schema for validation
 * @param defaultOptions - Default options for the validation hook
 */
export function createValidationHook<T>(
  schema: ZodSchema<T>,
  defaultOptions: ValidationHookOptions = {}
) {
  /**
   * Generated validation hook
   *
   * @param options - Validation options
   */
  return function useValidation(options: ValidationHookOptions = {}): UseValidationReturn<T> {
    const mergedOptions = { ...defaultOptions, ...options };
    const { validateOnBlur = true, validateOnChange = false, customMessages = {} } = mergedOptions;

    const { error: logError } = useLogger('ValidationHook');
    const { wrapAsync } = useAsyncErrorBoundary({
      onError: (error, errorInfo) => {
        logError('Validation error occurred', error, { context: errorInfo });
      },
    });

    const [validation, setValidation] = useState<ValidationResult<T>>({
      isValid: true,
      errors: {},
    });
    const [isValidating, setIsValidating] = useState(false);

    /**
     * Parse Zod errors into field-specific error messages
     */
    const parseZodErrors = useCallback(
      (zodError: ZodError): Record<string, string[]> => {
        const errors: Record<string, string[]> = {};

        zodError.issues.forEach((error: z.ZodIssue) => {
          const path = error.path.join('.');
          const field = path || 'root';

          // Use custom message if available
          const message = customMessages[field] || error.message;

          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(message);
        });

        return errors;
      },
      [customMessages]
    );

    /**
     * Synchronous validation
     */
    const validate = useCallback(
      (data: unknown): ValidationResult<T> => {
        try {
          const result = schema.parse(data);
          const validationResult: ValidationResult<T> = {
            isValid: true,
            errors: {},
            data: result,
          };

          setValidation(validationResult);
          return validationResult;
        } catch (error) {
          if (error instanceof ZodError) {
            const errors = parseZodErrors(error);
            const validationResult: ValidationResult<T> = {
              isValid: false,
              errors,
              rawError: error,
            };

            setValidation(validationResult);
            return validationResult;
          }

          // Re-throw non-Zod errors
          throw error;
        }
      },
      [schema, parseZodErrors]
    );

    /**
     * Asynchronous validation with error boundary
     */
    const validateAsync = useCallback(
      async (data: unknown): Promise<ValidationResult<T>> => {
        setIsValidating(true);

        try {
          const result = await wrapAsync(
            () => Promise.resolve(schema.parse(data)),
            'async validation'
          )();

          const validationResult: ValidationResult<T> = {
            isValid: true,
            errors: {},
            data: result || undefined,
          };

          setValidation(validationResult);
          setIsValidating(false);
          return validationResult;
        } catch (error) {
          setIsValidating(false);

          if (error instanceof ZodError) {
            const errors = parseZodErrors(error);
            const validationResult: ValidationResult<T> = {
              isValid: false,
              errors,
              rawError: error,
            };

            setValidation(validationResult);
            return validationResult;
          }

          // Handle other errors
          const validationResult: ValidationResult<T> = {
            isValid: false,
            errors: { general: ['An unexpected validation error occurred'] },
          };

          setValidation(validationResult);
          return validationResult;
        }
      },
      [schema, parseZodErrors, wrapAsync]
    );

    /**
     * Clear all validation errors
     */
    const clearErrors = useCallback(() => {
      setValidation({
        isValid: true,
        errors: {},
      });
    }, []);

    /**
     * Set custom error for a field
     */
    const setFieldError = useCallback((field: string, error: string) => {
      setValidation(prev => ({
        ...prev,
        isValid: false,
        errors: {
          ...prev.errors,
          [field]: [error],
        },
      }));
    }, []);

    /**
     * Clear error for a specific field
     */
    const clearFieldError = useCallback((field: string) => {
      setValidation(prev => {
        const newErrors = { ...prev.errors };
        delete newErrors[field];

        return {
          ...prev,
          isValid: Object.keys(newErrors).length === 0,
          errors: newErrors,
        };
      });
    }, []);

    return {
      validation,
      validate,
      validateAsync,
      clearErrors,
      isValidating,
      setFieldError,
      clearFieldError,
    };
  };
}

/**
 * Common validation schemas for reuse
 */
export const CommonSchemas = {
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  required: z.string().min(1, 'This field is required'),
  optionalString: z.string().optional(),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonEmptyArray: z.array(z.any()).min(1, 'At least one item is required'),
} as const;

/**
 * Pre-built validation hooks for common use cases
 */
export const useEmailValidation = createValidationHook(CommonSchemas.email);
export const usePhoneValidation = createValidationHook(CommonSchemas.phone);
export const useRequiredValidation = createValidationHook(CommonSchemas.required);

// createValidationHook is already exported as 'export function' above
