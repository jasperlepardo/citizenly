'use client';

/**
 * Resident Submission Hook
 *
 * @description Focused hook for handling form submission operations.
 * Extracted from useResidentEditForm to follow single responsibility principle.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import type { ResidentFormData } from '@/types/domain/residents/forms';
import type {
  UseResidentSubmissionOptions,
  UseResidentSubmissionReturn,
} from '@/types/shared/hooks/utilityHooks';
import type { ValidationResult } from '@/types/shared/validation/validation';



/**
 * Custom hook for resident submission
 *
 * @description Handles form submission with proper error handling,
 * loading states, and query cache invalidation.
 */
export function useResidentSubmission(
  options: UseResidentSubmissionOptions = {}
): UseResidentSubmissionReturn {
  const { onSubmit, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  /**
   * Submit form data
   */
  const submitForm = useCallback(
    async (formData: Partial<ResidentFormData>, validationResult: ValidationResult) => {
      if (!validationResult.success) {
        const firstError = validationResult.errors[0];
        setSubmissionError(firstError?.message || 'Form validation failed');
        return;
      }

      if (!onSubmit) {
        // No onSubmit handler provided
        return;
      }

      setIsSubmitting(true);
      setSubmissionError(null);

      try {
        await onSubmit(formData as ResidentFormData);

        // Invalidate relevant queries on successful submission
        await queryClient.invalidateQueries({
          queryKey: ['residents'],
        });

        // Call success callback
        if (onSuccess) {
          onSuccess(formData as ResidentFormData);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred during submission';

        setSubmissionError(errorMessage);

        // Call error callback
        if (onError && error instanceof Error) {
          onError(error);
        }

        // Error handled by setting submission error
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError, queryClient]
  );

  /**
   * Reset submission state
   */
  const resetSubmissionState = useCallback(() => {
    setIsSubmitting(false);
    setSubmissionError(null);
  }, []);

  return {
    isSubmitting,
    submissionError,
    submitForm,
    resetSubmissionState,
  };
}
