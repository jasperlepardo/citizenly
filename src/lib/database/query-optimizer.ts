/**
 * Database Query Optimizer
 * Performance optimization utilities for Supabase queries
 */

import { SupabaseClient } from '@supabase/supabase-js';

import { createLogger } from '@/lib/config/environment';
import { performanceMonitor } from '@/lib/monitoring/performance';

const logger = createLogger('QueryOptimizer');

interface QueryMetrics {
  queryName: string;
  executionTime: number;
  resultCount: number;
  cacheHit: boolean;
  timestamp: number;
}

interface QueryCache {
  data: any;
  timestamp: number;
  ttl: number;
  key: string;
}

interface OptimizedQueryOptions {
  cacheTTL?: number; // Cache time-to-live in ms
  enableCache?: boolean;
  enableMetrics?: boolean;
  timeout?: number;
  retryAttempts?: number;
  batchSize?: number;
}

class DatabaseQueryOptimizer {
  private queryCache: Map<string, QueryCache> = new Map();
  private queryMetrics: QueryMetrics[] = [];
  private maxCacheSize = 1000;
  private defaultCacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Execute an optimized query with caching and metrics
   */
  async executeQuery<T>(
    client: SupabaseClient,
    queryName: string,
    queryFn: () => Promise<{ data: T; error: any }>,
    options: OptimizedQueryOptions = {}
  ): Promise<{ data: T; error: any; fromCache?: boolean }> {
    const {
      cacheTTL = this.defaultCacheTTL,
      enableCache = true,
      enableMetrics = true,
      timeout = 10000,
      retryAttempts = 2,
    } = options;

    const cacheKey = this.generateCacheKey(queryName, queryFn.toString());
    const startTime = performance.now();

    // Check cache first
    if (enableCache) {
      const cachedResult = this.getCachedResult<T>(cacheKey);
      if (cachedResult) {
        if (enableMetrics) {
          this.recordMetrics({
            queryName,
            executionTime: performance.now() - startTime,
            resultCount: Array.isArray(cachedResult.data) ? cachedResult.data.length : 1,
            cacheHit: true,
            timestamp: Date.now(),
          });
        }

        logger.debug(`Cache hit for query: ${queryName}`, { cacheKey });
        return { ...cachedResult, fromCache: true };
      }
    }

    // Execute query with retry logic and timeout
    let lastError: any = null;

    for (let attempt = 1; attempt <= retryAttempts + 1; attempt++) {
      try {
        const result = await this.executeWithTimeout(queryFn, timeout);
        const executionTime = performance.now() - startTime;

        // Cache successful result
        if (enableCache && !result.error) {
          this.setCacheResult(cacheKey, result, cacheTTL);
        }

        // Record metrics
        if (enableMetrics) {
          this.recordMetrics({
            queryName,
            executionTime,
            resultCount: Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0,
            cacheHit: false,
            timestamp: Date.now(),
          });
        }

        // Log performance warnings
        if (executionTime > 2000) {
          logger.warn(`Slow query detected: ${queryName}`, {
            executionTime: Math.round(executionTime),
            attempt,
            cacheKey,
          });
        } else {
          logger.debug(`Query executed: ${queryName}`, {
            executionTime: Math.round(executionTime),
            resultCount: Array.isArray(result.data) ? result.data.length : 1,
          });
        }

        return { ...result, fromCache: false };
      } catch (error) {
        lastError = error;
        logger.warn(`Query attempt ${attempt} failed for ${queryName}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt,
        });

        // Wait before retry (exponential backoff)
        if (attempt <= retryAttempts) {
          await this.wait(Math.pow(2, attempt - 1) * 1000);
        }
      }
    }

    // All attempts failed
    const executionTime = performance.now() - startTime;

    if (enableMetrics) {
      this.recordMetrics({
        queryName,
        executionTime,
        resultCount: 0,
        cacheHit: false,
        timestamp: Date.now(),
      });
    }

    logger.error(`Query failed after ${retryAttempts + 1} attempts: ${queryName}`, {
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      executionTime: Math.round(executionTime),
    });

    return { data: null as T, error: lastError };
  }

  /**
   * Optimized batch query execution
   */
  async executeBatchQueries<T>(
    client: SupabaseClient,
    queries: Array<{
      name: string;
      queryFn: () => Promise<{ data: T; error: any }>;
      options?: OptimizedQueryOptions;
    }>,
    options: { concurrency?: number; failFast?: boolean } = {}
  ): Promise<Array<{ data: T; error: any; fromCache?: boolean }>> {
    const { concurrency = 5, failFast = false } = options;

    logger.info(`Executing batch queries`, {
      count: queries.length,
      concurrency,
      failFast,
    });

    const batches: (typeof queries)[] = [];
    for (let i = 0; i < queries.length; i += concurrency) {
      batches.push(queries.slice(i, i + concurrency));
    }

    const results: Array<{ data: T; error: any; fromCache?: boolean }> = [];

    for (const batch of batches) {
      try {
        const batchPromises = batch.map(({ name, queryFn, options }) =>
          this.executeQuery(client, name, queryFn, options)
        );

        const batchResults = await Promise.allSettled(batchPromises);

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({ data: null as T, error: result.reason });

            if (failFast) {
              logger.error('Batch query failed (fail-fast enabled)', {
                error: result.reason,
              });
              throw new Error(`Batch query failed: ${result.reason}`);
            }
          }
        }
      } catch (error) {
        if (failFast) {
          throw error;
        }
        logger.warn('Batch execution error (continuing)', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get dashboard statistics with optimized queries
   */
  async getDashboardStats(
    client: SupabaseClient,
    barangayCode: string,
    options: OptimizedQueryOptions = {}
  ) {
    const queryName = `dashboard_stats_${barangayCode}`;

    return this.executeQuery(
      client,
      queryName,
      async () => {
        // First try the pre-aggregated summary table
        const { data: summaryData, error: summaryError } = await client
          .from('system_dashboard_summaries')
          .select('*')
          .eq('barangay_code', barangayCode)
          .single();

        // If summary data exists and is recent (within 24 hours), use it
        if (summaryData && !summaryError) {
          const calculationDate = new Date(summaryData.calculation_date);
          const daysSinceCalc = (Date.now() - calculationDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceCalc < 1) {
            return { data: summaryData, error: null };
          }
        }

        // Fallback to real-time calculation if no summary data or data is stale
        logger.info(
          `No recent summary data found for barangay ${barangayCode}, calculating real-time stats`
        );

        const { data: realTimeData, error: realTimeError } = await client.rpc(
          'calculate_dashboard_stats',
          {
            p_barangay_code: barangayCode,
          }
        );

        // If RPC function doesn't exist, use direct queries
        if (realTimeError && realTimeError.message?.includes('function')) {
          logger.warn('Dashboard RPC function not found, using direct queries');
          return await this.calculateDashboardStatsDirectly(client, barangayCode);
        }

        return { data: realTimeData, error: realTimeError };
      },
      {
        cacheTTL: 2 * 60 * 1000, // 2 minutes cache for dashboard
        enableCache: true,
        ...options,
      }
    );
  }

  /**
   * Calculate dashboard statistics directly using queries
   */
  private async calculateDashboardStatsDirectly(
    client: SupabaseClient,
    barangayCode: string
  ): Promise<{ data: any; error: any }> {
    try {
      // Get basic counts using proper Supabase count syntax
      const { count: residentCount, error: residentError } = await client
        .from('residents')
        .select('households!inner(barangay_code)', { count: 'exact', head: true })
        .eq('households.barangay_code', barangayCode)
        .eq('is_active', true);

      if (residentError) {
        return { data: null, error: residentError };
      }

      const { count: householdCount, error: householdError } = await client
        .from('households')
        .select('*', { count: 'exact', head: true })
        .eq('barangay_code', barangayCode)
        .eq('is_active', true);

      if (householdError) {
        return { data: null, error: householdError };
      }

      // Calculate basic demographics
      const { data: demographics, error: demoError } = await client
        .from('residents')
        .select(
          `
          sex,
          birthdate,
          civil_status,
          employment_status,
          households!inner(barangay_code)
        `
        )
        .eq('households.barangay_code', barangayCode)
        .eq('is_active', true);

      if (demoError) {
        return { data: null, error: demoError };
      }

      const now = new Date();
      const stats = {
        barangay_code: barangayCode,
        calculation_date: now.toISOString().split('T')[0],
        total_residents: residentCount || 0,
        total_households: householdCount || 0,
        male_count: 0,
        female_count: 0,
        age_0_14: 0,
        age_15_64: 0,
        age_65_plus: 0,
        single_count: 0,
        married_count: 0,
        widowed_count: 0,
        divorced_separated_count: 0,
        employed_count: 0,
        unemployed_count: 0,
        student_count: 0,
        retired_count: 0,
      };

      // Calculate demographics
      if (demographics) {
        demographics.forEach((resident: any) => {
          // Sex distribution
          if (resident.sex === 'male') stats.male_count++;
          else if (resident.sex === 'female') stats.female_count++;

          // Age groups
          if (resident.birthdate) {
            const age = now.getFullYear() - new Date(resident.birthdate).getFullYear();
            if (age <= 14) stats.age_0_14++;
            else if (age <= 64) stats.age_15_64++;
            else stats.age_65_plus++;
          }

          // Civil status
          switch (resident.civil_status) {
            case 'single':
              stats.single_count++;
              break;
            case 'married':
              stats.married_count++;
              break;
            case 'widowed':
              stats.widowed_count++;
              break;
            case 'divorced':
            case 'separated':
              stats.divorced_separated_count++;
              break;
          }

          // Employment status
          switch (resident.employment_status) {
            case 'employed':
            case 'self_employed':
              stats.employed_count++;
              break;
            case 'unemployed':
            case 'underemployed':
            case 'looking_for_work':
              stats.unemployed_count++;
              break;
            case 'student':
              stats.student_count++;
              break;
            case 'retired':
              stats.retired_count++;
              break;
          }
        });
      }

      return { data: stats, error: null };
    } catch (error) {
      logger.error('Direct dashboard stats calculation failed', { error, barangayCode });
      return { data: null, error };
    }
  }

  /**
   * Get resident data with pagination optimization
   */
  async getResidentsWithPagination(
    client: SupabaseClient,
    barangayCode: string,
    page: number = 1,
    limit: number = 50,
    options: OptimizedQueryOptions = {}
  ) {
    const offset = (page - 1) * limit;
    const queryName = `residents_paginated_${barangayCode}_${page}_${limit}`;

    return this.executeQuery(
      client,
      queryName,
      async () => {
        // Optimized query with specific columns and joins
        const { data, error } = await client
          .from('residents')
          .select(
            `
            id,
            first_name,
            last_name,
            middle_name,
            birthdate,
            sex,
            civil_status,
            employment_status,
            household_code,
            households!inner(barangay_code)
          `
          )
          .eq('households.barangay_code', barangayCode)
          .eq('is_active', true)
          .order('last_name', { ascending: true })
          .range(offset, offset + limit - 1);

        return { data, error };
      },
      {
        cacheTTL: 1 * 60 * 1000, // 1 minute cache for resident lists
        enableCache: true,
        ...options,
      }
    );
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(queryName: string, queryString: string): string {
    const hash = this.simpleHash(queryString);
    return `${queryName}_${hash}`;
  }

  /**
   * Get cached result if valid
   */
  private getCachedResult<T>(cacheKey: string): { data: T; error: any } | null {
    const cached = this.queryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return { data: cached.data, error: null };
    }

    // Clean expired cache
    if (cached) {
      this.queryCache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Set cached result
   */
  private setCacheResult(cacheKey: string, result: any, ttl: number): void {
    // Clean cache if at capacity
    if (this.queryCache.size >= this.maxCacheSize) {
      this.cleanExpiredCache();
    }

    this.queryCache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now(),
      ttl,
      key: cacheKey,
    });
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.queryCache.forEach((cache, key) => {
      if (now - cache.timestamp >= cache.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.queryCache.delete(key);
    });

    logger.debug(`Cleaned ${expiredKeys.length} expired cache entries`);
  }

  /**
   * Record query metrics
   */
  private recordMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // Keep only last 1000 metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }

    // Track performance metrics
    performanceMonitor.endMetric(`db_query_${metrics.queryName}`, {
      executionTime: metrics.executionTime,
      resultCount: metrics.resultCount,
      cacheHit: metrics.cacheHit,
    });
  }

  /**
   * Execute query with timeout
   */
  private executeWithTimeout<T>(queryFn: () => Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Query timeout after ${timeout}ms`));
      }, timeout);

      queryFn()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Utility wait function
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get query performance metrics
   */
  getMetrics(): {
    totalQueries: number;
    averageExecutionTime: number;
    cacheHitRate: number;
    slowQueries: QueryMetrics[];
    recentQueries: QueryMetrics[];
  } {
    const totalQueries = this.queryMetrics.length;
    const totalExecutionTime = this.queryMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const cacheHits = this.queryMetrics.filter(m => m.cacheHit).length;
    const slowQueries = this.queryMetrics.filter(m => m.executionTime > 2000);
    const recentQueries = this.queryMetrics.slice(-10);

    return {
      totalQueries,
      averageExecutionTime: totalQueries > 0 ? totalExecutionTime / totalQueries : 0,
      cacheHitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
      slowQueries,
      recentQueries,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.queryCache.clear();
    logger.info('Query cache cleared');
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.queryMetrics = [];
    logger.info('Query metrics cleared');
  }
}

// Export singleton instance
export const queryOptimizer = new DatabaseQueryOptimizer();

export default queryOptimizer;
