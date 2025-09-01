'use client';

/**
 * Resident Async Validation Hook
 *
 * @description Handles asynchronous validation operations for resident forms.
 * Extracted from useOptimizedResidentValidation for better maintainability.
 */

import { useState, useCallback, useRef } from 'react';

import { asyncValidationUtils } from '@/utils/validation/utilities';

import { useAsyncErrorBoundary } from './useAsyncErrorBoundary';
import type { 
  AsyncValidationOptions,
  UseResidentAsyncValidationReturn,
  HookAsyncValidationResult as AsyncValidationResult,
} from '@/types';

/**
 * Fields that support async validation
 */
const ASYNC_VALIDATION_FIELDS = [
  'email',
  'mobileNumber',
  'philsysCardNumber',
  'householdCode',
] as const;

/**
 * Hook for resident async validation
 *
 * @description Provides asynchronous validation for fields that require server-side checks.
 */
export function useResidentAsyncValidation(
  options: AsyncValidationOptions = {}
): UseResidentAsyncValidationReturn {
  const { debounceDelay = 1000, enabled = true } = options;

  const [isAsyncValidating, setIsAsyncValidating] = useState(false);
  const [asyncValidationErrors, setAsyncValidationErrors] = useState<Record<string, string>>({});
  const asyncValidationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Error boundary for async validation operations
  const { wrapAsync } = useAsyncErrorBoundary({
    onError: (error, errorInfo) => {
      // Log validation errors for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Async Validation Error:', errorInfo, error);
      }
    },
    enableRecovery: false, // Don't auto-retry validation
    maxRetries: 0,
  });

  /**
   * Validate field asynchronously
   */
  const validateFieldAsync = useCallback(
    async (fieldName: string, value: unknown): Promise<AsyncValidationResult> => {
      if (
        !enabled ||
        !ASYNC_VALIDATION_FIELDS.includes(fieldName as (typeof ASYNC_VALIDATION_FIELDS)[number])
      ) {
        return { isValid: true };
      }

      // Clear existing timeout for this field
      const existingTimeout = asyncValidationTimeouts.current.get(fieldName);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      return new Promise(resolve => {
        const timeout = setTimeout(async () => {
          setIsAsyncValidating(true);

          try {
            let result: AsyncValidationResult = { isValid: true };

            // Wrap validation calls with error boundary
            const validationResult = await wrapAsync(async () => {
              switch (fieldName) {
                case 'email':
                  return await validateEmailUniqueness(value as string);
                case 'mobileNumber':
                  return await validateMobileNumberUniqueness(value as string);
                case 'philsysCardNumber':
                  return await validatePhilsysCardUniqueness(value as string);
                case 'householdCode':
                  return await validateHouseholdCodeExists(value as string);
                default:
                  return { isValid: true };
              }
            }, `async validation for ${fieldName}`)();

            result = validationResult || { isValid: false, error: 'Validation failed' };

            // Update async validation errors
            setAsyncValidationErrors(prev => {
              const newErrors = { ...prev };
              if (result.isValid) {
                delete newErrors[fieldName];
              } else if (result.error) {
                newErrors[fieldName] = result.error;
              }
              return newErrors;
            });

            resolve(result);
          } catch (error) {
            const errorResult = {
              isValid: false,
              error: 'Validation failed. Please try again.',
            };

            setAsyncValidationErrors(prev => ({
              ...prev,
              [fieldName]: errorResult.error!,
            }));

            resolve(errorResult);
          } finally {
            setIsAsyncValidating(false);
            asyncValidationTimeouts.current.delete(fieldName);
          }
        }, debounceDelay);

        asyncValidationTimeouts.current.set(fieldName, timeout);
      });
    },
    [enabled, debounceDelay]
  );

  /**
   * Clear all async validation errors
   */
  const clearAsyncValidationErrors = useCallback(() => {
    setAsyncValidationErrors({});
  }, []);

  /**
   * Clear async validation error for specific field
   */
  const clearAsyncValidationError = useCallback((fieldName: string) => {
    setAsyncValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    validateFieldAsync,
    isAsyncValidating,
    asyncValidationErrors,
    clearAsyncValidationErrors,
    clearAsyncValidationError,
  };
}

/**
 * Validate email uniqueness
 */
async function validateEmailUniqueness(email: string): Promise<AsyncValidationResult> {
  if (!email || !email.includes('@')) {
    return { isValid: true }; // Let synchronous validation handle format
  }

  try {
    const response = await fetch(
      `/api/residents/validate-email?email=${encodeURIComponent(email)}`
    );
    const data = await response.json();

    return {
      isValid: data.isUnique,
      error: data.isUnique ? undefined : 'Email address is already registered',
    };
  } catch {
    return {
      isValid: false,
      error: 'Unable to validate email. Please try again.',
    };
  }
}

/**
 * Validate mobile number uniqueness
 */
async function validateMobileNumberUniqueness(
  mobileNumber: string
): Promise<AsyncValidationResult> {
  if (!mobileNumber || mobileNumber.length < 10) {
    return { isValid: true }; // Let synchronous validation handle format
  }

  try {
    const response = await fetch(
      `/api/residents/validate-mobile?mobile=${encodeURIComponent(mobileNumber)}`
    );
    const data = await response.json();

    return {
      isValid: data.isUnique,
      error: data.isUnique ? undefined : 'Mobile number is already registered',
    };
  } catch {
    return {
      isValid: false,
      error: 'Unable to validate mobile number. Please try again.',
    };
  }
}

/**
 * Validate PhilSys card uniqueness
 */
async function validatePhilsysCardUniqueness(cardNumber: string): Promise<AsyncValidationResult> {
  if (!cardNumber || cardNumber.length < 12) {
    return { isValid: true }; // Let synchronous validation handle format
  }

  try {
    const response = await fetch(
      `/api/residents/validate-philsys?cardNumber=${encodeURIComponent(cardNumber)}`
    );
    const data = await response.json();

    return {
      isValid: data.isUnique,
      error: data.isUnique ? undefined : 'PhilSys card number is already registered',
    };
  } catch {
    return {
      isValid: false,
      error: 'Unable to validate PhilSys card. Please try again.',
    };
  }
}

/**
 * Validate household code exists
 */
async function validateHouseholdCodeExists(householdCode: string): Promise<AsyncValidationResult> {
  if (!householdCode) {
    return { isValid: true }; // Optional field
  }

  try {
    const response = await fetch(
      `/api/households/validate-code?code=${encodeURIComponent(householdCode)}`
    );
    const data = await response.json();

    return {
      isValid: data.exists,
      error: data.exists ? undefined : 'Household code does not exist',
    };
  } catch {
    return {
      isValid: false,
      error: 'Unable to validate household code. Please try again.',
    };
  }
}

// Export for backward compatibility
export default useResidentAsyncValidation;
