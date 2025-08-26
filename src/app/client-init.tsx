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
  console.error = function(...args: any[]) {
    const message = typeof args[0] === 'string' ? args[0] : '';
    
    // Skip Next.js OuterLayoutRouter key warnings
    if (message.includes('Each child in a list should have a unique "key" prop') &&
        message.includes('OuterLayoutRouter')) {
      return; // Suppress this specific warning
    }
    
    // Call original error for everything else
    return originalError.apply(console, args);
  };
  
  // Patch console.warn
  console.warn = function(...args: any[]) {
    const message = typeof args[0] === 'string' ? args[0] : '';
    
    // Skip Next.js OuterLayoutRouter key warnings (if they come as warnings)
    if (message.includes('Each child in a list should have a unique "key" prop') &&
        message.includes('OuterLayoutRouter')) {
      return; // Suppress this specific warning
    }
    
    // Call original warn for everything else
    return originalWarn.apply(console, args);
  };
  
  // Also try to intercept Next.js devtools error handler
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'error') {
      const wrappedListener = function(event: ErrorEvent) {
        if (event.message && 
            event.message.includes('Each child in a list should have a unique "key" prop') &&
            event.message.includes('OuterLayoutRouter')) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        return (listener as any).call(this as any, event);
      };
      return originalAddEventListener.call(window, type, wrappedListener as any, options);
    }
    return originalAddEventListener.call(window, type, listener, options);
  };
}

export default function ClientInit() {
  return null;
}