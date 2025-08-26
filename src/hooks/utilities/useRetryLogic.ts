'use client';

/**
 * Retry Logic Hook
 * 
 * @description Advanced retry logic for failed async operations with
 * exponential backoff, jitter, and customizable retry strategies.
 */

import { useState, useCallback, useRef } from 'react';

import { useLogger } from './useLogger';

/**
 * Retry strategy options
 */
export interface RetryStrategy {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Exponential backoff multiplier */
  backoffMultiplier: number;
  /** Add jitter to prevent thundering herd */
  enableJitter: boolean;
  /** Custom condition to determine if error should be retried */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Retry state interface
 */
export interface RetryState {
  /** Current attempt number (0 = initial attempt) */
  attempt: number;
  /** Whether retry is currently in progress */
  isRetrying: boolean;
  /** Last error encountered */
  lastError: Error | null;
  /** Next retry delay in milliseconds */
  nextDelay: number;
  /** Whether max attempts have been reached */
  maxAttemptsReached: boolean;
}

/**
 * Retry logic hook options
 */
export interface UseRetryLogicOptions extends Partial<RetryStrategy> {
  /** Hook name for logging */
  name?: string;
  /** Called when operation succeeds after retry */
  onSuccess?: (result: any, attempt: number) => void;
  /** Called when operation fails (before retry) */
  onError?: (error: Error, attempt: number) => void;
  /** Called when max attempts reached */
  onMaxAttemptsReached?: (error: Error) => void;
}

/**
 * Return type for retry logic hook
 */
export interface UseRetryLogicReturn {
  /** Current retry state */
  state: RetryState;
  /** Execute operation with retry logic */
  execute: <T>(operation: () => Promise<T>) => Promise<T>;
  /** Reset retry state */
  reset: () => void;
  /** Cancel any pending retry */
  cancel: () => void;
}

/**
 * Default retry strategy
 */
const DEFAULT_STRATEGY: RetryStrategy = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  enableJitter: true,
  shouldRetry: (error: Error) => {
    // Retry on network errors, timeouts, and 5xx status codes
    if (error.name === 'NetworkError') return true;
    if (error.name === 'TimeoutError') return true;
    if (error.message.includes('fetch')) return true;
    
    // Don't retry on authentication errors (4xx)
    if (error.message.includes('401') || error.message.includes('403')) return false;
    if (error.message.includes('400') || error.message.includes('404')) return false;
    
    // Retry on other errors by default
    return true;
  },
};

/**
 * Hook for implementing advanced retry logic
 * 
 * @param options - Retry configuration options
 */
export function useRetryLogic(
  options: UseRetryLogicOptions = {}
): UseRetryLogicReturn {
  
  const {
    name = 'RetryLogic',
    onSuccess,
    onError,
    onMaxAttemptsReached,
    ...strategyOptions
  } = options;

  const strategy: RetryStrategy = { ...DEFAULT_STRATEGY, ...strategyOptions };
  const { info: log, warn, error: logError } = useLogger(name);
  
  const [state, setState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
    nextDelay: strategy.initialDelay,
    maxAttemptsReached: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

  /**
   * Calculate next delay with exponential backoff and jitter
   */
  const calculateDelay = useCallback((attempt: number): number => {
    let delay = strategy.initialDelay * Math.pow(strategy.backoffMultiplier, attempt);
    
    // Apply maximum delay limit
    delay = Math.min(delay, strategy.maxDelay);
    
    // Add jitter to prevent thundering herd effect
    if (strategy.enableJitter) {
      const jitter = delay * 0.1 * Math.random(); // ±10% jitter
      delay = delay + jitter;
    }
    
    return Math.floor(delay);
  }, [strategy]);

  /**
   * Reset retry state
   */
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    cancelledRef.current = false;
    setState({
      attempt: 0,
      isRetrying: false,
      lastError: null,
      nextDelay: strategy.initialDelay,
      maxAttemptsReached: false,
    });
    
    log('Retry state reset');
  }, [strategy.initialDelay, log]);

  /**
   * Cancel any pending retry
   */
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    cancelledRef.current = true;
    setState(prev => ({
      ...prev,
      isRetrying: false,
    }));
    
    log('Retry cancelled');
  }, [log]);

  /**
   * Execute operation with retry logic
   */
  const execute = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    
    // Reset state at the beginning of new execution
    reset();
    
    const attemptOperation = async (attemptNumber: number): Promise<T> => {
      
      if (cancelledRef.current) {
        throw new Error('Operation cancelled');
      }

      setState(prev => ({
        ...prev,
        attempt: attemptNumber,
        isRetrying: attemptNumber > 0,
      }));

      try {
        log(`Attempting operation (attempt ${attemptNumber + 1}/${strategy.maxAttempts + 1})`);
        
        const result = await operation();
        
        // Success!
        setState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: null,
        }));
        
        if (attemptNumber > 0) {
          log(`Operation succeeded after ${attemptNumber + 1} attempts`);
        }
        
        onSuccess?.(result, attemptNumber);
        return result;
        
      } catch (error) {
        const err = error as Error;
        
        setState(prev => ({
          ...prev,
          lastError: err,
          nextDelay: calculateDelay(attemptNumber),
        }));

        logError(`Attempt ${attemptNumber + 1} failed:`, err);
        onError?.(err, attemptNumber);

        // Check if we should retry
        const shouldRetry = strategy.shouldRetry?.(err, attemptNumber) ?? true;
        const hasAttemptsLeft = attemptNumber < strategy.maxAttempts;
        
        if (!shouldRetry || !hasAttemptsLeft) {
          setState(prev => ({
            ...prev,
            isRetrying: false,
            maxAttemptsReached: !hasAttemptsLeft,
          }));
          
          if (!hasAttemptsLeft) {
            warn(`Max attempts (${strategy.maxAttempts + 1}) reached`);
            onMaxAttemptsReached?.(err);
          } else {
            warn('Operation failed and will not be retried', { error: err.message });
          }
          
          throw err;
        }

        // Schedule retry
        const delay = calculateDelay(attemptNumber);
        log(`Retrying in ${delay}ms (attempt ${attemptNumber + 2}/${strategy.maxAttempts + 1})`);
        
        return new Promise<T>((resolve, reject) => {
          timeoutRef.current = setTimeout(async () => {
            if (cancelledRef.current) {
              reject(new Error('Operation cancelled'));
              return;
            }
            
            try {
              const result = await attemptOperation(attemptNumber + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
    };

    return attemptOperation(0);
  }, [
    strategy,
    calculateDelay,
    reset,
    log,
    logError,
    warn,
    onSuccess,
    onError,
    onMaxAttemptsReached,
  ]);

  return {
    state,
    execute,
    reset,
    cancel,
  };
}

/**
 * Predefined retry strategies for common use cases
 */
export const RetryStrategies = {
  
  /** Quick retry for fast operations */
  quick: {
    maxAttempts: 2,
    initialDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 2,
    enableJitter: true,
  } as Partial<RetryStrategy>,
  
  /** Standard retry for API calls */
  standard: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    enableJitter: true,
  } as Partial<RetryStrategy>,
  
  /** Aggressive retry for critical operations */
  aggressive: {
    maxAttempts: 5,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 1.5,
    enableJitter: true,
  } as Partial<RetryStrategy>,
  
  /** Conservative retry for expensive operations */
  conservative: {
    maxAttempts: 2,
    initialDelay: 5000,
    maxDelay: 30000,
    backoffMultiplier: 3,
    enableJitter: false,
  } as Partial<RetryStrategy>,
  
} as const;

/**
 * Higher-order function to wrap async functions with retry logic
 */
export function withRetryLogic<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: UseRetryLogicOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    const { execute } = useRetryLogic(options);
    return execute(() => fn(...args));
  }) as T;
}

// Export for backward compatibility
export default useRetryLogic;