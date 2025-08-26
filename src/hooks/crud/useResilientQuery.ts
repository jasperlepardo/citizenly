/**
 * Resilient Query Hook
 * Enhanced React Query wrapper with retry mechanisms and error recovery
 */

import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { clientLogger } from '@/lib/logging/client-logger';
import { performanceMonitor } from '@/lib/monitoring/performance';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: (attempt: number) => number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

interface ResilientQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'retry' | 'retryDelay'> {
  retryConfig?: RetryConfig;
  performanceTracking?: {
    enabled?: boolean;
    operationName?: string;
  };
  fallbackData?: TData;
  errorNotification?: {
    enabled?: boolean;
    title?: string;
    message?: (error: any) => string;
  };
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000), // Exponential backoff
  retryCondition: (error: any) => {
    // Retry on network errors, 5xx errors, but not on 4xx client errors
    if (error?.message?.includes('fetch')) return true;
    if (error?.status >= 500) return true;
    if (error?.status >= 400 && error?.status < 500) return false;
    return true;
  },
  onRetry: (error: any, attempt: number) => {
    clientLogger.warn(`Query retry attempt ${attempt}`, {
      error: error,
      action: 'query_retry',
      data: { attempt }
    });
  }
};

/**
 * Enhanced useQuery hook with retry mechanisms and performance tracking
 */
export function useResilientQuery<TData = unknown>(
  options: ResilientQueryOptions<TData>
): ReturnType<typeof useQuery<TData>> & {
  retryManually: () => void;
  clearError: () => void;
  getMetrics: () => any;
} {
  const queryClient = useQueryClient();
  const metricsRef = useRef({
    totalAttempts: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageResponseTime: 0,
    lastError: null as any
  });

  const {
    retryConfig = {},
    performanceTracking = { enabled: true },
    fallbackData,
    errorNotification = { enabled: false },
    ...queryOptions
  } = options;

  const finalRetryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

  // Enhanced query function with performance tracking
  const enhancedQueryFn = useCallback(async (context: any) => {
    const operationName = performanceTracking.operationName || 
      `query_${Array.isArray(options.queryKey) ? options.queryKey.join('_') : 'unknown'}`;

    performanceMonitor.startMetric(operationName);
    metricsRef.current.totalAttempts++;

    try {
      const startTime = performance.now();
      if (!options.queryFn || typeof options.queryFn !== 'function') {
        throw new Error('Query function is required but not provided');
      }
      
      const result = await options.queryFn(context);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Update metrics
      metricsRef.current.successfulQueries++;
      metricsRef.current.averageResponseTime = 
        (metricsRef.current.averageResponseTime + duration) / 2;

      performanceMonitor.endMetric(operationName);
      
      clientLogger.info(`Query successful: ${operationName}`, {
        action: 'query_success',
        data: {
          duration: Math.round(duration),
          attempt: context.meta?.attempt || 1
        }
      });

      return result;
    } catch (error) {
      metricsRef.current.failedQueries++;
      metricsRef.current.lastError = error;
      performanceMonitor.endMetric(operationName);
      
      clientLogger.error(`Query failed: ${operationName}`, {
        error: error instanceof Error ? error : new Error(String(error)),
        action: 'query_error',
        data: {
          attempt: context.meta?.attempt || 1
        }
      });

      throw error;
    }
  }, [options.queryFn, performanceTracking.operationName, options.queryKey]);

  // Enhanced query with retry logic
  const query = useQuery({
    ...queryOptions,
    queryFn: enhancedQueryFn,
    retry: (failureCount, error) => {
      if (failureCount >= finalRetryConfig.maxRetries) {
        return false;
      }
      
      const shouldRetry = finalRetryConfig.retryCondition(error);
      if (shouldRetry) {
        finalRetryConfig.onRetry(error, failureCount + 1);
      }
      
      return shouldRetry;
    },
    retryDelay: finalRetryConfig.retryDelay,
  });

  // Handle errors through useEffect (since onError was removed from React Query)
  useEffect(() => {
    if (query.error) {
      // Call original onError if provided
      const onError = (options as any).onError;
      if (onError && typeof onError === 'function') {
        onError(query.error);
      }

      // Show error notification if enabled
      if (errorNotification.enabled) {
        const title = errorNotification.title || 'Query Error';
        const message = errorNotification.message 
          ? errorNotification.message(query.error)
          : query.error instanceof Error 
            ? query.error.message 
            : 'An unexpected error occurred';

        clientLogger.error(title, {
          error: query.error instanceof Error ? query.error : new Error(String(query.error)),
          action: 'query_error_notification'
        });
      }
    }
  }, [query.error, errorNotification.enabled, errorNotification.title, errorNotification.message]);

  // Manual retry function
  const retryManually = useCallback(() => {
    clientLogger.info('Manual retry triggered', {
      action: 'manual_retry',
      data: {
        queryKey: options.queryKey
      }
    });
    query.refetch();
  }, [query, options.queryKey]);

  // Clear error function
  const clearError = useCallback(() => {
    queryClient.setQueryData(options.queryKey!, (oldData: any) => oldData);
    metricsRef.current.lastError = null;
  }, [queryClient, options.queryKey]);

  // Get metrics function
  const getMetrics = useCallback(() => {
    return {
      ...metricsRef.current,
      successRate: metricsRef.current.totalAttempts > 0 
        ? (metricsRef.current.successfulQueries / metricsRef.current.totalAttempts) * 100
        : 0
    };
  }, []);

  return {
    ...query,
    retryManually,
    clearError,
    getMetrics
  };
}

/**
 * Hook for managing multiple resilient queries
 */
export function useResilientQueries<TData = unknown>(
  queries: ResilientQueryOptions<TData>[],
  options?: {
    parallel?: boolean;
    failFast?: boolean;
  }
) {
  const { parallel = true, failFast = false } = options || {};
  
  const results = queries.map((queryOptions, index) => {
    return useResilientQuery({
      ...queryOptions,
      enabled: parallel ? queryOptions.enabled : (
        queryOptions.enabled && (index === 0 || queries[index - 1])
      ) as any
    });
  });

  // Aggregate metrics
  const aggregateMetrics = useCallback(() => {
    return results.reduce((acc, result) => {
      const metrics = result.getMetrics();
      return {
        totalQueries: acc.totalQueries + 1,
        totalAttempts: acc.totalAttempts + metrics.totalAttempts,
        successfulQueries: acc.successfulQueries + metrics.successfulQueries,
        failedQueries: acc.failedQueries + metrics.failedQueries,
        averageResponseTime: (acc.averageResponseTime + metrics.averageResponseTime) / 2
      };
    }, {
      totalQueries: 0,
      totalAttempts: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0
    });
  }, [results]);

  return {
    results,
    isLoading: results.some(r => r.isLoading),
    isError: failFast ? results.some(r => r.isError) : results.every(r => r.isError),
    errors: results.map(r => r.error).filter(Boolean),
    retryAll: () => results.forEach(r => r.retryManually()),
    clearAllErrors: () => results.forEach(r => r.clearError()),
    getAggregateMetrics: aggregateMetrics
  };
}