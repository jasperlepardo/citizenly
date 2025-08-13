/**
 * Performance Monitoring Utilities
 * 
 * @description Client-side performance monitoring for Core Web Vitals and custom metrics.
 * Provides insights into app performance and helps identify optimization opportunities.
 * 
 * @metrics Tracked:
 * - Largest Contentful Paint (LCP) - Loading performance
 * - First Input Delay (FID) - Interactivity
 * - Cumulative Layout Shift (CLS) - Visual stability
 * - First Contentful Paint (FCP) - Initial rendering
 * - Time to First Byte (TTFB) - Server response time
 */

import React from 'react';
import { logger } from './secure-logger';

// Performance thresholds based on Core Web Vitals
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // milliseconds
  FID: { good: 100, needsImprovement: 300 },   // milliseconds
  CLS: { good: 0.1, needsImprovement: 0.25 },  // score
  FCP: { good: 1800, needsImprovement: 3000 }, // milliseconds
  TTFB: { good: 800, needsImprovement: 1800 }, // milliseconds
};

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent?: string;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer?: PerformanceObserver;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    // Check if browser supports the APIs we need
    if (!('performance' in window) || !('PerformanceObserver' in window)) {
      logger.warn('Performance monitoring not supported in this browser');
      this.isEnabled = false;
      return;
    }

    this.setupCoreWebVitalsObserver();
    this.setupNavigationObserver();
    this.setupResourceObserver();
    
    // Monitor long tasks that could affect responsiveness
    this.setupLongTaskObserver();
  }

  /**
   * Set up Core Web Vitals observer
   */
  private setupCoreWebVitalsObserver(): void {
    if (!this.isEnabled) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      // Observe different performance entry types
      this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      logger.error('Failed to setup Core Web Vitals observer', { error });
    }
  }

  /**
   * Set up navigation timing observer
   */
  private setupNavigationObserver(): void {
    if (!this.isEnabled) return;

    try {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        }
      });

      navObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      logger.error('Failed to setup navigation observer', { error });
    }
  }

  /**
   * Set up resource timing observer
   */
  private setupResourceObserver(): void {
    if (!this.isEnabled) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const resources = this.analyzeResourceTiming(list.getEntries() as PerformanceResourceTiming[]);
        this.reportResourceMetrics(resources);
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      logger.error('Failed to setup resource observer', { error });
    }
  }

  /**
   * Set up long task observer
   */
  private setupLongTaskObserver(): void {
    if (!this.isEnabled) return;

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handleLongTask(entry);
        }
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // Long tasks may not be supported in all browsers
      logger.debug('Long task monitoring not available', { error });
    }
  }

  /**
   * Handle performance entries
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    let metric: PerformanceMetric | null = null;

    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          metric = this.createMetric('FCP', entry.startTime);
        }
        break;

      case 'largest-contentful-paint':
        metric = this.createMetric('LCP', entry.startTime);
        break;

      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        metric = this.createMetric('FID', fidEntry.processingStart - fidEntry.startTime);
        break;

      case 'layout-shift':
        const clsEntry = entry as any; // LayoutShift interface may not be available
        if (!clsEntry.hadRecentInput) {
          metric = this.createMetric('CLS', clsEntry.value);
        }
        break;
    }

    if (metric) {
      this.recordMetric(metric);
    }
  }

  /**
   * Handle navigation timing
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const ttfb = entry.responseStart - entry.requestStart;
    const metric = this.createMetric('TTFB', ttfb);
    this.recordMetric(metric);

    // Additional navigation metrics
    this.recordCustomMetric('DOM_LOAD_TIME', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
    this.recordCustomMetric('FULL_LOAD_TIME', entry.loadEventEnd - entry.loadEventStart);
  }

  /**
   * Handle long tasks
   */
  private handleLongTask(entry: PerformanceEntry): void {
    logger.warn('Long task detected', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name
    });

    // Long tasks over 50ms can affect user experience
    if (entry.duration > 50) {
      this.recordCustomMetric('LONG_TASK', entry.duration);
    }
  }

  /**
   * Analyze resource timing
   */
  private analyzeResourceTiming(entries: PerformanceResourceTiming[]): ResourceTiming[] {
    return entries.map(entry => ({
      name: entry.name,
      duration: entry.responseEnd - entry.requestStart,
      size: entry.transferSize || 0,
      type: this.getResourceType(entry.name)
    }));
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Create a performance metric
   */
  private createMetric(name: string, value: number): PerformanceMetric {
    return {
      name,
      value,
      rating: this.getRating(name, value),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!thresholds) return 'good';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Log poor performance metrics
    if (metric.rating === 'poor') {
      logger.warn('Poor performance metric detected', {
        metric: metric.name,
        value: metric.value,
        url: metric.url
      });
    }

    // Send to analytics (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Record custom metric
   */
  public recordCustomMetric(name: string, value: number): void {
    const metric = this.createMetric(name, value);
    this.recordMetric(metric);
  }

  /**
   * Report resource metrics
   */
  private reportResourceMetrics(resources: ResourceTiming[]): void {
    // Find slow resources
    const slowResources = resources.filter(r => r.duration > 1000);
    if (slowResources.length > 0) {
      logger.warn('Slow resources detected', { slowResources });
    }

    // Find large resources
    const largeResources = resources.filter(r => r.size > 500000); // 500KB
    if (largeResources.length > 0) {
      logger.warn('Large resources detected', { largeResources });
    }
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Implementation would depend on your analytics service
    // Example: Google Analytics, Mixpanel, custom endpoint
    
    try {
      // Example with fetch to custom endpoint
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(metric));
      } else {
        fetch('/api/analytics/performance', {
          method: 'POST',
          body: JSON.stringify(metric),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(error => {
          logger.error('Failed to send performance metric', { error });
        });
      }
    } catch (error) {
      logger.error('Failed to send performance metric', { error });
    }
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    summary: Record<string, { average: number; worst: number; count: number }>;
  } {
    const summary: Record<string, { average: number; worst: number; count: number }> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = { average: 0, worst: 0, count: 0 };
      }

      summary[metric.name].count++;
      summary[metric.name].average = (summary[metric.name].average * (summary[metric.name].count - 1) + metric.value) / summary[metric.name].count;
      summary[metric.name].worst = Math.max(summary[metric.name].worst, metric.value);
    }

    return { metrics: this.metrics, summary };
  }

  /**
   * Clear stored metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Disconnect observers
   */
  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for React components to track custom performance metrics
 */
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceMonitor.recordCustomMetric(`COMPONENT_RENDER_${componentName}`, renderTime);
    };
  }, [componentName]);
}

/**
 * Utility function to mark important user interactions
 */
export function markUserInteraction(actionName: string): () => void {
  performance.mark(`user-${actionName}-start`);
  
  // Return a function to mark the end
  return () => {
    performance.mark(`user-${actionName}-end`);
    performance.measure(`user-${actionName}`, `user-${actionName}-start`, `user-${actionName}-end`);
  };
}