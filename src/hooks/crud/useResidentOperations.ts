'use client';

/**
 * useResidentOperations Hook
 *
 * Custom React hook for resident data operations.
 * Provides a clean interface between UI components and business logic.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { useAuth } from '@/contexts';
import { useCSRFToken } from '@/lib/auth';
import { residentService, ResidentFormData } from '@/services/resident.service';

export interface UseResidentOperationsOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for resident operations
 */
export function useResidentOperations(options: UseResidentOperationsOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { user, userProfile } = useAuth();
  const { getToken: getCSRFToken } = useCSRFToken();
  const queryClient = useQueryClient();

  // Get user information from auth context
  const barangayCode = userProfile?.barangay_code;

  /**
   * Create a new resident
   */
  const createResident = useCallback(
    async (formData: ResidentFormData) => {
      setIsSubmitting(true);
      setValidationErrors({});

      try {
        // Validate required barangay code
        if (!barangayCode) {
          throw new Error('User barangay code is required to create residents');
        }

        // Get CSRF token for secure form submission
        const csrfToken = getCSRFToken();

        // Call service to create resident
        const result = await residentService.createResident({
          formData,
          barangayCode,
          csrfToken,
        });

        if (!result.success) {
          // Handle validation errors
          if (result.data?.validationErrors) {
            const errorMap: Record<string, string> = {};
            result.data.validationErrors.forEach((error: { field: string; message: string }) => {
              errorMap[error.field] = error.message;
            });
            setValidationErrors(errorMap);
          }

          if (options.onError) {
            options.onError(result.error || 'Failed to create resident');
          }
          return result;
        }

        // Invalidate residents cache to refresh the list
        await queryClient.invalidateQueries({
          queryKey: ['residents'],
        });

        // Success callback
        if (options.onSuccess) {
          options.onSuccess(result.data);
        }

        return result;
      } catch (error) {
        const errorMessage = 'An unexpected error occurred. Please try again.';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    [barangayCode, options, queryClient]
  );

  /**
   * Validate resident data
   */
  const validateResident = useCallback(async (formData: ResidentFormData) => {
    const result = await residentService.validateResident(formData);

    if (!result.success && result.errors) {
      const errorMap: Record<string, string> = {};
      result.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setValidationErrors(errorMap);
    } else {
      setValidationErrors({});
    }

    return result;
  }, []);

  /**
   * Get resident by ID
   */
  const getResident = useCallback(
    async (id: string) => {
      try {
        const result = await residentService.getResident(id);
        if (!result.success && options.onError) {
          options.onError(result.error || 'Failed to fetch resident');
        }
        return result;
      } catch (error) {
        const errorMessage = 'Failed to fetch resident';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  /**
   * List residents with pagination
   */
  const listResidents = useCallback(
    async (page = 1, limit = 10) => {
      try {
        const result = await residentService.listResidents(page, limit);
        if (!result.success && options.onError) {
          options.onError(result.error || 'Failed to list residents');
        }
        return result;
      } catch (error) {
        const errorMessage = 'Failed to list residents';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  /**
   * Clear validation errors
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    // Operations
    createResident,
    validateResident,
    getResident,
    listResidents,
    clearValidationErrors,

    // State
    isSubmitting,
    validationErrors,
  };
}
