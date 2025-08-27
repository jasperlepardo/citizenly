/**
 * Error Boundary React Hook
 * Enhanced error handling and reporting for React components
 */

import { useCallback, useState } from 'react';

import { clientLogger } from '@/lib/logging/client-logger';

import { captureError, addSentryBreadcrumb } from '../sentry-config';
import type { ErrorBoundaryState } from '@/types/errors';
import type { UseErrorBoundaryOptions, ErrorBoundaryReturn } from '@/types/hooks';

// Extended error boundary state for hook usage
interface HookErrorBoundaryState extends ErrorBoundaryState {
  errorInfo?: any;
}



/**
 * Hook for enhanced error handling and reporting
 */
export const useErrorBoundary = (options: UseErrorBoundaryOptions): ErrorBoundaryReturn => {
  const { componentName, onError, enableReporting = true } = options;

  const [errorState, setErrorState] = useState<HookErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    clientLogger.info(`Error boundary reset in ${componentName}`, {
      component: componentName,
      action: 'error_reset',
    });

    addSentryBreadcrumb(`Error boundary reset in ${componentName}`, 'error_boundary', 'info');
  }, [componentName]);

  const handleError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      const errorInfo = {
        component: componentName,
        timestamp: new Date().toISOString(),
        ...context,
      };

      setErrorState({
        hasError: true,
        error,
        errorInfo,
      });

      // Log error locally
      clientLogger.error(`Error in ${componentName}: ${error.message}`, {
        component: componentName,
        action: 'component_error',
        error,
        data: context,
      });

      // Add breadcrumb for debugging
      addSentryBreadcrumb(`Error in ${componentName}: ${error.message}`, 'error_boundary', 'error');

      // Report to monitoring service
      if (enableReporting) {
        captureError(error, {
          component: componentName,
          errorBoundary: true,
          ...context,
        });
      }

      // Call custom error handler
      if (onError) {
        try {
          onError(error, errorInfo);
        } catch (handlerError) {
          clientLogger.error('Error in custom error handler', {
            action: 'custom_error_handler_error',
            data: {
              component: componentName,
              error: handlerError instanceof Error ? handlerError.message : String(handlerError),
              originalError: error.message,
            },
          });
        }
      }
    },
    [componentName, onError, enableReporting]
  );

  // Wrapper for async operations with automatic error handling
  const wrapAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationName: string = 'async_operation'
    ): Promise<T> => {
      try {
        addSentryBreadcrumb(
          `Starting ${operationName} in ${componentName}`,
          'async_operation',
          'info'
        );

        const result = await operation();

        addSentryBreadcrumb(
          `Completed ${operationName} in ${componentName}`,
          'async_operation',
          'info'
        );

        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        handleError(errorObj, {
          operation: operationName,
          type: 'async_error',
        });

        throw errorObj;
      }
    },
    [componentName, handleError]
  );

  return {
    error: errorState.error,
    hasError: errorState.hasError,
    resetError,
    captureError: handleError,
    wrapAsync,
  };
};
