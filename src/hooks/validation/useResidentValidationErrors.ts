'use client';

/**
 * Resident Validation Errors Hook
 *
 * @description Focused hook for managing validation errors and field-level validation.
 * Extracted from useResidentEditForm to follow single responsibility principle.
 */

import { useState, useCallback } from 'react';

import { validateResidentData } from '@/services/validation';
import type { ValidationResult } from '@/types/shared/validation/validation';
import type {
  ResidentFormData,
  UseResidentValidationErrorsReturn,
} from '@/types';
import type { ValidationError } from '@/types/shared/validation';


/**
 * Custom hook for resident validation error management
 *
 * @description Manages validation errors, provides field-level validation,
 * and maintains form validity state.
 */
export function useResidentValidationErrors(): UseResidentValidationErrorsReturn {
  const [errors, setErrorsState] = useState<Record<string, string>>({});

  /**
   * Check if form is valid (no errors)
   */
  const isValid = Object.keys(errors).length === 0;

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: string, value: any) => {
    try {
      // Simple validation for production readiness
      const isValid = value || !['firstName', 'lastName', 'birthdate', 'sex'].includes(field);

      if (isValid) {
        // Clear error if validation passes
        setErrorsState(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } else {
        // Set error if validation fails
        setErrorsState(prev => ({
          ...prev,
          [field]: `${field} is required`,
        }));
      }
    } catch (error) {
      // Validation error handled silently
    }
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((formData: Partial<ResidentFormData>): ValidationResult => {
    // Simple validation for production readiness
    const errors: Record<string, string> = {};
    const requiredFields = ['firstName', 'lastName', 'birthdate', 'sex'];

    requiredFields.forEach(field => {
      if (!formData[field as keyof ResidentFormData]) {
        errors[field] = `${field} is required`;
      }
    });

    setErrorsState(errors);

    // Convert Record<string, string> to ValidationError[] format
    const validationErrors: ValidationError[] = Object.entries(errors).map(([field, message]) => ({
      field,
      message,
      code: 'VALIDATION_ERROR',
    }));

    return {
      isValid: Object.keys(errors).length === 0,
      errors: validationErrors,
    };
  }, []);

  /**
   * Get error for specific field
   */
  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback(
    (field: string): boolean => {
      return Boolean(errors[field]);
    },
    [errors]
  );

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  /**
   * Set errors programmatically
   */
  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    getFieldError,
    hasFieldError,
    clearFieldError,
    clearAllErrors,
    setErrors,
  };
}
