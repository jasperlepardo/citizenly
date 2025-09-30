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

// Import types directly from the dashboard types file when needed
// Example: import type { UseDashboardReturn } from '@/types/app/dashboard/dashboard';
