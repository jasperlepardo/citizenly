/**
 * PWA Performance Monitoring
 * Tracks PWA-specific metrics and user interactions
 */

interface PWAMetrics {
  installPromptShown: number;
  installAccepted: number;
  installDismissed: number;
  offlineUsage: number;
  cacheHits: number;
  cacheMisses: number;
  syncOperations: number;
  syncFailures: number;
}

interface PerformanceEntry {
  name: string;
  type: 'cache' | 'sync' | 'install' | 'offline' | 'navigation';
  timestamp: number;
  duration?: number;
  success?: boolean;
  details?: Record<string, string | number | boolean>;
}

class PWAPerformanceMonitor {
  private metrics: PWAMetrics;
  private entries: PerformanceEntry[] = [];
  private maxEntries = 1000;

  constructor() {
    this.metrics = {
      installPromptShown: 0,
      installAccepted: 0,
      installDismissed: 0,
      offlineUsage: 0,
      cacheHits: 0,
      cacheMisses: 0,
      syncOperations: 0,
      syncFailures: 0,
    };

    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.loadStoredMetrics();
      this.setupEventListeners();
    }
  }

  /**
   * Load metrics from localStorage
   */
  private loadStoredMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('pwa-metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load stored PWA metrics:', error);
    }
  }

  /**
   * Save metrics to localStorage
   */
  private saveMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('pwa-metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to save PWA metrics:', error);
    }
  }

  /**
   * Setup performance monitoring event listeners
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        this.handleServiceWorkerMessage(event);
      });
    }

    // Page visibility for offline usage tracking
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !navigator.onLine) {
          this.trackOfflineUsage();
        }
      });
    }

    // Performance observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.trackNavigationPerformance(entry as PerformanceNavigationTiming);
            }
          }
        });
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  /**
   * Handle service worker messages
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data || {};

    switch (type) {
      case 'CACHE_HIT':
        this.trackCacheHit(data);
        break;
      case 'CACHE_MISS':
        this.trackCacheMiss(data);
        break;
      case 'SYNC_START':
        this.trackSyncStart(data);
        break;
      case 'SYNC_SUCCESS':
        this.trackSyncSuccess(data);
        break;
      case 'SYNC_FAILURE':
        this.trackSyncFailure(data);
        break;
    }
  }

  /**
   * Track install prompt shown
   */
  trackInstallPromptShown(): void {
    this.metrics.installPromptShown++;
    this.addEntry({
      name: 'install_prompt_shown',
      type: 'install',
      timestamp: Date.now(),
    });
    this.saveMetrics();
  }

  /**
   * Track install accepted
   */
  trackInstallAccepted(): void {
    this.metrics.installAccepted++;
    this.addEntry({
      name: 'install_accepted',
      type: 'install',
      timestamp: Date.now(),
      success: true,
    });
    this.saveMetrics();

    // Track conversion rate
    const conversionRate = this.metrics.installAccepted / this.metrics.installPromptShown;
    console.log(`PWA Install Conversion Rate: ${(conversionRate * 100).toFixed(2)}%`);
  }

  /**
   * Track install dismissed
   */
  trackInstallDismissed(): void {
    this.metrics.installDismissed++;
    this.addEntry({
      name: 'install_dismissed',
      type: 'install',
      timestamp: Date.now(),
      success: false,
    });
    this.saveMetrics();
  }

  /**
   * Track offline usage
   */
  trackOfflineUsage(): void {
    this.metrics.offlineUsage++;
    this.addEntry({
      name: 'offline_usage',
      type: 'offline',
      timestamp: Date.now(),
    });
    this.saveMetrics();
  }

  /**
   * Track cache hit
   */
  trackCacheHit(resource?: string): void {
    this.metrics.cacheHits++;
    this.addEntry({
      name: 'cache_hit',
      type: 'cache',
      timestamp: Date.now(),
      success: true,
      details: { resource },
    });
    this.saveMetrics();
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(resource?: string): void {
    this.metrics.cacheMisses++;
    this.addEntry({
      name: 'cache_miss',
      type: 'cache',
      timestamp: Date.now(),
      success: false,
      details: { resource },
    });
    this.saveMetrics();
  }

  /**
   * Track sync operation start
   */
  trackSyncStart(details?: Record<string, string | number | boolean>): void {
    this.addEntry({
      name: 'sync_start',
      type: 'sync',
      timestamp: Date.now(),
      details,
    });
  }

  /**
   * Track successful sync
   */
  trackSyncSuccess(details?: Record<string, string | number | boolean>): void {
    this.metrics.syncOperations++;
    this.addEntry({
      name: 'sync_success',
      type: 'sync',
      timestamp: Date.now(),
      success: true,
      details,
    });
    this.saveMetrics();
  }

  /**
   * Track failed sync
   */
  trackSyncFailure(details?: Record<string, string | number | boolean>): void {
    this.metrics.syncFailures++;
    this.addEntry({
      name: 'sync_failure',
      type: 'sync',
      timestamp: Date.now(),
      success: false,
      details,
    });
    this.saveMetrics();
  }

  /**
   * Track navigation performance
   */
  private trackNavigationPerformance(entry: PerformanceNavigationTiming): void {
    const loadTime = entry.loadEventEnd - entry.startTime;
    const domContentLoaded = entry.domContentLoadedEventEnd - entry.startTime;

    this.addEntry({
      name: 'navigation_timing',
      type: 'navigation',
      timestamp: Date.now(),
      duration: loadTime,
      details: {
        loadTime,
        domContentLoaded,
        dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcpConnect: entry.connectEnd - entry.connectStart,
        serverResponse: entry.responseEnd - entry.requestStart,
        domProcessing: entry.domComplete - entry.responseEnd,
      },
    });
  }

  /**
   * Add performance entry
   */
  private addEntry(entry: PerformanceEntry): void {
    this.entries.unshift(entry);

    // Keep only the most recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PWAMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance entries
   */
  getEntries(type?: string, limit?: number): PerformanceEntry[] {
    let filtered = this.entries;

    if (type) {
      filtered = this.entries.filter(entry => entry.type === type);
    }

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  /**
   * Get sync success rate
   */
  getSyncSuccessRate(): number {
    const total = this.metrics.syncOperations + this.metrics.syncFailures;
    return total > 0 ? this.metrics.syncOperations / total : 1;
  }

  /**
   * Get install conversion rate
   */
  getInstallConversionRate(): number {
    return this.metrics.installPromptShown > 0
      ? this.metrics.installAccepted / this.metrics.installPromptShown
      : 0;
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    metrics: PWAMetrics;
    rates: {
      cacheHitRate: number;
      syncSuccessRate: number;
      installConversionRate: number;
    };
    recentEntries: PerformanceEntry[];
  } {
    return {
      metrics: this.getMetrics(),
      rates: {
        cacheHitRate: this.getCacheHitRate(),
        syncSuccessRate: this.getSyncSuccessRate(),
        installConversionRate: this.getInstallConversionRate(),
      },
      recentEntries: this.getEntries(undefined, 50),
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      installPromptShown: 0,
      installAccepted: 0,
      installDismissed: 0,
      offlineUsage: 0,
      cacheHits: 0,
      cacheMisses: 0,
      syncOperations: 0,
      syncFailures: 0,
    };
    this.entries = [];
    this.saveMetrics();
  }

  /**
   * Export metrics data
   */
  exportData(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        entries: this.entries,
        timestamp: Date.now(),
      },
      null,
      2
    );
  }
}

// Lazy singleton initialization
let _pwaPerformance: PWAPerformanceMonitor | null = null;

export const pwaPerformance = {
  get instance(): PWAPerformanceMonitor | null {
    if (typeof window === 'undefined') return null;
    if (!_pwaPerformance) {
      _pwaPerformance = new PWAPerformanceMonitor();
    }
    return _pwaPerformance;
  },
};

// Utility functions for external use
export const trackPWAEvents = {
  installPromptShown: () => pwaPerformance.instance?.trackInstallPromptShown(),
  installAccepted: () => pwaPerformance.instance?.trackInstallAccepted(),
  installDismissed: () => pwaPerformance.instance?.trackInstallDismissed(),
  offlineUsage: () => pwaPerformance.instance?.trackOfflineUsage(),
  cacheHit: (resource?: string) => pwaPerformance.instance?.trackCacheHit(resource),
  cacheMiss: (resource?: string) => pwaPerformance.instance?.trackCacheMiss(resource),
  syncSuccess: (details?: Record<string, string | number | boolean>) => pwaPerformance.instance?.trackSyncSuccess(details),
  syncFailure: (details?: Record<string, string | number | boolean>) => pwaPerformance.instance?.trackSyncFailure(details),
};
