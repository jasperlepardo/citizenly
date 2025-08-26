'use client';

/**
 * Async Error Boundary Hook
 * 
 * @description Provides error boundary functionality for async operations in hooks.
 * Captures and handles errors from async operations that would otherwise be unhandled.
 */

import { useCallback, useState } from 'react';

import { useRetryLogic, RetryStrategies } from './useRetryLogic';

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Error boundary options
 */
export interface AsyncErrorBoundaryOptions {
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: string) => void;
  /** Enable automatic error recovery */
  enableRecovery?: boolean;
  /** Recovery timeout in milliseconds */
  recoveryTimeout?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
}

/**
 * Return type for async error boundary hook
 */
export interface UseAsyncErrorBoundaryReturn {
  /** Current error boundary state */
  errorState: ErrorBoundaryState;
  /** Wrap async operation with error boundary */
  wrapAsync: <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ) => () => Promise<T | null>;
  /** Clear error state */
  clearError: () => void;
  /** Retry last failed operation */
  retry: () => Promise<void>;
  /** Check if operation can be retried */
  canRetry: boolean;
  /** Current retry count */
  retryCount: number;
  /** Current error (shorthand for errorState.error) */
  error: Error | null;
  /** Whether currently retrying */
  isRetrying: boolean;
}

/**
 * Hook for async error boundary functionality
 * 
 * @description Provides error boundary capabilities for async operations
 * in hooks. Prevents unhandled promise rejections and provides recovery mechanisms.
 */
export function useAsyncErrorBoundary(
  options: AsyncErrorBoundaryOptions = {}
): UseAsyncErrorBoundaryReturn {
  
  const {
    onError,
    enableRecovery = false,
    recoveryTimeout = 5000,
    maxRetries = 3,
  } = options;

  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastFailedOperation, setLastFailedOperation] = useState<{
    fn: () => Promise<unknown>;
    context: string;
  } | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    setRetryCount(0);
    setIsRetrying(false);
    setLastFailedOperation(null);
  }, []);

  /**
   * Handle error with recovery options
   */
  const handleError = useCallback((error: Error, context: string) => {
    const errorInfo = `Error in ${context}: ${error.message}`;
    
    setErrorState({
      hasError: true,
      error,
      errorInfo,
    });

    // Call onError callback if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (callbackError) {
        console.error('Error in onError callback:', callbackError);
      }
    }

    // Enable automatic recovery if configured
    if (enableRecovery && retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setErrorState(prev => ({
          ...prev,
          hasError: false,
        }));
      }, recoveryTimeout);
    }
  }, [onError, enableRecovery, recoveryTimeout, maxRetries, retryCount]);

  /**
   * Wrap async operation with error boundary
   */
  const wrapAsync = useCallback(<T>(
    asyncFn: () => Promise<T>,
    context: string = 'async operation'
  ): (() => Promise<T | null>) => {
    return () => {
      return new Promise((resolve) => {
        // Store operation for potential retry
        setLastFailedOperation({ fn: asyncFn, context });
        setIsRetrying(true);

        asyncFn()
          .then((result) => {
            // Clear error state on success only if there was an error
            setErrorState(prev => {
              if (prev.hasError) {
                return {
                  hasError: false,
                  error: null,
                  errorInfo: null,
                };
              }
              return prev;
            });
            setRetryCount(0);
            setIsRetrying(false);
            resolve(result);
          })
          .catch((error) => {
            const errorInfo = `Error in ${context}: ${error.message}`;
            const processedError = error instanceof Error ? error : new Error(String(error));
            
            setErrorState({
              hasError: true,
              error: processedError,
              errorInfo,
            });
            setIsRetrying(false);

            // Call onError callback if provided - capture the callback from closure
            const errorCallback = onError;
            if (errorCallback) {
              try {
                errorCallback(processedError, errorInfo);
              } catch (callbackError) {
                console.error('Error in onError callback:', callbackError);
              }
            }
            
            resolve(null);
          });
      });
    };
  }, []);

  /**
   * Retry last failed operation
   */
  const retry = useCallback(async (): Promise<void> => {
    if (!lastFailedOperation || retryCount >= maxRetries) {
      return;
    }

    setRetryCount(prev => prev + 1);
    
    try {
      await lastFailedOperation.fn();
      // Clear error state directly instead of calling clearError
      setErrorState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
      setRetryCount(0);
      setLastFailedOperation(null);
    } catch (error) {
      const processedError = error instanceof Error ? error : new Error(String(error));
      const errorInfo = `Error in ${lastFailedOperation.context}: ${processedError.message}`;
      
      setErrorState({
        hasError: true,
        error: processedError,
        errorInfo,
      });

      // Call onError callback if provided - capture from closure
      const errorCallback = onError;
      if (errorCallback) {
        try {
          errorCallback(processedError, errorInfo);
        } catch (callbackError) {
          console.error('Error in onError callback:', callbackError);
        }
      }
    }
  }, [lastFailedOperation, retryCount, maxRetries, onError]);

  /**
   * Check if operation can be retried
   */
  const canRetry = lastFailedOperation !== null && retryCount < maxRetries;

  return {
    errorState,
    wrapAsync,
    clearError,
    retry,
    canRetry,
    retryCount,
    error: errorState.error,
    isRetrying,
  };
}

// Export for backward compatibility
export default useAsyncErrorBoundary;