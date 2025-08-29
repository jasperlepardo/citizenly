'use client';

/**
 * Performance Monitor Hook
 *
 * @description Hook for monitoring React hook performance and render patterns.
 * Helps identify performance bottlenecks and excessive re-renders.
 */

import { useRef, useEffect, useCallback } from 'react';

import { useLogger } from './useLogger';

import type { HookPerformanceMetrics as PerformanceMetrics } from '@/types/performance';

/**
 * Performance metrics interface - imported from @/types/performance
 */

/**
 * Performance monitor options
 */
export interface UsePerformanceMonitorOptions {
  /** Threshold for excessive renders (default: 10) */
  excessiveRenderThreshold?: number;
  /** Whether to log performance warnings (default: true) */
  enableWarnings?: boolean;
  /** Whether to track render timing (default: true) */
  trackTiming?: boolean;
}

/**
 * Return type for performance monitor hook
 */
export interface UsePerformanceMonitorReturn {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Reset performance counters */
  reset: () => void;
  /** Get performance report */
  getReport: () => string;
}

/**
 * Hook for monitoring React hook performance
 *
 * @param hookName - Name of the hook being monitored
 * @param options - Performance monitoring options
 */
export function usePerformanceMonitor(
  hookName: string,
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn {
  const { excessiveRenderThreshold = 10, enableWarnings = true, trackTiming = true } = options;

  const { warn, debug } = useLogger(`PerformanceMonitor:${hookName}`);

  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderStart = useRef<number>(0);
  const hasWarned = useRef(false);

  // Track render start time
  if (trackTiming) {
    lastRenderStart.current = performance.now();
  }

  // Increment render count and calculate timing
  useEffect(() => {
    renderCount.current += 1;

    if (trackTiming) {
      const renderTime = performance.now() - lastRenderStart.current;
      renderTimes.current.push(renderTime);

      // Keep only last 50 render times for memory efficiency
      if (renderTimes.current.length > 50) {
        renderTimes.current = renderTimes.current.slice(-50);
      }

      // Debug log for development
      if (process.env.NODE_ENV === 'development' && renderTime > 10) {
        debug(`Slow render detected: ${renderTime.toFixed(2)}ms`);
      }
    }

    // Warn about excessive renders
    if (enableWarnings && renderCount.current >= excessiveRenderThreshold && !hasWarned.current) {
      hasWarned.current = true;
      warn(
        `Excessive re-renders detected (${renderCount.current} renders). Consider optimization.`
      );
    }
  });

  /**
   * Calculate performance metrics
   */
  const getMetrics = useCallback((): PerformanceMetrics => {
    const times = renderTimes.current;
    const averageRenderTime =
      times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    const lastRenderTime = times.length > 0 ? times[times.length - 1] : 0;

    return {
      renderCount: renderCount.current,
      averageRenderTime,
      lastRenderTime,
      isExcessiveRenders: renderCount.current >= excessiveRenderThreshold,
    };
  }, [excessiveRenderThreshold]);

  /**
   * Reset performance counters
   */
  const reset = useCallback(() => {
    renderCount.current = 0;
    renderTimes.current = [];
    hasWarned.current = false;
    debug('Performance counters reset');
  }, [debug]);

  /**
   * Get detailed performance report
   */
  const getReport = useCallback(() => {
    const metrics = getMetrics();
    return `
Performance Report for ${hookName}:
- Render Count: ${metrics.renderCount}
- Average Render Time: ${metrics.averageRenderTime.toFixed(2)}ms
- Last Render Time: ${metrics.lastRenderTime.toFixed(2)}ms
- Excessive Renders: ${metrics.isExcessiveRenders ? 'YES' : 'NO'}
    `.trim();
  }, [hookName, getMetrics]);

  return {
    metrics: getMetrics(),
    reset,
    getReport,
  };
}

/**
 * Higher-order hook for automatically monitoring hook performance
 *
 * @param hookName - Name of the hook being monitored
 * @param hookFn - The hook function to monitor
 * @param options - Performance monitoring options
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  hookName: string,
  hookFn: T,
  options?: UsePerformanceMonitorOptions
): T {
  return ((...args: Parameters<T>) => {
    const monitor = usePerformanceMonitor(hookName, options);

    // Log performance report in development when component unmounts
    useEffect(() => {
      return () => {
        if (process.env.NODE_ENV === 'development' && monitor.metrics.renderCount > 5) {
          console.log(monitor.getReport());
        }
      };
    }, [monitor]);

    return hookFn(...args);
  }) as T;
}

// Export for backward compatibility
export default usePerformanceMonitor;
