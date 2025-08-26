import { supabase , logError } from '@/lib';

/**
 * Database utility functions for optimized operations
 */

export interface QuickStats {
  barangay_code: string;
  total_residents: number;
  senior_citizens: number;
  pwd_count: number;
  registered_voters: number; // Uses is_voter column
  ofw_count: number;
  avg_age: number;
}

/**
 * Get barangay statistics from materialized view (fast cached data)
 */
export const getBarangayQuickStats = async (barangayCode: string): Promise<QuickStats | null> => {
  try {
    const { data, error } = await supabase
      .from('barangay_quick_stats')
      .select('*')
      .eq('barangay_code', barangayCode)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error('Failed to get barangay quick stats'),
      'GET_BARANGAY_QUICK_STATS'
    );
    return null;
  }
};

/**
 * Refresh materialized view for updated statistics
 * This should be called periodically (e.g., daily, weekly) or after bulk data changes
 */
export const refreshBarangayStats = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('refresh_barangay_stats');

    if (error) {
      throw error;
    }

    // Record the refresh time in localStorage
    const now = new Date().toISOString();
    localStorage.setItem('last_refresh_24h', now);
    localStorage.setItem('last_refresh_6h', now);
    localStorage.setItem('last_refresh_1h', now);

    return true;
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error('Failed to refresh barangay stats'),
      'REFRESH_BARANGAY_STATS'
    );
    return false;
  }
};

/**
 * Check if materialized view needs refresh (based on data freshness)
 * Returns true if stats should be refreshed
 * Note: This is a simplified check - in production you might want to track refresh times
 */
export const shouldRefreshStats = async (maxAgeHours: number = 24): Promise<boolean> => {
  try {
    // For now, we'll refresh if the materialized view is empty or we get any error
    // In a production system, you might want to add a separate table to track refresh times
    const { data, error } = await supabase
      .from('barangay_quick_stats')
      .select('barangay_code')
      .limit(1);

    if (error) {
      // If there's an error accessing the view, we should refresh
      return true;
    }

    if (!data || data.length === 0) {
      // If the view is empty, we should refresh
      return true;
    }

    // For now, we'll use a simple time-based refresh strategy
    // You could enhance this by storing last refresh time in a separate table
    const refreshKey = `last_refresh_${maxAgeHours}h`;
    const lastRefreshTime = localStorage.getItem(refreshKey);

    if (!lastRefreshTime) {
      // No record of last refresh, assume we need one
      return true;
    }

    const lastRefresh = new Date(lastRefreshTime);
    const maxAge = new Date();
    maxAge.setHours(maxAge.getHours() - maxAgeHours);

    return lastRefresh < maxAge;
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error('Failed to check stats refresh time'),
      'CHECK_STATS_REFRESH_TIME'
    );
    // If we can't check, assume we need refresh
    return true;
  }
};

/**
 * Smart stats loader: Uses materialized view if fresh, falls back to real-time if needed
 */
export const getBarangayStatsOptimized = async (
  barangayCode: string,
  allowStaleHours: number = 24
): Promise<QuickStats | null> => {
  try {
    // First try to get stats from materialized view
    const quickStats = await getBarangayQuickStats(barangayCode);

    if (quickStats) {
      // Check if we should refresh in the background
      const needsRefresh = await shouldRefreshStats(allowStaleHours);

      if (needsRefresh) {
        // Refresh asynchronously (don't wait for it)
        refreshBarangayStats().then(success => {
          if (success) {
            console.log('Barangay stats refreshed in background');
          }
        });
      }

      return quickStats;
    }

    // If no materialized view data, refresh and try again
    const refreshed = await refreshBarangayStats();
    if (refreshed) {
      return await getBarangayQuickStats(barangayCode);
    }

    return null;
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error('Failed to get optimized barangay stats'),
      'GET_BARANGAY_STATS_OPTIMIZED'
    );
    return null;
  }
};

/**
 * Performance monitoring: Get database table stats
 */
export const getDatabasePerformanceStats = async () => {
  try {
    const { data, error } = await supabase.from('performance_overview').select('*');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    logError(
      error instanceof Error ? error : new Error('Failed to get performance stats'),
      'GET_PERFORMANCE_STATS'
    );
    return null;
  }
};

/**
 * Batch operations utility for large data operations
 */
export const performBatchOperation = async <T>(
  items: T[],
  batchSize: number,
  operation: (batch: T[]) => Promise<void>
): Promise<void> => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await operation(batch);

    // Small delay to prevent overwhelming the database
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};

/**
 * Type guard for checking if data is fresh enough
 */
export const isDataFresh = (timestamp: string | Date, maxAgeMinutes: number): boolean => {
  const dataTime = new Date(timestamp);
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - maxAgeMinutes);

  return dataTime > cutoff;
};
