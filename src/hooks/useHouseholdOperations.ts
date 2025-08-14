/**
 * useHouseholdOperations Hook
 *
 * Custom React hook for household data operations.
 * Provides a clean interface between UI components and business logic.
 */

import { useState, useCallback } from 'react';
import { householdService, HouseholdFormData } from '@/services/household.service';
import { useCSRFToken } from '@/lib/csrf';
import { useAuth } from '@/contexts/AuthContext';

export interface UseHouseholdOperationsOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for household operations
 */
export function useHouseholdOperations(options: UseHouseholdOperationsOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { getToken: getCSRFToken } = useCSRFToken();

  // TODO: Get these from user context or props
  const userAddress = undefined;
  const barangayCode = undefined;

  /**
   * Create a new household
   */
  const createHousehold = useCallback(
    async (formData: HouseholdFormData) => {
      setIsSubmitting(true);
      setValidationErrors({});

      try {
        // Get CSRF token for secure form submission
        const csrfToken = getCSRFToken();

        // Call service to create household
        const result = await householdService.createHousehold({
          formData,
          userAddress,
          barangayCode,
          csrfToken,
        });

        if (!result.success) {
          // Handle validation errors
          if (result.data?.validationErrors) {
            setValidationErrors(result.data.validationErrors);
          }

          if (options.onError) {
            options.onError(result.error || 'Failed to create household');
          }
          return result;
        }

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
    [userAddress, barangayCode, options]
  );

  /**
   * Validate household data
   */
  const validateHousehold = useCallback((formData: HouseholdFormData) => {
    const result = householdService.validateHousehold(formData);

    if (!result.success && result.errors) {
      setValidationErrors(result.errors);
    } else {
      setValidationErrors({});
    }

    return result;
  }, []);

  /**
   * Generate household code
   */
  const generateHouseholdCode = useCallback(() => {
    return householdService.generateHouseholdCode();
  }, []);

  /**
   * Get household by ID
   */
  const getHousehold = useCallback(
    async (id: string) => {
      try {
        const result = await householdService.getHousehold(id);
        if (!result.success && options.onError) {
          options.onError(result.error || 'Failed to fetch household');
        }
        return result;
      } catch (error) {
        const errorMessage = 'Failed to fetch household';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  /**
   * Get household by code
   */
  const getHouseholdByCode = useCallback(
    async (code: string) => {
      try {
        const result = await householdService.getHouseholdByCode(code);
        if (!result.success && options.onError) {
          options.onError(result.error || 'Failed to fetch household');
        }
        return result;
      } catch (error) {
        const errorMessage = 'Failed to fetch household';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  /**
   * List households with pagination
   */
  const listHouseholds = useCallback(
    async (page = 1, limit = 10) => {
      try {
        const result = await householdService.listHouseholds(page, limit);
        if (!result.success && options.onError) {
          options.onError(result.error || 'Failed to list households');
        }
        return result;
      } catch (error) {
        const errorMessage = 'Failed to list households';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  /**
   * Update household
   */
  const updateHousehold = useCallback(
    async (id: string, updates: Partial<HouseholdFormData>) => {
      setIsSubmitting(true);

      try {
        const result = await householdService.updateHousehold(id, updates);

        if (!result.success) {
          if (options.onError) {
            options.onError(result.error || 'Failed to update household');
          }
          return result;
        }

        if (options.onSuccess) {
          options.onSuccess(result.data);
        }

        return result;
      } catch (error) {
        const errorMessage = 'Failed to update household';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  /**
   * Delete household
   */
  const deleteHousehold = useCallback(
    async (id: string) => {
      setIsSubmitting(true);

      try {
        const result = await householdService.deleteHousehold(id);

        if (!result.success) {
          if (options.onError) {
            options.onError(result.error || 'Failed to delete household');
          }
          return result;
        }

        if (options.onSuccess) {
          options.onSuccess(null);
        }

        return result;
      } catch (error) {
        const errorMessage = 'Failed to delete household';
        if (options.onError) {
          options.onError(errorMessage);
        }
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
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
    createHousehold,
    validateHousehold,
    generateHouseholdCode,
    getHousehold,
    getHouseholdByCode,
    listHouseholds,
    updateHousehold,
    deleteHousehold,
    clearValidationErrors,

    // State
    isSubmitting,
    validationErrors,
  };
}
