/**
 * Performance Utilities Exports
 * Centralized exports for all performance optimization utilities
 */

// Export from main performance monitor (avoiding conflicts)
export { 
  performanceMonitor, 
  usePerformanceTracking,
  markUserInteraction
} from './performanceMonitor';

// Export optimization utilities
export * from './optimizationUtils';

// Export PWA performance utilities  
export * from './pwaPerformanceUtils';

// Export specific utilities from performanceUtils to avoid conflicts
export { 
  timed,
  reportPerformanceMetrics,
  measurePropsSize,
  usePerformanceTracking as usePerformanceTrackingUtils
} from './performanceUtils';