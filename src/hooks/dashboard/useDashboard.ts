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

import { useDashboardApi } from './useDashboardApi';
import { useDashboardCalculations } from './useDashboardCalculations';
import type { UseDashboardReturn } from '@/types';

/**
 * Dashboard hook (Refactored)
 *
 * @description Orchestrates dashboard data fetching and processing.
 * Much smaller and more maintainable than the original implementation.
 */
export function useDashboard(): UseDashboardReturn {
  // API data fetching
  const { data, isLoading, error, refetch, isRefetching, isFetching } = useDashboardApi();

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

// Types are now exported from centralized @/types
// Utility functions can still be imported from useDashboardCalculations
export {
  calculateAge,
  getAgeGroup,
  processPopulationData,
  calculateDependencyRatios,
  calculateSexDistribution,
  STANDARD_AGE_GROUPS,
} from './useDashboardCalculations';

// Export for backward compatibility
export default useDashboard;
