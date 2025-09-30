/**
 * Dashboard API Hook
 *
 * @description Handles API calls and data fetching for dashboard statistics.
 * Extracted from useDashboard for better separation of concerns.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { useAsyncErrorBoundary } from '@/hooks/utilities/useAsyncErrorBoundary';
import { logger } from '@/hooks/utilities/useLogger';
import { useRetryLogic, RetryStrategies } from '@/hooks/utilities/useRetryLogic';
import { supabase } from '@/lib/data/supabase';

import type {
  DashboardResponse,
  UseDashboardApiReturn
} from '@/types/app/dashboard/dashboard';

// Interfaces moved to centralized types

// DashboardResponse interface moved to centralized types

/**
 * API function to fetch dashboard data
 */
export async function fetchDashboardStats(): Promise<DashboardResponse> {
  // Get current session to pass auth token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No valid session found');
  }

  const response = await fetch('/api/dashboard/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// UseDashboardApiReturn interface moved to centralized types

/**
 * Hook for dashboard API operations
 *
 * @description Provides dashboard data fetching with React Query integration.
 * Handles authentication, caching, and error states with advanced retry logic.
 */
export function useDashboardApi(): UseDashboardApiReturn {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  // Advanced retry logic for critical dashboard operations
  const retryLogic = useRetryLogic({
    ...RetryStrategies.standard,
    name: 'DashboardAPI',
    shouldRetry: (error: Error) => {
      // Don't retry on authentication errors
      if (
        error.message.includes('No valid session') ||
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        return false;
      }
      // Don't retry on client errors (4xx)
      if (error.message.includes('400') || error.message.includes('404')) {
        return false;
      }
      // Retry on network errors and server errors (5xx)
      return true;
    },
    onSuccess: (result: any, attempt: number) => {
      if (attempt > 0) {
        logger.info('useDashboardApi', 'Dashboard API retry succeeded', {
          attempts: attempt + 1,
          operation: 'dashboard-fetch',
        });
      }
    },
    onError: (error: Error, attempt: number) => {
      logger.warn('useDashboardApi', 'Dashboard API retry attempt failed', {
        attempt: attempt + 1,
        error: error.message,
        operation: 'dashboard-fetch',
      });
    },
    onMaxAttemptsReached: (error: Error) => {
      logger.error('useDashboardApi', 'Dashboard API max retry attempts reached', {
        error: error.message,
        operation: 'dashboard-fetch',
        maxAttempts: RetryStrategies.standard.maxAttempts,
      });
    },
  });

  // Error boundary for critical dashboard operations
  const { wrapAsync, errorState } = useAsyncErrorBoundary({
    onError: (error: Error, errorInfo: any) => {
      // Log critical dashboard errors for monitoring
      logger.error('useDashboardApi', 'Dashboard API critical error', {
        error: error.message,
        errorInfo,
        operation: 'dashboard-fetch',
        userId: user?.id,
      });
    },
    enableRecovery: false, // Let our retry logic handle retries
    maxRetries: 0,
  });

  // Enhanced fetch function with retry logic
  const fetchWithRetry = async (): Promise<DashboardResponse> => {
    return retryLogic.execute(async () => {
      const result = await wrapAsync(fetchDashboardStats, 'dashboard stats fetch')();
      if (result === null) {
        throw new Error('Dashboard data fetch returned null');
      }
      return result;
    });
  };

  const query = useQuery({
    queryKey: ['dashboard', 'stats', userProfile?.barangay_code],
    queryFn: fetchWithRetry,
    enabled: !!user && !!userProfile?.barangay_code,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable React Query retry since we handle it ourselves
  });

  return {
    data: query.data,
    isLoading: query.isLoading || retryLogic.state.isRetrying,
    error: query.error || errorState.error || retryLogic.state.lastError,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    isFetching: query.isFetching,
  };
}

// Export for backward compatibility
export default useDashboardApi;
