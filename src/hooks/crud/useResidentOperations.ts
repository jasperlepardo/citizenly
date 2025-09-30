'use client';

/**
 * useResidentOperations Hook
 *
 * Custom React hook for resident data operations.
 * Provides a clean interface between UI components and business logic.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useCSRFToken } from '@/lib/authentication/csrf';
// Note: In clean architecture, hooks should call API endpoints, not services directly
import { ResidentFormData } from '@/types/domain/residents/forms';

// Legacy type - minimal stub
type UseResidentOperationsOptions = { onSuccess?: () => void; onError?: (error: string) => void };


/**
 * Custom hook for resident operations
 */
export function useResidentOperations(options: UseResidentOperationsOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { user, session, userProfile, refreshProfile } = useAuth();
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
        // Validate required barangay code - if missing, try refreshing profile first
        if (!barangayCode) {
          console.log('⚠️ Barangay code missing, attempting to refresh profile...');
          await refreshProfile();

          // Check again after refresh
          if (!userProfile?.barangay_code) {
            console.error('🚨 Authentication Error - Missing barangay code after refresh:', {
              user: user?.id ? 'User exists' : 'No user',
              session: session?.access_token ? 'Session exists' : 'No session',
              userProfile: userProfile ? 'Profile exists' : 'No profile',
              barangayCode: userProfile?.barangay_code || 'undefined'
            });
            throw new Error('Authentication required: Please log in to create residents. Missing barangay code from user profile.');
          }
        }

        // Get CSRF token for secure form submission
        const csrfToken = getCSRFToken();

        // Get the auth token from the session
        console.log('🔍 Session object:', session);
        console.log('🔍 Session access_token:', session?.access_token);
        if (!session?.access_token) {
          throw new Error('User session is required to create residents');
        }

        // Call API endpoint to create resident - use the current barangay code (may have been refreshed)
        const currentBarangayCode = userProfile?.barangay_code || barangayCode;
        const requestBody = {
          ...formData,
          barangay_code: currentBarangayCode,
        };
        console.log('🔍 Request body being sent to API:', requestBody);
        console.log('🔍 Key fields check:', {
          first_name: requestBody.first_name,
          last_name: requestBody.last_name,
          birthdate: requestBody.birthdate,
          sex: requestBody.sex,
          household_code: requestBody.household_code,
        });
        
        const response = await fetch('/api/residents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.log('🔍 API Response Error:', result);
          console.log('🔍 Full result object keys:', Object.keys(result));
          console.log('🔍 result.error details:', result.error);
          console.log('🔍 Validation Error Details:', result.error?.details);
          console.log('🔍 Individual validation errors:', result.error?.details?.validationErrors);
          
          // Log each validation error separately
          if (result.error?.details?.validationErrors) {
            result.error.details.validationErrors.forEach((err: any, index: number) => {
              console.log(`🚨 Validation Error ${index + 1}:`, {
                field: err.field,
                message: err.message,
                received: err.received,
                expected: err.expected
              });
            });
          }
          console.log('🔍 result.errors (legacy):', result.errors);
          return {
            success: false,
            error: result.error || 'Failed to create resident',
            data: result.errors ? { validationErrors: result.errors } : null
          };
        }
        
        // Invalidate residents cache to refresh the list
        await queryClient.invalidateQueries({
          queryKey: ['residents'],
        });

        // Success callback
        if (options.onSuccess) {
          options.onSuccess();
        }

        return { success: true, data: result };
      } catch (error) {
        console.error('CreateResident error:', error);
        if (error instanceof Error) {
          console.error('Error details:', { name: error.name, message: error.message, stack: error.stack });
        }
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
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
   * Validate resident data (client-side validation)
   */
  const validateResident = useCallback(async (formData: ResidentFormData) => {
    // For now, return basic validation - this could be enhanced with proper validation logic
    const errors: Record<string, string> = {};
    
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.birthdate) errors.birthdate = 'Birthdate is required';
    if (!formData.sex) errors.sex = 'Sex is required';

    setValidationErrors(errors);
    
    return {
      success: Object.keys(errors).length === 0,
      errors: Object.keys(errors).map(field => ({ field, message: errors[field] }))
    };
  }, []);

  /**
   * Get resident by ID
   */
  const getResident = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/residents/${id}`);
        const result = await response.json();
        
        if (!response.ok) {
          if (options.onError) {
            options.onError(result.error || 'Failed to fetch resident');
          }
          return { success: false, error: result.error || 'Failed to fetch resident' };
        }
        
        return { success: true, data: result.resident };
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
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        const response = await fetch(`/api/residents?${params}`);
        const result = await response.json();
        
        if (!response.ok) {
          if (options.onError) {
            options.onError(result.error || 'Failed to list residents');
          }
          return { success: false, error: result.error || 'Failed to list residents' };
        }
        
        return { success: true, data: result.data, total: result.pagination?.total };
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
