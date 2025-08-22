/**
 * Form Handlers Library
 * 
 * @description Reusable form handling utilities for consistent form behavior
 * across the application. Provides type-safe handlers and validation helpers.
 */

import React from 'react';
import { logError } from '../error-handling/error-utils';

/**
 * Generic field change handler factory
 * Creates a type-safe handler for updating nested object fields
 */
export function createFieldChangeHandler<T extends Record<string, any>>(
  currentValue: T,
  onChange: (value: T) => void
) {
  return (field: keyof T, fieldValue: any) => {
    onChange({
      ...currentValue,
      [field]: fieldValue,
    });
  };
}

/**
 * Generic select change handler factory
 * Creates a handler specifically for select field option changes
 */
export function createSelectChangeHandler<T extends Record<string, any>>(
  currentValue: T,
  onChange: (value: T) => void
) {
  return (field: keyof T) => (option: any) => {
    onChange({
      ...currentValue,
      [field]: option?.value || '',
    });
  };
}

/**
 * Boolean field change handler factory
 * Creates a handler specifically for checkbox/boolean fields
 */
export function createBooleanChangeHandler<T extends Record<string, any>>(
  currentValue: T,
  onChange: (value: T) => void
) {
  return (field: keyof T) => (checked: boolean) => {
    onChange({
      ...currentValue,
      [field]: checked,
    });
  };
}

/**
 * Generic form submit handler factory
 * Creates a standardized form submission handler with error handling
 */
export function createFormSubmitHandler<T>(
  onSubmit: (data: T) => void | Promise<void>,
  formData: T,
  options: {
    validate?: (data: T) => boolean;
    onError?: (error: Error) => void;
    onSuccess?: () => void;
  } = {}
) {
  return async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Run validation if provided
      if (options.validate && !options.validate(formData)) {
        return;
      }
      
      await onSubmit(formData);
      options.onSuccess?.();
    } catch (error) {
      logError(error as Error, { component: 'FormSubmission' });
      options.onError?.(error as Error);
    }
  };
}

/**
 * Field validation helper
 * Provides common validation patterns for form fields
 */
export const fieldValidators = {
  required: (value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },
  
  email: (value: string, fieldName: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },
  
  phone: (value: string, fieldName: string) => {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    if (value && !phoneRegex.test(value.replace(/[^\d+]/g, ''))) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },
  
  minLength: (value: string, minLength: number, fieldName: string) => {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
  },
  
  maxLength: (value: string, maxLength: number, fieldName: string) => {
    if (value && value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters`;
    }
    return null;
  },
};

/**
 * Utility to build error object from validation results
 */
export function buildErrorsFromValidation<T extends Record<string, any>>(
  data: T,
  validationRules: Record<keyof T, Array<(value: any) => string | null>>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  
  for (const [field, rules] of Object.entries(validationRules) as Array<[keyof T, Array<(value: any) => string | null>]>) {
    for (const rule of rules) {
      const error = rule(data[field]);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return errors;
}