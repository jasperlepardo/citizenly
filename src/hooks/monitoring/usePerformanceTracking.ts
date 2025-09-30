/**
 * Performance Tracking React Hook
 * Track component performance and lifecycle metrics
 */

import { useEffect, useRef, useCallback } from 'react';

import { clientLogger } from '@/lib/logging/client-logger';

import { performanceMonitor } from '@/lib/performance/performanceMonitor';
import type { UsePerformanceTrackingOptions, PerformanceTrackingReturn } from '@/types/shared/utilities/performance';


/**
 * Hook for tracking component performance metrics
 */
export const usePerformanceTracking = (
  options: UsePerformanceTrackingOptions
): PerformanceTrackingReturn => {
  const {
    componentName,
    trackRenders = true,
    trackMounts = true,
    trackUpdates = false,
    metadata = {},
  } = options;

  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    if (trackMounts) {
      mountTimeRef.current = performance.now();
      const metricName = `component_mount_${componentName}`;

      // Record mount start time
      performance.mark(`${metricName}-start`);

      clientLogger.component(componentName, 'mounted', { timestamp: mountTimeRef.current });

      return () => {
        // Track unmount
        const unmountTime = performance.now();
        const lifecycleDuration = unmountTime - mountTimeRef.current;

        // Record mount duration
        performance.mark(`${metricName}-end`);
        performance.measure(metricName, `${metricName}-start`, `${metricName}-end`);
        performanceMonitor.recordCustomMetric(metricName, lifecycleDuration);

        clientLogger.component(componentName, 'unmounted', {
          lifecycleDuration: Math.round(lifecycleDuration * 100) / 100,
          renderCount: renderCountRef.current,
        });
      };
    }
  }, [componentName, trackMounts, metadata]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      renderCountRef.current += 1;
      const currentTime = performance.now();

      if (renderCountRef.current > 1 && trackUpdates) {
        const timeSinceLastRender = currentTime - lastRenderTimeRef.current;

        clientLogger.component(componentName, 're-rendered', {
          renderCount: renderCountRef.current,
          timeSinceLastRender: Math.round(timeSinceLastRender * 100) / 100,
        });

        // Warn about frequent re-renders
        if (timeSinceLastRender < 50) {
          // Less than 50ms between renders
          clientLogger.warn(`Frequent re-renders detected in ${componentName}`, {
            action: 'frequent_rerenders',
            data: {
              component: componentName,
              renderCount: renderCountRef.current,
              timeSinceLastRender,
            },
          });
        }
      }

      lastRenderTimeRef.current = currentTime;
    }
  });

  // Track custom operations
  const trackOperation = useCallback(
    <T>(name: string, operation: () => T, operationMetadata?: Record<string, any>): T => {
      const metricName = `${componentName}_${name}`;
      const startTime = performance.now();

      try {
        const result = operation();
        const endTime = performance.now();
        const duration = endTime - startTime;

        performanceMonitor.recordCustomMetric(metricName, duration);
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        performanceMonitor.recordCustomMetric(`${metricName}_error`, duration);
        throw error;
      }
    },
    [componentName, metadata]
  );

  // Track async operations
  const trackAsyncOperation = useCallback(
    async <T>(
      name: string,
      operation: () => Promise<T>,
      operationMetadata?: Record<string, any>
    ): Promise<T> => {
      const metricName = `${componentName}_async_${name}`;

      const startTime = performance.now();

      try {
        const result = await operation();
        const endTime = performance.now();
        const duration = endTime - startTime;

        performanceMonitor.recordCustomMetric(metricName, duration);
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        performanceMonitor.recordCustomMetric(`${metricName}_error`, duration);
        throw error;
      }
    },
    [componentName, metadata]
  );

  return {
    trackOperation,
    trackAsyncOperation,
  };
};
