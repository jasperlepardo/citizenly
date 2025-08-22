/**
 * Async Utility Functions
 * Consolidated asynchronous operation utilities
 */

import { createAppError } from '../error-handling/errorUtils';
import { ErrorCode, ErrorSeverity } from '../error-handling/errorTypes';

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(fn: () => Promise<T>, maxAttempts = 3, delay = 1000): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        await sleep(delay * Math.pow(2, attempt - 1));
      }
    }
  }

  throw createAppError(
    lastError?.message || 'Retry failed after maximum attempts',
    { 
      code: ErrorCode.OPERATION_FAILED,
      cause: lastError,
      severity: ErrorSeverity.MEDIUM,
      context: { maxAttempts, delay }
    }
  );
}