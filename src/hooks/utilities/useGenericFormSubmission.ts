/**
 * Generic Form Submission Hook
 * 
 * @fileoverview A generic, reusable form submission hook that can work with any form type.
 * Provides standardized form submission patterns, loading states, and error handling.
 * 
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

import { useState, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface UseGenericFormSubmissionOptions<T> {
  /** Function to call when form is submitted */
  onSubmit: (data: T) => Promise<void>;
  /** Optional validation function */
  validate?: (data: T) => { isValid: boolean; errors: Record<string, string> };
  /** Called on successful submission */
  onSuccess?: () => void;
  /** Called on submission error */
  onError?: (error: any) => void;
}

export interface UseGenericFormSubmissionReturn<T> {
  /** Whether the form is currently being submitted */
  isSubmitting: boolean;
  /** Form submission handler */
  handleSubmit: (e: React.FormEvent, formData: T) => Promise<void>;
  /** Manual submission function (without event) */
  submit: (formData: T) => Promise<void>;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Generic form submission hook that works with any form data type
 */
export function useGenericFormSubmission<T extends Record<string, any>>(
  options: UseGenericFormSubmissionOptions<T>
): UseGenericFormSubmissionReturn<T> {
  const { onSubmit, validate, onSuccess, onError } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (formData: T) => {
      // Validate if validator provided
      if (validate) {
        const validation = validate(formData);
        if (!validation.isValid) {
          // Let the calling component handle validation errors
          throw new Error('Validation failed');
        }
      }

      setIsSubmitting(true);

      try {
        await onSubmit(formData);
        onSuccess?.();
      } catch (error) {
        console.error('Form submission error:', error);
        onError?.(error);
        throw error; // Re-throw to let calling component handle if needed
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validate, onSuccess, onError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent, formData: T) => {
      e.preventDefault();
      await submit(formData);
    },
    [submit]
  );

  return {
    isSubmitting,
    handleSubmit,
    submit,
  };
}