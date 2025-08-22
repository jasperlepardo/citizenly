/**
 * Dashboard Hooks Module
 * 
 * @description Hooks for dashboard functionality including data fetching,
 * calculations, and dashboard state management.
 */

// Main dashboard orchestrator
export { useDashboard } from './useDashboard';
export type { UseDashboardReturn } from './useDashboard';

// Specialized dashboard hooks
export { useDashboardApi } from './useDashboardApi';
export { useDashboardCalculations } from './useDashboardCalculations';

// Types from API module
export type { 
  DashboardStats,
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
  AgeGroup,
  DashboardResponse
} from './useDashboardApi';

// Types from calculations module
export type { 
  ResidentData,
  UseDashboardCalculationsReturn
} from './useDashboardCalculations';