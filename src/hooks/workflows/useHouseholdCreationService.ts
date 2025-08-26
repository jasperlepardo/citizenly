'use client';

/**
 * Household Creation Service Hook
 * 
 * @description Focused hook for household creation operations with service integration.
 * Extracted from useHouseholdOperations to follow single responsibility principle.
 */

import { useState, useCallback } from 'react';
import { householdService, HouseholdFormData } from '@/services/household.service';
import { HouseholdRecord } from '@/types/households';
import { useCSRFToken } from '@/lib/auth';
import { useAuth } from '@/contexts';

/**
 * Creation operation result
 */
export interface HouseholdCreationResult {
  success: boolean;
  data?: HouseholdRecord;
  error?: string;
  validationErrors?: Record<string, string>;
}

/**
 * Options for household creation
 */
export interface UseHouseholdCreationServiceOptions {
  onSuccess?: (data: HouseholdRecord) => void;
  onError?: (error: string) => void;
  onValidationError?: (errors: Record<string, string>) => void;
}

/**
 * Return type for useHouseholdCreationService hook
 */
export interface UseHouseholdCreationServiceReturn {
  /** Whether creation is in progress */
  isCreating: boolean;
  /** Create household using service */
  createHousehold: (formData: HouseholdFormData) => Promise<HouseholdCreationResult>;
  /** Generate household code */
  generateHouseholdCode: () => string;
  /** Reset creation state */
  resetCreationState: () => void;
}

/**
 * Custom hook for household creation service operations
 * 
 * @description Handles household creation through the household service with
 * proper authentication, CSRF protection, and error handling.
 */
export function useHouseholdCreationService(
  options: UseHouseholdCreationServiceOptions = {}
): UseHouseholdCreationServiceReturn {
  const { onSuccess, onError, onValidationError } = options;
  const { user } = useAuth();
  const { getToken: getCSRFToken } = useCSRFToken();
  const [isCreating, setIsCreating] = useState(false);

  // TODO: Get these from user context or props - keeping original logic
  const userAddress = undefined;
  const barangayCode = undefined;

  /**
   * Create household using service
   */
  const createHousehold = useCallback(async (
    formData: HouseholdFormData
  ): Promise<HouseholdCreationResult> => {
    setIsCreating(true);

    try {
      // Get CSRF token for secure form submission
      const csrfToken = getCSRFToken();

      // Call service to create household
      const result = await householdService.createHousehold({
        formData,
        userAddress,
        barangay_code: barangayCode,
        csrf_token: csrfToken,
      });

      if (!result.success) {
        // Handle validation errors
        if (result.data?.validationErrors) {
          if (onValidationError) {
            onValidationError(result.data.validationErrors);
          }
          return {
            success: false,
            error: result.error,
            validationErrors: result.data.validationErrors,
          };
        }

        // Handle general errors
        if (onError) {
          onError(result.error || 'Failed to create household');
        }
        
        return {
          success: false,
          error: result.error || 'Failed to create household',
        };
      }

      // Success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (onError) {
        onError(errorMessage);
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsCreating(false);
    }
  }, [userAddress, barangayCode, getCSRFToken, onSuccess, onError, onValidationError]);

  /**
   * Generate household code
   */
  const generateHouseholdCode = useCallback((): string => {
    return householdService.generateHouseholdCode();
  }, []);

  /**
   * Reset creation state
   */
  const resetCreationState = useCallback(() => {
    setIsCreating(false);
  }, []);

  return {
    isCreating,
    createHousehold,
    generateHouseholdCode,
    resetCreationState,
  };
}