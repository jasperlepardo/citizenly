'use client';

/**
 * Field Error Handler Hook
 * 
 * @description Hook for functional error boundary behavior.
 * Extracted from FieldErrorBoundary for better maintainability.
 */

import { useCallback } from 'react';
import { logError } from '@/lib/error-handling/errorUtils';

/**
 * Return type for field error handler hook
 */
export interface UseFieldErrorHandlerReturn {
  /** Handle field error */
  handleFieldError: (error: Error, fieldName?: string) => void;
}

/**
 * Hook for functional error boundary behavior
 * For use in parent components to handle field errors
 */
export function useFieldErrorHandler(): UseFieldErrorHandlerReturn {
  const handleFieldError = useCallback((error: Error, fieldName?: string) => {
    // Use centralized error logging
    logError(error, {
      component: fieldName ? `FieldError-${fieldName}` : 'FieldError',
    });
    
    // You can add additional error handling logic here
    // such as form validation state updates, user notifications, etc.
  }, []);

  return { handleFieldError };
}

// Export for backward compatibility
export default useFieldErrorHandler;