/**
 * Monitoring Module Exports
 * Centralized monitoring and observability utilities
 */

// Sentry configuration and utilities
export {
  getSentryConfig,
  setSentryUser,
  setSentryContext,
  addSentryBreadcrumb,
  captureError,
  startSentryTransaction,
  isSentryConfigured,
} from './sentry-config';

// Performance monitoring
export {
  performanceMonitor,
  startPerformanceMetric,
  endPerformanceMetric,
  measureFunction,
  trackComponentRender,
  trackApiCall,
  trackDataLoad,
} from './performance';

// Re-export client logger for convenience
export { clientLogger } from '@/lib/logging/client-logger';

// Monitoring hooks for React components
export { usePerformanceTracking } from './hooks/usePerformanceTracking';
export { useErrorBoundary } from './hooks/useErrorBoundary';

// Error boundary component
export { ErrorBoundaryProvider } from './components/ErrorBoundaryProvider';
