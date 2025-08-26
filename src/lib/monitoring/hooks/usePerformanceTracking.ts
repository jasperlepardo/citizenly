/**
 * Performance Tracking React Hook
 * Track component performance and lifecycle metrics
 */

import { useEffect, useRef, useCallback } from 'react';

import { clientLogger } from '@/lib/logging/client-logger';

import { performanceMonitor } from '../performance';

interface UsePerformanceTrackingOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUpdates?: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceTrackingReturn {
  trackOperation: (name: string, metadata?: Record<string, any>) => () => void;
  trackAsyncOperation: <T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, any>
  ) => Promise<T>;
}

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
    metadata = {}
  } = options;

  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  // Track component mount
  useEffect(() => {
    if (trackMounts) {
      mountTimeRef.current = performance.now();
      const metricName = `component_mount_${componentName}`;
      
      performanceMonitor.startMetric(metricName, {
        component: componentName,
        type: 'mount',
        ...metadata
      });

      clientLogger.component(componentName, 'mounted', { timestamp: mountTimeRef.current });

      return () => {
        // Track unmount
        const unmountTime = performance.now();
        const lifecycleDuration = unmountTime - mountTimeRef.current;
        
        performanceMonitor.endMetric(metricName);
        
        clientLogger.component(componentName, 'unmounted', {
          lifecycleDuration: Math.round(lifecycleDuration * 100) / 100,
          renderCount: renderCountRef.current
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
          timeSinceLastRender: Math.round(timeSinceLastRender * 100) / 100
        });

        // Warn about frequent re-renders
        if (timeSinceLastRender < 50) { // Less than 50ms between renders
          clientLogger.warn(`Frequent re-renders detected in ${componentName}`, {
            action: 'frequent_rerenders',
            data: {
              component: componentName,
              renderCount: renderCountRef.current,
              timeSinceLastRender
            }
          });
        }
      }

      lastRenderTimeRef.current = currentTime;
    }
  });

  // Track custom operations
  const trackOperation = useCallback((
    name: string, 
    operationMetadata?: Record<string, any>
  ) => {
    const metricName = `${componentName}_${name}`;
    performanceMonitor.startMetric(metricName, {
      component: componentName,
      operation: name,
      ...metadata,
      ...operationMetadata
    });

    return () => performanceMonitor.endMetric(metricName);
  }, [componentName, metadata]);

  // Track async operations
  const trackAsyncOperation = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>,
    operationMetadata?: Record<string, any>
  ): Promise<T> => {
    const metricName = `${componentName}_async_${name}`;
    
    return performanceMonitor.measureFunction(
      metricName,
      operation,
      {
        component: componentName,
        operation: name,
        type: 'async',
        ...metadata,
        ...operationMetadata
      }
    );
  }, [componentName, metadata]);

  return {
    trackOperation,
    trackAsyncOperation
  };
};