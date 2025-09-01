/**
 * Dashboard Hooks Module
 *
 * @description Hooks for dashboard functionality including data fetching,
 * calculations, and dashboard state management.
 */

// Main dashboard orchestrator
export { useDashboard } from './useDashboard';

// Specialized dashboard hooks
export { useDashboardApi } from './useDashboardApi';
export { useDashboardCalculations } from './useDashboardCalculations';

// Types are now exported from centralized @/types
export type {
  UseDashboardReturn,
  UseDashboardApiReturn,
  UseDashboardCalculationsReturn,
  DashboardStats,
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
  AgeGroup,
  DashboardResponse,
  ResidentData,
  SectoralInfo,
  DependencyRatioData,
  SexDistributionData,
} from '@/types';
