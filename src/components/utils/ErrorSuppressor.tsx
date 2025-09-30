'use client';

import { useEffect } from 'react';

/**
 * Component to suppress specific Next.js internal warnings that cannot be fixed in user code
 * This targets the specific "OuterLayoutRouter key prop" warning from Next.js 15.5.0
 */
export function ErrorSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Additional suppression at the component level
      // This runs after the initial import-time suppression

      console.log('🔧 ErrorSuppressor: Additional Next.js warning filters active');

      // Store original console methods
      const originalError = console.error;
      const originalWarn = console.warn;
      
      // Store original error method globally for debugging
      (window as any).__originalConsoleError__ = originalError;

      // Create separate suppression functions for error and warn
      const suppressKeyError = (...args: any[]) => {
        const message = args[0];

        // ONLY suppress if it's specifically about OuterLayoutRouter
        if (
          typeof message === 'string' &&
          message.includes('Each child in a list should have a unique "key" prop') &&
          message.includes('OuterLayoutRouter')
        ) {
          // This is the specific Next.js 15.5.0 internal warning - suppress it
          return;
        }

        // Allow ALL other errors through
        return originalError(...args);
      };

      const suppressKeyWarn = (...args: any[]) => {
        const message = args[0];

        // ONLY suppress if it's specifically about OuterLayoutRouter (unlikely for warnings)
        if (
          typeof message === 'string' &&
          message.includes('Each child in a list should have a unique "key" prop') &&
          message.includes('OuterLayoutRouter')
        ) {
          // This is the specific Next.js 15.5.0 internal warning - suppress it
          return;
        }

        // Allow ALL other warnings through (including performance warnings)
        return originalWarn(...args);
      };

      // Override console methods with correct handlers
      console.error = suppressKeyError;
      console.warn = suppressKeyWarn;

      // Also patch the global error handler if it exists
      if (typeof window !== 'undefined') {
        const originalOnError = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
          if (
            typeof message === 'string' &&
            message.includes('Each child in a list should have a unique "key" prop') &&
            message.includes('OuterLayoutRouter')
          ) {
            return true; // Suppress the error
          }

          if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
          }
          return false;
        };

        // Try to patch React's internal warning system
        const intervalId = setInterval(() => {
          // Look for React's internal warning functions in the global scope
          if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook.onCommitFiberRoot) {
              // Already handled above
              clearInterval(intervalId);
            }
          }
        }, 100);

        // Clear the interval after 5 seconds to avoid memory leaks
        setTimeout(() => clearInterval(intervalId), 5000);
      }

      // Cleanup function
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
        if (typeof window !== 'undefined' && window.onerror) {
          // Reset to original error handler if we set one
          window.onerror = null;
        }
      };
    }
  }, []);

  // Render nothing
  return null;
}
