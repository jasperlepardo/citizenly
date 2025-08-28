'use client';

/**
 * Resident Validation Errors Hook
 *
 * @description Focused hook for managing validation errors and field-level validation.
 * Extracted from useResidentEditForm to follow single responsibility principle.
 */

import { useState, useCallback } from 'react';

import { validateResidentData, ValidationResult } from '@/lib/validation';
import type { ResidentFormData as ResidentEditFormData } from '@/types';
import type { ValidationError } from '@/types/validation';

/**
 * Return type for useResidentValidationErrors hook
 */
export interface UseResidentValidationErrorsReturn {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Validate a single field */
  validateField: (field: keyof ResidentEditFormData, value: any) => void;
  /** Validate entire form */
  validateForm: (formData: Partial<ResidentEditFormData>) => ValidationResult;
  /** Get error for specific field */
  getFieldError: (field: keyof ResidentEditFormData) => string | undefined;
  /** Check if field has error */
  hasFieldError: (field: keyof ResidentEditFormData) => boolean;
  /** Clear error for specific field */
  clearFieldError: (field: keyof ResidentEditFormData) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Set errors programmatically */
  setErrors: (errors: Record<string, string>) => void;
}

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
  const validateField = useCallback((field: keyof ResidentEditFormData, value: any) => {
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
  const validateForm = useCallback((formData: Partial<ResidentEditFormData>): ValidationResult => {
    // Simple validation for production readiness
    const errors: Record<string, string> = {};
    const requiredFields = ['firstName', 'lastName', 'birthdate', 'sex'];

    requiredFields.forEach(field => {
      if (!formData[field as keyof ResidentEditFormData]) {
        errors[field] = `${field} is required`;
      }
    });

    setErrorsState(errors);

    // Convert Record<string, string> to ValidationError[] format
    const validationErrors: ValidationError[] = Object.entries(errors).map(([field, message]) => ({
      field,
      message,
      code: 'VALIDATION_ERROR'
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
    (field: keyof ResidentEditFormData): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback(
    (field: keyof ResidentEditFormData): boolean => {
      return Boolean(errors[field]);
    },
    [errors]
  );

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((field: keyof ResidentEditFormData) => {
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
