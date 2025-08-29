/**
 * Command Menu Analytics & Performance Monitoring
 * Production-ready tracking for command menu usage and performance
 */

import { logger } from '@/lib';
import type {
  CommandMenuAnalyticsEvent as ImportedCommandMenuAnalyticsEvent,
  CommandMenuPerformanceMetrics,
} from '@/types/services';

// Analytics event types
export interface CommandMenuAnalyticsEvent {
  type: 'search' | 'navigation' | 'action' | 'error' | 'performance';
  timestamp: number;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

// In-memory analytics store (would be replaced with proper analytics service in production)
class CommandMenuAnalytics {
  private events: CommandMenuAnalyticsEvent[] = [];
  private metrics: CommandMenuPerformanceMetrics = {
    searchLatency: 0,
    cacheHitRate: 0,
    errorRate: 0,
    usageFrequency: 0,
  };
  private searchTimes = new Map<string, number>();
  private cacheStats = { hits: 0, misses: 0 };
  private errorCount = 0;
  private totalEvents = 0;

  // Track search performance
  trackSearchStart(query: string): string {
    const searchId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.searchTimes.set(searchId, performance.now());
    return searchId;
  }

  trackSearchComplete(
    searchId: string,
    query: string,
    resultCount: number,
    fromCache = false
  ): void {
    const startTime = this.searchTimes.get(searchId);
    if (startTime) {
      const latency = performance.now() - startTime;
      this.searchTimes.delete(searchId);

      // Update cache stats
      if (fromCache) {
        this.cacheStats.hits++;
      } else {
        this.cacheStats.misses++;
      }

      // Update metrics
      this.metrics.searchLatency = (this.metrics.searchLatency + latency) / 2; // Running average
      this.metrics.cacheHitRate =
        this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);

      // Track event
      this.trackEvent({
        type: 'performance',
        timestamp: Date.now(),
        data: {
          action: 'search_complete',
          query: query.slice(0, 50), // Truncate for privacy
          latency,
          resultCount,
          fromCache,
          cacheHitRate: this.metrics.cacheHitRate,
        },
      });

      // Log slow searches for optimization
      if (latency > 1000) {
        logger.warn('Slow command menu search detected', {
          latency,
          query: query.slice(0, 50),
          resultCount,
          fromCache,
        });
      }
    }
  }

  // Track user interactions
  trackSearch(query: string, resultCount: number): void {
    this.trackEvent({
      type: 'search',
      timestamp: Date.now(),
      data: {
        query: query.slice(0, 50), // Truncate for privacy
        queryLength: query.length,
        resultCount,
        hasResults: resultCount > 0,
      },
    });
  }

  trackNavigation(itemId: string, itemType: string, href: string): void {
    this.trackEvent({
      type: 'navigation',
      timestamp: Date.now(),
      data: {
        itemId,
        itemType,
        href: href.slice(0, 100), // Truncate for security
        source: 'command_menu',
      },
    });
  }

  trackAction(actionId: string, actionType: string, success = true): void {
    this.trackEvent({
      type: 'action',
      timestamp: Date.now(),
      data: {
        actionId,
        actionType,
        success,
        source: 'command_menu',
      },
    });
  }

  trackWorkflowSuggestion(suggestionId: string, query: string, suggestionTitle: string): void {
    this.trackEvent({
      type: 'action',
      timestamp: Date.now(),
      data: {
        actionId: suggestionId,
        actionType: 'workflow_suggestion',
        success: true,
        source: 'command_menu',
        query: query.slice(0, 50),
        suggestionTitle: suggestionTitle.slice(0, 100),
        context: 'no_results_found',
      },
    });
  }

  trackError(error: Error, context: Record<string, any> = {}): void {
    this.errorCount++;
    this.metrics.errorRate = this.errorCount / Math.max(this.totalEvents, 1);

    this.trackEvent({
      type: 'error',
      timestamp: Date.now(),
      data: {
        error: error.message,
        errorType: error.name,
        context: {
          ...context,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        },
      },
    });

    // Log critical errors
    if (this.metrics.errorRate > 0.1) {
      logger.error('High command menu error rate detected', {
        errorRate: this.metrics.errorRate,
        recentError: error.message,
      });
    }
  }

  // Internal event tracking
  private trackEvent(event: Omit<CommandMenuAnalyticsEvent, 'userId' | 'sessionId'>): void {
    this.totalEvents++;

    // Add session context if available
    const fullEvent: CommandMenuAnalyticsEvent = {
      ...event,
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
    };

    this.events.push(fullEvent);

    // Keep only recent events to prevent memory leaks
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500); // Keep last 500 events
    }

    // Update usage frequency
    this.updateUsageFrequency();

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsService(fullEvent);
    }
  }

  private updateUsageFrequency(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentEvents = this.events.filter(e => e.timestamp > oneHourAgo);
    this.metrics.usageFrequency = recentEvents.length;
  }

  private getSessionId(): string {
    // Simple session ID - in production would use proper session management
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('command-menu-session');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('command-menu-session', sessionId);
      }
      return sessionId;
    }
    return 'server-session';
  }

  private getUserId(): string | undefined {
    // Would integrate with actual auth system
    // For now, return undefined for privacy
    return undefined;
  }

  private sendToAnalyticsService(event: CommandMenuAnalyticsEvent): void {
    // In production, would send to analytics service like Google Analytics, Mixpanel, etc.
    // For now, just log for monitoring
    if (event.type === 'error' || event.type === 'performance') {
      logger.info('Command menu analytics event', {
        type: event.type,
        timestamp: event.timestamp,
        data: event.data,
      });
    }
  }

  // Get current metrics for monitoring dashboards
  getMetrics(): CommandMenuPerformanceMetrics {
    return { ...this.metrics };
  }

  // Get recent events for debugging
  getRecentEvents(count = 50): CommandMenuAnalyticsEvent[] {
    return this.events.slice(-count);
  }

  // Health check for monitoring
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: CommandMenuPerformanceMetrics;
  } {
    const metrics = this.getMetrics();
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Determine health based on metrics
    if (metrics.errorRate > 0.2 || metrics.searchLatency > 2000) {
      status = 'critical';
    } else if (
      metrics.errorRate > 0.1 ||
      metrics.searchLatency > 1000 ||
      metrics.cacheHitRate < 0.3
    ) {
      status = 'warning';
    }

    return { status, metrics };
  }
}

// Global analytics instance
export const commandMenuAnalytics = new CommandMenuAnalytics();

// Convenience functions
export const trackCommandMenuSearch = (query: string, resultCount: number) =>
  commandMenuAnalytics.trackSearch(query, resultCount);

export const trackCommandMenuNavigation = (itemId: string, itemType: string, href: string) =>
  commandMenuAnalytics.trackNavigation(itemId, itemType, href);

export const trackCommandMenuAction = (actionId: string, actionType: string, success = true) =>
  commandMenuAnalytics.trackAction(actionId, actionType, success);

export const trackWorkflowSuggestion = (
  suggestionId: string,
  query: string,
  suggestionTitle: string
) => commandMenuAnalytics.trackWorkflowSuggestion(suggestionId, query, suggestionTitle);

export const trackCommandMenuError = (error: Error, context: Record<string, any> = {}) =>
  commandMenuAnalytics.trackError(error, context);

export const startCommandMenuSearchTimer = (query: string) =>
  commandMenuAnalytics.trackSearchStart(query);

export const endCommandMenuSearchTimer = (
  searchId: string,
  query: string,
  resultCount: number,
  fromCache = false
) => commandMenuAnalytics.trackSearchComplete(searchId, query, resultCount, fromCache);

// Health monitoring export
export const getCommandMenuHealth = () => commandMenuAnalytics.getHealthStatus();
