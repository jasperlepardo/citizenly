/**
 * Dashboard API Hook
 * 
 * @description Handles API calls and data fetching for dashboard statistics.
 * Extracted from useDashboard for better separation of concerns.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, logger } from '@/lib';
import { useAuth } from '@/contexts';
import { useAsyncErrorBoundary } from '../utilities/useAsyncErrorBoundary';
import { useRetryLogic, RetryStrategies } from '../utilities/useRetryLogic';

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  residents: number;
  households: number;
  businesses: number;
  certifications: number;
  seniorCitizens: number;
  employedResidents: number;
}

/**
 * Age group interface
 */
export interface AgeGroup {
  ageRange: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Dependency data interface
 */
export interface DependencyData {
  youngDependents: number; // 0-14
  workingAge: number; // 15-64
  oldDependents: number; // 65+
}

/**
 * Sex distribution interface
 */
export interface SexData {
  male: number;
  female: number;
}

/**
 * Civil status data interface
 */
export interface CivilStatusData {
  single: number;
  married: number;
  widowed: number;
  divorced: number;
  separated: number;
  annulled: number;
  registeredPartnership: number;
  liveIn: number;
}

/**
 * Employment status data interface
 */
export interface EmploymentStatusData {
  employed: number;
  unemployed: number;
  selfEmployed: number;
  student: number;
  retired: number;
  homemaker: number;
  disabled: number;
  other: number;
}

/**
 * Dashboard API response interface
 */
export interface DashboardResponse {
  stats: DashboardStats;
  demographics: {
    ageGroups: DependencyData;
    sexDistribution: SexData;
    civilStatus: {
      single: number;
      married: number;
      widowed: number;
      divorced: number;
    };
    employment: {
      laborForce: number;
      employed: number;
      unemployed: number;
    };
    specialCategories: {
      pwd: number;
      soloParents: number;
      ofw: number;
      indigenous: number;
      outOfSchoolChildren: number;
      outOfSchoolYouth: number;
      registeredSeniorCitizens: number;
      migrants: number;
    };
  };
  residentsData: {
    birthdate: string;
    sex: string;
    civil_status: string;
    employment_status: string;
    is_labor_force_employed?: boolean;
    resident_sectoral_info?: {
      is_labor_force: boolean;
      is_labor_force_employed: boolean;
      is_unemployed: boolean;
      is_overseas_filipino_worker: boolean;
      is_person_with_disability: boolean;
      is_out_of_school_children: boolean;
      is_out_of_school_youth: boolean;
      is_senior_citizen: boolean;
      is_registered_senior_citizen: boolean;
      is_solo_parent: boolean;
      is_indigenous_people: boolean;
      is_migrant: boolean;
    }[];
  }[];
}

/**
 * API function to fetch dashboard data
 */
export async function fetchDashboardStats(): Promise<DashboardResponse> {
  // Get current session to pass auth token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No valid session found');
  }

  const response = await fetch('/api/dashboard/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Return type for dashboard API hook
 */
export interface UseDashboardApiReturn {
  data: DashboardResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
  isFetching: boolean;
}

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
      if (error.message.includes('No valid session') || error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Don't retry on client errors (4xx)
      if (error.message.includes('400') || error.message.includes('404')) {
        return false;
      }
      // Retry on network errors and server errors (5xx)
      return true;
    },
    onSuccess: (result, attempt) => {
      if (attempt > 0) {
        logger.info('Dashboard API retry succeeded', {
          attempts: attempt + 1,
          operation: 'dashboard-fetch'
        });
      }
    },
    onError: (error, attempt) => {
      logger.warn('Dashboard API retry attempt failed', {
        attempt: attempt + 1,
        error: error.message,
        operation: 'dashboard-fetch'
      });
    },
    onMaxAttemptsReached: (error) => {
      logger.error('Dashboard API max retry attempts reached', {
        error: error.message,
        operation: 'dashboard-fetch',
        maxAttempts: RetryStrategies.standard.maxAttempts
      });
    },
  });

  // Error boundary for critical dashboard operations
  const { wrapAsync, errorState } = useAsyncErrorBoundary({
    onError: (error, errorInfo) => {
      // Log critical dashboard errors for monitoring
      logger.error('Dashboard API critical error', {
        error: error.message,
        errorInfo,
        operation: 'dashboard-fetch',
        userId: user?.id
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