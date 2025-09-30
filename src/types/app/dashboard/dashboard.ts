/**
 * Dashboard Types
 * Legacy types for dashboard hooks
 */

// Dashboard hook return types
export interface UseDashboardReturn {
  data: any;
  stats: DashboardStats | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
  isFetching: boolean;
  calculations: UseDashboardCalculationsReturn;
}

export interface UseDashboardApiReturn {
  data: any;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
  isFetching: boolean;
}

export interface UseDashboardCalculationsReturn {
  stats: DashboardStats;
  charts: any;
  sexDistribution: SexDistributionData;
  civilStatusData: CivilStatusData;
  employmentData: EmploymentStatusData;
  populationData: import('@/types/shared/hooks/dashboardHooks').AgeGroup[];
  dependencyData: DependencyRatioData;
  totalPopulation: number;
}

// Data types
export interface DashboardStats {
  totalResidents: number;
  totalHouseholds: number;
  totalFamilies: number;
  averageHouseholdSize: number;
  // Additional properties accessed by dashboard page
  residents: number;
  households: number;
  seniorCitizens: number;
  employedResidents: number;
}

export interface AgeGroup {
  range: string;
  count: number;
}

export interface DashboardResponse {
  success: boolean;
  data: any;
}

export interface ResidentData {
  id: string;
  name: string;
  age: number;
}

export interface SectoralInfo {
  category: string;
  count: number;
}

export interface DependencyRatioData {
  youngDependents: number;
  workingAge: number;
  oldDependents: number;
  dependencyRatio: number;
  youngDependencyRatio: number;
  oldDependencyRatio: number;
}

export interface SexDistributionData {
  male: number;
  female: number;
  total: number;
  malePercentage: number;
  femalePercentage: number;
}

// Additional chart data types (consolidated with above interfaces)

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

export interface EmploymentStatusData {
  employed: number;
  unemployed: number;
  student: number;
  retired: number;
  selfEmployed: number;
  homemaker: number;
  disabled: number;
  other: number;
}