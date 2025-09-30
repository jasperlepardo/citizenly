/**
 * Performance Monitoring Utilities
 * Client-side performance tracking and optimization helpers
 */

import { clientLogger } from '@/lib/logging/client-logger';
import type { PerformanceMetric } from '@/types/shared/utilities/utilities';

import { startSentryTransaction } from './sentry-config';



class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Start tracking a performance metric
   */
  startMetric(name: string, metadata?: Record<string, any>): () => void {
    const startTime = performance.now();

    this.metrics.set(name, {
      name,
      value: startTime,
      timestamp: Date.now(),
      metadata,
    });

    // Start Sentry transaction for critical operations
    if (this.isProduction && this.isCriticalOperation(name)) {
      const transaction = startSentryTransaction(name, 'performance');
      if (transaction && metadata) {
        // Add context to transaction
        Object.entries(metadata).forEach(([key, value]) => {
          transaction.setTag(key, String(value));
        });
      }
    }

    clientLogger.debug(`Performance tracking started: ${name}`, {
      action: 'performance_start',
      data: { name, startTime, metadata },
    });

    // Return a function to end the metric
    return () => {
      this.endMetric(name);
    };
  }

  /**
   * End tracking and log performance metric
   */
  endMetric(name: string, additionalData?: Record<string, any>): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      clientLogger.warn(`Performance metric not found: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.value;

    const completedMetric: PerformanceMetric = {
      ...metric,
      value: duration,
      timestamp: Date.now(),
    };

    this.metrics.set(name, completedMetric);

    // Log performance data
    const logData = {
      name,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      metadata: metric.metadata,
      ...additionalData,
    };

    // Determine if this is a performance concern
    const thresholds = this.getPerformanceThresholds();
    const threshold = thresholds[name] || thresholds.default;

    if (duration > threshold.error) {
      clientLogger.error(`Performance issue detected: ${name} took ${duration.toFixed(2)}ms`, {
        action: 'performance_issue',
        data: logData,
      });
    } else if (duration > threshold.warn) {
      clientLogger.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`, {
        action: 'performance_warning',
        data: logData,
      });
    } else {
      clientLogger.info(`Performance metric: ${name} completed in ${duration.toFixed(2)}ms`, {
        action: 'performance_complete',
        data: logData,
      });
    }

    return duration;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Measure a function execution time
   */
  async measureFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMetric(name, metadata);

    try {
      const result = await fn();
      this.endMetric(name, { success: true });
      return result;
    } catch (error) {
      this.endMetric(name, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, props?: any): () => void {
    const metricName = `component_render_${componentName}`;
    this.startMetric(metricName, {
      component: componentName,
      propsCount: props ? Object.keys(props).length : 0,
    });

    return () => this.endMetric(metricName);
  }

  /**
   * Track API call performance
   */
  trackApiCall(method: string, endpoint: string, metadata?: Record<string, any>): () => void {
    const metricName = `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.startMetric(metricName, {
      method,
      endpoint,
      ...metadata,
    });

    return () => this.endMetric(metricName);
  }

  /**
   * Track data loading operations
   */
  trackDataLoad(resource: string, metadata?: Record<string, any>): () => void {
    const metricName = `data_load_${resource}`;
    this.startMetric(metricName, {
      resource,
      ...metadata,
    });

    return () => this.endMetric(metricName);
  }

  /**
   * Get Web Vitals if available
   */
  getWebVitals(): Promise<any> {
    return new Promise(resolve => {
      if (typeof window !== 'undefined' && 'web-vitals' in window) {
        // If web-vitals library is loaded
        resolve((window as any)['web-vitals']);
      } else {
        // Fallback to basic performance API
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        resolve({
          fcp: navigation.responseStart - navigation.fetchStart,
          lcp: navigation.loadEventEnd - navigation.fetchStart,
          cls: 0, // Would need proper measurement
          fid: 0, // Would need proper measurement
          ttfb: navigation.responseStart - navigation.requestStart,
        });
      }
    });
  }

  /**
   * Performance thresholds for different operations
   */
  private getPerformanceThresholds(): Record<string, { warn: number; error: number }> {
    return {
      // API calls
      api_get: { warn: 1000, error: 3000 },
      api_post: { warn: 2000, error: 5000 },
      api_put: { warn: 2000, error: 5000 },
      api_delete: { warn: 1000, error: 3000 },

      // Component renders
      component_render: { warn: 100, error: 500 },

      // Data operations
      data_load: { warn: 500, error: 2000 },
      data_transform: { warn: 200, error: 1000 },

      // Default thresholds
      default: { warn: 1000, error: 3000 },
    };
  }

  /**
   * Check if operation is critical for Sentry tracking
   */
  private isCriticalOperation(name: string): boolean {
    const criticalOperations = ['api_', 'data_load_', 'auth_', 'payment_', 'search_'];

    return criticalOperations.some(op => name.startsWith(op));
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startPerformanceMetric = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.startMetric(name, metadata);

export const endPerformanceMetric = (name: string, additionalData?: Record<string, any>) =>
  performanceMonitor.endMetric(name, additionalData);

export const measureFunction = <T>(
  name: string,
  fn: () => T | Promise<T>,
  metadata?: Record<string, any>
) => performanceMonitor.measureFunction(name, fn, metadata);

export const trackComponentRender = (componentName: string, props?: any) =>
  performanceMonitor.trackComponentRender(componentName, props);

export const trackApiCall = (method: string, endpoint: string, metadata?: Record<string, any>) =>
  performanceMonitor.trackApiCall(method, endpoint, metadata);

export const trackDataLoad = (resource: string, metadata?: Record<string, any>) =>
  performanceMonitor.trackDataLoad(resource, metadata);

// performanceMonitor is already exported as 'export const' above
