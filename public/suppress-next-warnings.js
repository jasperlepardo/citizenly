// This script runs before React loads to suppress Next.js internal warnings
// It must be loaded in the <head> tag to intercept errors early enough

(function() {
  'use strict';
  
  // Only run in development
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Override console.error
  console.error = function() {
    const firstArg = arguments[0];
    const message = typeof firstArg === 'string' ? firstArg : String(firstArg);
    
    // Check if this is the Next.js OuterLayoutRouter warning
    if (message.includes('Each child in a list should have a unique "key" prop') &&
        message.includes('OuterLayoutRouter')) {
      // Suppress this specific warning
      return;
    }
    
    // Pass through all other errors
    return originalError.apply(console, arguments);
  };
  
  // Override console.warn
  console.warn = function() {
    const firstArg = arguments[0];
    const message = typeof firstArg === 'string' ? firstArg : String(firstArg);
    
    // Check if this is the Next.js OuterLayoutRouter warning
    if (message.includes('Each child in a list should have a unique "key" prop') &&
        message.includes('OuterLayoutRouter')) {
      // Suppress this specific warning
      return;
    }
    
    // Pass through all other warnings
    return originalWarn.apply(console, arguments);
  };
  
  console.log('🔇 Next.js OuterLayoutRouter warning suppression active');
})();