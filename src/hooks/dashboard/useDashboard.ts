'use client';

/**
 * Dashboard Hook (Refactored)
 * 
 * @description Lightweight orchestrator for dashboard functionality.
 * Composes specialized hooks for better maintainability.
 * 
 * Architecture:
 * - useDashboardApi: API calls and data fetching
 * - useDashboardCalculations: Data processing and calculations
 */

import { useMemo } from 'react';
import { 
  useDashboardApi, 
  type DashboardResponse,
  type DashboardStats,
  type AgeGroup 
} from './useDashboardApi';
import { 
  useDashboardCalculations,
  type UseDashboardCalculationsReturn 
} from './useDashboardCalculations';

/**
 * Return type for dashboard hook
 */
export interface UseDashboardReturn {
  /** Raw dashboard data from API */
  data: DashboardResponse | undefined;
  /** Dashboard statistics */
  stats: DashboardStats | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch function */
  refetch: () => void;
  /** Refetching state */
  isRefetching: boolean;
  /** Fetching state */
  isFetching: boolean;
  /** Processed calculations */
  calculations: UseDashboardCalculationsReturn;
}

/**
 * Dashboard hook (Refactored)
 * 
 * @description Orchestrates dashboard data fetching and processing.
 * Much smaller and more maintainable than the original implementation.
 */
export function useDashboard(): UseDashboardReturn {
  // API data fetching
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    isFetching,
  } = useDashboardApi();

  // Extract residents data for calculations
  const residentsData = useMemo(() => {
    return data?.residentsData || [];
  }, [data?.residentsData]);

  // Data processing and calculations
  const calculations = useDashboardCalculations(residentsData);

  return {
    data,
    stats: data?.stats,
    isLoading,
    error,
    refetch,
    isRefetching,
    isFetching,
    calculations,
  };
}

// Re-export types and utilities for convenience
export type { 
  DashboardStats, 
  AgeGroup, 
  DashboardResponse,
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData 
} from './useDashboardApi';
export type { 
  ResidentData,
  UseDashboardCalculationsReturn 
} from './useDashboardCalculations';
export { 
  calculateAge, 
  getAgeGroup, 
  processPopulationData,
  calculateDependencyRatios,
  calculateSexDistribution,
  STANDARD_AGE_GROUPS 
} from './useDashboardCalculations';

// Export for backward compatibility
export default useDashboard;