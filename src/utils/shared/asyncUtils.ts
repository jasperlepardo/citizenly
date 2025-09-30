/**
 * Async Utility Functions
 * Consolidated asynchronous operation utilities
 */

import { ErrorCode, ErrorSeverity } from '@/types/shared/errors/errors';

import { createAppError } from './errorUtils';

/**
 * Debounce function execution
 *
 * @description Delays function execution until after a specified delay has elapsed since the last call.
 * Useful for limiting the rate of function calls, especially for expensive operations like API requests or DOM updates.
 *
 * @template T - The type of the function being debounced
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds to wait before executing
 * @param immediate - If true, execute immediately on the leading edge instead of trailing edge
 * @returns A debounced version of the input function
 *
 * @example
 * ```typescript
 * // Debounce search input
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * // Multiple rapid calls - only last one executes after 300ms
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this executes
 *
 * // Immediate execution example
 * const immediateDebounce = debounce(saveData, 1000, true);
 * immediateDebounce(); // Executes immediately, then ignores calls for 1000ms
 * ```
 *
 * @since 2.0.0
 * @public
 */
export function debounce<TArgs extends readonly unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  delay: number,
  immediate?: boolean
): (...args: TArgs) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: TArgs) {
    const later = () => {
      timeoutId = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeoutId;

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delay);

    if (callNow) func(...args);
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

  throw createAppError(lastError?.message || 'Retry failed after maximum attempts', {
    code: ErrorCode.OPERATION_FAILED,
    cause: lastError,
    severity: ErrorSeverity.MEDIUM,
    context: { maxAttempts, delay },
  });
}
