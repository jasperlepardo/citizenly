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
import type {
  ValidationResult,
  ValidationHookOptions,
  UseValidationReturn,
  ValidationError
} from '@/types/consolidated/validation';

// Re-export types for use in index
export type { ValidationResult, ValidationHookOptions, UseValidationReturn };

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
      onError: (error: any, errorInfo: any) => {
        logError('Validation error occurred', error, { context: errorInfo });
      },
    });

    const [validation, setValidation] = useState<ValidationResult<T>>({
      isValid: true,
      errors: [],
    });
    const [isValidating, setIsValidating] = useState(false);

    /**
     * Parse Zod errors into ValidationError array format
     */
    const parseZodErrors = useCallback(
      (zodError: ZodError): ValidationError[] => {
        const errors: ValidationError[] = [];

        zodError.issues.forEach((error: z.ZodIssue) => {
          const path = error.path.join('.');
          const field = path || 'root';

          // Use custom message if available
          const message = customMessages[field] || error.message;

          errors.push({
            field,
            message,
            code: error.code,
            value: (error as any).received || (error as any).input,
            severity: 'error',
          });
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
            errors: [],
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
            errors: [],
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
            errors: [{
              field: 'general',
              message: 'An unexpected validation error occurred',
              code: 'UNKNOWN_ERROR',
              severity: 'error',
            }],
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
        errors: [],
      });
    }, []);

    /**
     * Set custom error for a field
     */
    const setFieldError = useCallback((field: string, error: string) => {
      setValidation(prev => ({
        ...prev,
        isValid: false,
        errors: [
          ...prev.errors.filter(e => e.field !== field),
          {
            field,
            message: error,
            code: 'CUSTOM_ERROR',
            severity: 'error' as const,
          }
        ],
      }));
    }, []);

    /**
     * Clear error for a specific field
     */
    const clearFieldError = useCallback((field: string) => {
      setValidation(prev => {
        const newErrors = prev.errors.filter((e: ValidationError) => e.field !== field);

        return {
          ...prev,
          isValid: newErrors.length === 0,
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
  email: z.string().email(),
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
