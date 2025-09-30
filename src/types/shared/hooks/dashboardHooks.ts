/**
 * Dashboard Hook Types
 *
 * @fileoverview TypeScript interfaces for dashboard-related React hooks
 * in the Citizenly RBI system.
 */

// =============================================================================
// DASHBOARD HOOK TYPES
// =============================================================================

/**
 * Dashboard statistics interface
 * Consolidates from src/hooks/dashboard/useDashboardApi.ts
 */
export interface DashboardStats {
  residents: number;
  households: number;
  businesses: number;
  certifications: number;
  seniorCitizens: number;
  employedResidents: number;
}

// Legacy interfaces - use DependencyRatioData and SexDistributionData instead

/**
 * Civil status data interface
 * Consolidates from src/hooks/dashboard/useDashboardApi.ts
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
 * Consolidates from src/hooks/dashboard/useDashboardApi.ts
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
 * Consolidates from src/hooks/dashboard/useDashboardApi.ts
 */
export interface DashboardResponse {
  stats: DashboardStats;
  demographics: {
    ageGroups: DependencyRatioData;
    sexDistribution: SexDistributionData;
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
    };
  };
  residentsData?: any[];
}

/**
 * Dashboard API hook return interface
 * Consolidates from src/hooks/dashboard/useDashboardApi.ts
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
 * Age group data interface
 * Consolidates from src/hooks/dashboard/useDashboardApi.ts
 */
export interface AgeGroup {
  ageRange: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Sectoral information interface
 * Consolidates from src/hooks/dashboard/useDashboardCalculations.ts
 */
export interface SectoralInfo {
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
}

/**
 * Resident data for calculations interface
 * Consolidates from src/hooks/dashboard/useDashboardCalculations.ts
 */
import type { SexEnum, CivilStatusEnum, EmploymentStatusEnum } from '@/types/infrastructure/database/database';

export interface ResidentData {
  birthdate: string;
  sex: SexEnum;
  civil_status: CivilStatusEnum | null;
  employment_status: EmploymentStatusEnum | null;
  sectoral_info: SectoralInfo;
}

/**
 * Dependency ratio calculation results interface
 * Consolidates from src/hooks/dashboard/useDashboardCalculations.ts
 */
export interface DependencyRatioData {
  youngDependents: number;
  workingAge: number;
  oldDependents: number;
  dependencyRatio: number;
  youngDependencyRatio: number;
  oldDependencyRatio: number;
}

/**
 * Sex distribution calculation results interface
 * Consolidates from src/hooks/dashboard/useDashboardCalculations.ts
 */
export interface SexDistributionData {
  male: number;
  female: number;
  total: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Dashboard calculations hook return interface
 * Consolidates from src/hooks/dashboard/useDashboardCalculations.ts
 */
export interface UseDashboardCalculationsReturn {
  /** Processed population data for pyramid chart */
  populationData: AgeGroup[];
  /** Dependency ratio calculations */
  dependencyData: DependencyRatioData;
  /** Sex distribution calculations */
  sexDistribution: SexDistributionData;
  /** Civil status distribution calculations */
  civilStatusData: any; // CivilStatusCounts - would need to check the actual interface
  /** Employment status distribution calculations */
  employmentData: any; // EmploymentStatusCounts - would need to check the actual interface
  /** Total population count */
  totalPopulation: number;
}

/**
 * Dashboard hook return interface
 * Consolidates from src/hooks/dashboard/useDashboard.ts
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