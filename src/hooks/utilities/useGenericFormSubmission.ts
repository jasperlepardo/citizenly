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

import type {
  UseGenericFormSubmissionOptions,
  UseGenericFormSubmissionReturn,
} from '@/types/shared/hooks/utilityHooks';

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
