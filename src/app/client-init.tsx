'use client';

/**
 * Client-side initialization script
 * This runs as early as possible to patch console methods before Next.js devtools
 */

// Immediately patch console.error before anything else
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;

  // Patch console.error
  console.error = function (...args: any[]) {
    // Convert all args to string to check content
    const allArgsString = args.map(arg =>
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');

    // Skip Next.js OuterLayoutRouter key warnings
    if (
      allArgsString.includes('Each child in a list should have a unique "key" prop') &&
      allArgsString.includes('OuterLayoutRouter')
    ) {
      return; // Suppress this specific warning
    }

    // Skip hydration mismatch from browser extensions (Scribe, etc.)
    // Check both specific extension errors and general hydration mismatches
    if (
      allArgsString.includes('A tree hydrated but some attributes') &&
      (allArgsString.includes('data-scribe-recorder-ready') ||
       allArgsString.includes('browser extension'))
    ) {
      return; // Suppress browser extension hydration warnings
    }

    // Also suppress generic hydration mismatches that mention browser extensions
    if (
      allArgsString.includes('A tree hydrated but some attributes') &&
      allArgsString.includes('client has a browser extension installed')
    ) {
      return; // Suppress browser extension hydration warnings
    }

    // Skip expected unauthenticated errors (dashboard/profile when not logged in)
    if (
      allArgsString.includes('[useDashboardApi] Dashboard API') ||
      allArgsString.includes('Dashboard data fetch returned null') ||
      allArgsString.includes('permission denied for table auth_user_profiles')
    ) {
      return; // Suppress expected authentication errors in development
    }

    // Call original error for everything else
    return originalError.apply(console, args);
  };

  // Patch console.warn
  console.warn = function (...args: any[]) {
    const message = typeof args[0] === 'string' ? args[0] : '';

    // Skip Next.js OuterLayoutRouter key warnings (if they come as warnings)
    if (
      message.includes('Each child in a list should have a unique "key" prop') &&
      message.includes('OuterLayoutRouter')
    ) {
      return; // Suppress this specific warning
    }

    // Call original warn for everything else
    return originalWarn.apply(console, args);
  };

  // Also try to intercept Next.js devtools error handler
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function (type: string, listener: any, options?: any) {
    if (type === 'error') {
      const wrappedListener = function (this: Window, event: ErrorEvent) {
        if (
          event.message &&
          event.message.includes('Each child in a list should have a unique "key" prop') &&
          event.message.includes('OuterLayoutRouter')
        ) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        return (listener as EventListener).call(this, event);
      };
      return originalAddEventListener.call(window, type, wrappedListener as any, options);
    }
    return originalAddEventListener.call(window, type, listener, options);
  };
}

export default function ClientInit() {
  return null;
}
