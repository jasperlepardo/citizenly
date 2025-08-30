/**
 * Form Utilities - Consolidated Form Handling Functions
 *
 * @fileoverview Production-ready, reusable form handling utilities that eliminate
 * duplicate handleChange patterns across the Citizenly RBI system. Provides
 * type-safe, consistent form interaction patterns for all form components.
 *
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

import React from 'react';

// =============================================================================
// FORM HANDLER TYPES
// =============================================================================

/**
 * Generic form data updater function type
 */
export type FormDataUpdater<T> = (prev: T) => T;

/**
 * Field-value update function type
 */
export type FieldValueUpdater<T> = (field: keyof T, value: any) => void;

/**
 * Error state updater function type
 */
export type ErrorUpdater<T = Record<string, string>> = (errors: Partial<T>) => void;

/**
 * Form validation function type
 */
export type FormValidator<T> = (data: T) => Record<string, string>;

// =============================================================================
// FORM CHANGE HANDLERS
// =============================================================================

/**
 * Creates a field-value change handler for form state management
 * Most common pattern used across form components
 */
export function createFieldChangeHandler<T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  return (field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (setErrors) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };
}

/**
 * Creates a standard event-based change handler
 * Used for direct input element event handling
 */
export function createEventChangeHandler<T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Handle different input types
    let processedValue: any = value;
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Clear field error when user starts typing
    if (setErrors) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
}

/**
 * Creates a checkbox array change handler
 * Used for managing arrays of selected values (e.g., multi-select checkboxes)
 */
export function createCheckboxArrayHandler<T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  return (checked: boolean, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);

      return { ...prev, [field]: newArray };
    });

    // Clear field error when user makes selection
    if (setErrors) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };
}

/**
 * Creates a toggle/switch change handler
 * Used for boolean state management
 */
export function createToggleHandler<T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  return (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));

    // Clear field error when user makes selection
    if (setErrors) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };
}

/**
 * Creates a component field change handler that calls parent onChange
 * Used in form components that pass changes up to parent components
 */
export function createComponentFieldChangeHandler<T extends Record<string, any>>(
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
 * Creates a numeric field change handler with validation
 * Used for number inputs with optional min/max constraints
 */
export function createNumericChangeHandler<T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  options: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  } = {}
) {
  const { min, max, allowDecimals = true, setErrors } = options;

  return (value: string | number) => {
    let numericValue: number | null = null;

    if (typeof value === 'string') {
      if (value.trim() === '') {
        numericValue = null;
      } else {
        const parsed = allowDecimals ? parseFloat(value) : parseInt(value, 10);
        numericValue = isNaN(parsed) ? null : parsed;
      }
    } else {
      numericValue = value;
    }

    // Apply constraints
    if (numericValue !== null) {
      if (min !== undefined && numericValue < min) numericValue = min;
      if (max !== undefined && numericValue > max) numericValue = max;
    }

    setFormData(prev => ({ ...prev, [field]: numericValue }));

    // Clear field error when user starts typing
    if (setErrors) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };
}

// =============================================================================
// FORM SUBMISSION UTILITIES
// =============================================================================

/**
 * Creates a generic form submit handler
 * Used for standardizing form submission patterns across all forms
 */
export function createFormSubmitHandler<T extends Record<string, any>>(
  formData: T,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  validator?: (data: T) => { isValid: boolean; errors: Record<string, string> },
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  return async (
    e: React.FormEvent,
    onSubmit: (data: T) => Promise<void>,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    e.preventDefault();

    // Validate form if validator provided
    if (validator) {
      const validation = validator(formData);
      if (!validation.isValid && setErrors) {
        setErrors(validation.errors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.(error);

      // Set general error if setErrors available
      if (setErrors) {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
}

// =============================================================================
// FORM STATE UTILITIES
// =============================================================================

/**
 * Creates initial form state with error handling
 */
export function createInitialFormState<T>(initialData: T): {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
} {
  return {
    formData: initialData,
    errors: {},
    isSubmitting: false,
  };
}

/**
 * Resets form state to initial values
 */
export function resetFormState<T>(
  initialData: T,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>
) {
  setFormData(initialData);
  setErrors({});
  setIsSubmitting(false);
}

/**
 * Validates form data and updates error state
 */
export function validateAndSetErrors<T>(
  formData: T,
  validator: FormValidator<T>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
): boolean {
  const validationErrors = validator(formData);
  setErrors(validationErrors);
  return Object.keys(validationErrors).length === 0;
}

/**
 * Creates a debounced change handler to reduce frequent updates
 */
export function createDebouncedChangeHandler<T extends Record<string, any>>(
  handler: FieldValueUpdater<T>,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (field: keyof T, value: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      handler(field, value);
    }, delay);
  };
}

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  philippineMobile: /^(09|\+639)\d{9}$/,
  philippineLandline: /^(\(?\d{2,3}\)?[-\s]?)?\d{3}[-\s]?\d{4}$/,
  numeric: /^\d+$/,
  decimal: /^\d*\.?\d+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
} as const;

/**
 * Common validation functions
 */
export const ValidationHelpers = {
  required: (value: any, fieldName: string) =>
    !value || (typeof value === 'string' && !value.trim()) ? `${fieldName} is required` : '',

  minLength: (value: string, min: number, fieldName: string) =>
    value && value.length < min ? `${fieldName} must be at least ${min} characters` : '',

  maxLength: (value: string, max: number, fieldName: string) =>
    value && value.length > max ? `${fieldName} must not exceed ${max} characters` : '',

  pattern: (value: string, pattern: RegExp, fieldName: string, message?: string) =>
    value && !pattern.test(value) ? message || `${fieldName} format is invalid` : '',

  email: (value: string) =>
    value && !ValidationPatterns.email.test(value) ? 'Please enter a valid email address' : '',

  philippineMobile: (value: string) =>
    value && !ValidationPatterns.philippineMobile.test(value.replace(/\s+/g, ''))
      ? 'Please enter a valid Philippine mobile number'
      : '',
} as const;
