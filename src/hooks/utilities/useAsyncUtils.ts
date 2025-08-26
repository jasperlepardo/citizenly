'use client';

/**
 * React Hook for Async Utilities
 *
 * @description React hook wrapper for async utility functions.
 * Provides React-friendly interface to debounce, throttle, and retry utilities.
 */

import { useCallback, useRef, useEffect } from 'react';

import { debounce, throttle, retry } from '@/lib/utilities/async-utils';

/**
 * Hook for using debounced functions
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef<T | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create debounced function
  if (!debouncedRef.current) {
    debouncedRef.current = debounce((...args: unknown[]) => {
      return callbackRef.current(...(args as Parameters<T>));
    }, delay) as T;
  }

  return debouncedRef.current;
}

/**
 * Hook for using throttled functions
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const callbackRef = useRef(callback);
  const throttledRef = useRef<T | null>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Create throttled function
  if (!throttledRef.current) {
    throttledRef.current = throttle((...args: unknown[]) => {
      return callbackRef.current(...(args as Parameters<T>));
    }, limit) as T;
  }

  return throttledRef.current;
}

/**
 * Hook for using retry logic with async operations
 */
export function useRetry() {
  return useCallback(retry, []);
}

/**
 * Combined async utilities hook
 */
export function useAsyncUtils() {
  return {
    debounce: useDebouncedCallback,
    throttle: useThrottledCallback,
    retry: useRetry(),
  };
}

export default useAsyncUtils;
