import { logger } from './secure-logger';

/**
 * Performance monitoring utilities
 * Tracks key metrics and provides insights into app performance
 */

// Performance entry interfaces
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources?: Array<{
    node?: {
      tagName: string;
    };
  }>;
}

interface ComponentProps {
  [key: string]: unknown;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface ComponentPerformanceData {
  componentName: string;
  renderTime: number;
  propsSize?: number;
  rerenderCount: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentPerformanceData> = new Map();
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    if (typeof window !== 'undefined' && this.isEnabled) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    try {
      // Observe navigation timing
      if ('PerformanceObserver' in window) {
        const navigationObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.recordMetric('navigation', entry.duration, {
              type: entry.entryType,
              name: entry.name,
            });
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

        // Observe resource loading
        const resourceObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              // Only log slow resources
              this.recordMetric('resource', entry.duration, {
                name: entry.name,
                type: entry.entryType,
                size: (entry as PerformanceResourceTiming).transferSize,
              });
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.recordMetric('lcp', entry.startTime, {
              element: (entry as any).element?.tagName,
              url: (entry as any).url,
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe cumulative layout shift
        const clsObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as LayoutShiftEntry;
            if (!layoutShiftEntry.hadRecentInput) {
              this.recordMetric('cls', layoutShiftEntry.value, {
                sources: layoutShiftEntry.sources?.map(s => s.node?.tagName),
              });
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      }
    } catch (error) {
      logger.error('Failed to initialize performance observers', { error });
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log significant metrics
    if (this.isSignificantMetric(name, value)) {
      logger.info(`Performance: ${name}`, {
        value: `${value.toFixed(2)}ms`,
        ...metadata,
      });
    }
  }

  private isSignificantMetric(name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      navigation: 3000,
      resource: 500,
      lcp: 2500,
      cls: 0.1,
      render: 16, // One frame at 60fps
      api: 1000,
    };

    return value > (thresholds[name] || 100);
  }

  /**
   * Start timing an operation
   */
  startTiming(name: string): () => void {
    if (!this.isEnabled) return () => {};

    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }

  /**
   * Time an async operation
   */
  async timeAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return operation();

    const endTiming = this.startTiming(name);
    try {
      const result = await operation();
      endTiming();
      return result;
    } catch (error) {
      endTiming();
      throw error;
    }
  }

  /**
   * Record component render performance
   */
  recordComponentRender(
    componentName: string,
    renderTime: number,
    propsSize?: number,
    isRerender = false
  ) {
    if (!this.isEnabled) return;

    const existing = this.componentMetrics.get(componentName);
    const data: ComponentPerformanceData = {
      componentName,
      renderTime,
      propsSize,
      rerenderCount: existing ? existing.rerenderCount + (isRerender ? 1 : 0) : 0,
      timestamp: Date.now(),
    };

    this.componentMetrics.set(componentName, data);

    if (renderTime > 16) {
      // Slower than 60fps
      logger.warn(`Slow component render: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        rerenderCount: data.rerenderCount,
        propsSize,
      });
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    if (!this.isEnabled) return null;

    const recent = this.metrics.filter(m => Date.now() - m.timestamp < 60000); // Last minute

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recent.length,
      averages: {} as Record<string, number>,
      components: Array.from(this.componentMetrics.entries()).map(([name, data]) => ({
        name,
        averageRenderTime: data.renderTime,
        rerenderCount: data.rerenderCount,
      })),
      slowestOperations: this.metrics
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
        .map(m => ({ name: m.name, value: m.value })),
    };

    // Calculate averages by metric type
    const grouped = recent.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) acc[metric.name] = [];
        acc[metric.name].push(metric.value);
        return acc;
      },
      {} as Record<string, number[]>
    );

    Object.entries(grouped).forEach(([name, values]) => {
      summary.averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return summary;
  }

  /**
   * Get Web Vitals
   */
  getWebVitals() {
    if (!this.isEnabled || typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      // First Contentful Paint
      fcp: this.metrics.find(
        m => m.name === 'paint' && m.metadata?.name === 'first-contentful-paint'
      )?.value,

      // Largest Contentful Paint
      lcp: this.metrics.filter(m => m.name === 'lcp').sort((a, b) => b.timestamp - a.timestamp)[0]
        ?.value,

      // Cumulative Layout Shift
      cls: this.metrics.filter(m => m.name === 'cls').reduce((sum, m) => sum + m.value, 0),

      // Time to First Byte
      ttfb: navigation ? navigation.responseStart - navigation.requestStart : null,

      // DOM Content Loaded
      domContentLoaded: navigation
        ? navigation.domContentLoadedEventEnd - navigation.fetchStart
        : null,

      // Load Complete
      loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : null,
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    if (!this.isEnabled) return null;

    return {
      metrics: this.metrics,
      components: Object.fromEntries(this.componentMetrics),
      webVitals: this.getWebVitals(),
      summary: this.getPerformanceSummary(),
      timestamp: Date.now(),
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Decorator for timing functions
export function timed(name?: string) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timerName = name || `${(target as any).constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: unknown[]) {
      const endTiming = performanceMonitor.startTiming(timerName);
      try {
        const result = originalMethod.apply(this, args);

        // Handle async methods
        if (result instanceof Promise) {
          return result.finally(() => endTiming());
        }

        endTiming();
        return result;
      } catch (error) {
        endTiming();
        throw error;
      }
    };

    return descriptor;
  };
}

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const renderStart = performance.now();

  return {
    onRenderComplete: (propsSize?: number, isRerender = false) => {
      const renderTime = performance.now() - renderStart;
      performanceMonitor.recordComponentRender(componentName, renderTime, propsSize, isRerender);
    },
  };
}

// Utility to measure props size
export function measurePropsSize(props: ComponentProps): number {
  try {
    return JSON.stringify(props).length;
  } catch {
    return 0;
  }
}

// Report performance to external service (placeholder)
export async function reportPerformanceMetrics() {
  if (process.env.NODE_ENV === 'production') {
    const metrics = performanceMonitor.exportMetrics();

    // In a real app, send to analytics service
    logger.info('Performance report', { metrics });

    // Clear after reporting
    performanceMonitor.clearMetrics();
  }
}
