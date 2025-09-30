/**
 * Performance Monitoring Types
 * Consolidated performance metrics interfaces for different monitoring contexts
 */

// =============================================================================
// WEB PERFORMANCE METRICS (Browser Performance API)
// =============================================================================

/**
 * Web performance metrics from browser Performance API
 * Used for measuring page load and rendering performance
 * Canonical type re-exported from services.ts
 */
export interface PerformanceMetrics {
  loadTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  domInteractive: number;
  domComplete: number;
}

// =============================================================================
// REACT HOOK PERFORMANCE METRICS
// =============================================================================

/**
 * React hook performance metrics
 * Used for measuring component render performance
 */
export interface HookPerformanceMetrics {
  /** Number of renders */
  renderCount: number;
  /** Average render time in ms */
  averageRenderTime: number;
  /** Last render time in ms */
  lastRenderTime: number;
  /** Whether this hook is causing excessive re-renders */
  isExcessiveRenders: boolean;
}

// =============================================================================
// HTTP REQUEST PERFORMANCE METRICS
// =============================================================================

/**
 * HTTP request performance metrics
 * Used for measuring API endpoint performance in middleware
 */
export interface RequestPerformanceMetrics {
  path: string;
  method: string;
  duration: number;
  timestamp: number;
  statusCode: number;
  userAgent?: string;
  ip?: string;
}

// =============================================================================
// GENERIC PERFORMANCE TRACKING
// =============================================================================

/**
 * Generic performance metrics for custom tracking
 * Used for measuring arbitrary operations and processes
 */
export interface GenericPerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// =============================================================================
// SPECIALIZED PERFORMANCE METRICS
// =============================================================================

/**
 * Command menu specific performance metrics
 */
export interface CommandMenuPerformanceMetrics {
  searchLatency: number;
  cacheHitRate: number;
  errorRate: number;
  usageFrequency: number;
}

// =============================================================================
// PERFORMANCE TRACKING HOOK TYPES
// =============================================================================

/**
 * Performance tracking hook options interface
 * Consolidates from src/hooks/monitoring/usePerformanceTracking.ts
 */
export interface UsePerformanceTrackingOptions {
  componentName: string;
  enableDetailedMetrics?: boolean;
  sampleRate?: number;
  reportInterval?: number;
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUpdates?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Performance tracking hook return interface
 * Consolidates from src/hooks/monitoring/usePerformanceTracking.ts
 */
export interface PerformanceTrackingReturn {
  trackOperation: <T>(name: string, operation: () => T, metadata?: Record<string, any>) => T;
  trackAsyncOperation: <T>(name: string, operation: () => Promise<T>, metadata?: Record<string, any>) => Promise<T>;
}
