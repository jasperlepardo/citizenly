/**
 * PWA Performance Utilities
 * Provides performance monitoring and reporting for PWA features.
 */

class PWAPerformance {
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Start measuring a performance metric
   */
  start(key: string): void {
    this.startTimes.set(key, performance.now());
  }

  /**
   * End measuring a performance metric
   */
  end(key: string): number {
    const startTime = this.startTimes.get(key);
    if (!startTime) {
      console.warn(`No start time found for performance metric: ${key}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(key, duration);
    this.startTimes.delete(key);
    
    return duration;
  }

  /**
   * Get a specific metric
   */
  getMetric(key: string): number | undefined {
    return this.metrics.get(key);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Generate performance report
   */
  generateReport(): any {
    return {
      metrics: this.getAllMetrics(),
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Singleton instance
export const pwaPerformance = {
  instance: new PWAPerformance(),
};

// PWA event tracking utilities
export const trackPWAEvents = {
  installPromptShown: () => {
    pwaPerformance.instance.start('pwa-install-prompt-shown');
    console.log('PWA install prompt shown');
  },
  
  installAccepted: () => {
    pwaPerformance.instance.end('pwa-install-prompt-shown');
    console.log('PWA install accepted');
  },
  
  installDismissed: () => {
    pwaPerformance.instance.end('pwa-install-prompt-shown');
    console.log('PWA install dismissed');
  },
};