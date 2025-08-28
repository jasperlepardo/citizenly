'use client';

import { useState, useCallback } from 'react';

import { createFormSubmitHandler } from '@/lib/forms';
import type { ResidentFormData, FormMode } from '@/types';
import type {
  HookFormSubmissionProps as UseFormSubmissionProps,
  HookFormSubmissionReturn as UseFormSubmissionReturn,
} from '@/types/hooks';

import { useResidentFormValidation } from '../validation/useOptimizedResidentValidation';

export function useFormSubmission<T extends ResidentFormData = ResidentFormData>({
  onSubmit,
  mode,
}: UseFormSubmissionProps<T>): UseFormSubmissionReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimisticallyUpdated, setIsOptimisticallyUpdated] = useState(false);
  const { validateForm } = useResidentFormValidation();

  const showOptimisticSuccess = useCallback(() => {
    if (mode === 'edit') {
      setIsOptimisticallyUpdated(true);
      setTimeout(() => {
        setIsOptimisticallyUpdated(false);
      }, 2000);
    }
  }, [mode]);

  const handleSubmit = useCallback(
    async (formData: T) => {
      console.log('useFormSubmission handleSubmit called with:', { mode, hasOnSubmit: !!onSubmit });
      setIsSubmitting(true);

      // Optimistic update - show success immediately for better UX
      if (mode === 'edit') {
        showOptimisticSuccess();
      }

      try {
        // Validate form data
        console.log('Validating form data...');
        const validation = await validateForm(formData as ResidentFormData);
        console.log('Validation result:', validation);

        if (!validation.isValid) {
          console.log('Form validation failed:', validation.errors);
          return {
            success: false,
            errors: validation.errors,
          };
        }

        // Call onSubmit callback with form data
        if (onSubmit) {
          console.log('Calling onSubmit callback...');
          await onSubmit(formData);
          console.log('onSubmit callback completed successfully');
        } else {
          console.log('No onSubmit callback provided');
        }

        return { success: true };
      } catch (error) {
        console.error('Error in form submission:', error);
        // Error handled by setting error state
        // Revert optimistic update on error
        setIsOptimisticallyUpdated(false);

        return {
          success: false,
          errors: { general: 'An unexpected error occurred. Please try again.' },
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, mode, validateForm, showOptimisticSuccess]
  );

  return {
    isSubmitting,
    isOptimisticallyUpdated,
    handleSubmit,
  };
}
