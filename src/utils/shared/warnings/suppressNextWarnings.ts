/**
 * Suppress Next.js 15.5.0 OuterLayoutRouter key warnings
 * This must be imported and called before React renders anything
 */

let isPatched = false;

export function suppressNextJSWarnings() {
  // Only patch once and only in development
  if (isPatched || process.env.NODE_ENV !== 'development') {
    return;
  }

  isPatched = true;

  // Store original console.error
  const originalConsoleError = console.error;

  // Override console.error to filter specific Next.js warnings
  console.error = (...args: unknown[]) => {
    const message = args[0];

    if (typeof message === 'string') {
      // Suppress the specific OuterLayoutRouter key warning
      if (
        message.includes('Each child in a list should have a unique "key" prop') &&
        (message.includes('OuterLayoutRouter') ||
          message.includes('Check the render method of `OuterLayoutRouter`'))
      ) {
        // This is the Next.js 15.5.0 internal warning - suppress it
        return;
      }
    }

    // Allow all other errors through
    originalConsoleError(...args);
  };

  // Also patch potential warning channels
  const originalConsoleWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = args[0];

    if (typeof message === 'string') {
      if (
        message.includes('Each child in a list should have a unique "key" prop') &&
        message.includes('OuterLayoutRouter')
      ) {
        return; // Suppress
      }
    }

    originalConsoleWarn(...args);
  };

  // Log that we've applied the patch
  console.log('🔇 Next.js OuterLayoutRouter key warning suppressed (development only)');
}

// Auto-suppress if this file is imported
suppressNextJSWarnings();