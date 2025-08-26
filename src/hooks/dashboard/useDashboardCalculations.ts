'use client';

/**
 * Dashboard Calculations Hook
 * 
 * @description Handles data processing and calculations for dashboard statistics.
 * Extracted from useDashboard for better maintainability and testability.
 */

import { useMemo } from 'react';
import type { AgeGroup } from './useDashboardApi';

/**
 * Sectoral information interface
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
 * Resident data for calculations with improved type safety
 */
export interface ResidentData {
  birthdate: string;
  sex: 'male' | 'female' | string;
  civil_status: 'single' | 'married' | 'widowed' | 'divorced' | 'separated' | 'annulled' | string;
  employment_status: string;
  is_labor_force_employed?: boolean;
  household_code?: string;
  resident_sectoral_info?: SectoralInfo[];
}

/**
 * Age calculation utility
 */
export const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Age group classification utility
 */
export const getAgeGroup = (age: number): string => {
  if (age < 5) return '0-4';
  if (age < 10) return '5-9';
  if (age < 15) return '10-14';
  if (age < 20) return '15-19';
  if (age < 25) return '20-24';
  if (age < 30) return '25-29';
  if (age < 35) return '30-34';
  if (age < 40) return '35-39';
  if (age < 45) return '40-44';
  if (age < 50) return '45-49';
  if (age < 55) return '50-54';
  if (age < 60) return '55-59';
  if (age < 65) return '60-64';
  if (age < 70) return '65-69';
  if (age < 75) return '70-74';
  if (age < 80) return '75-79';
  if (age < 85) return '80-84';
  if (age < 90) return '85-89';
  if (age < 95) return '90-94';
  if (age < 100) return '95-99';
  return '100+';
};

/**
 * Standard age groups for population pyramid
 */
const STANDARD_AGE_GROUPS = [
  '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39',
  '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79',
  '80-84', '85-89', '90-94', '95-99', '100+'
] as const;

/**
 * Safely calculate age with input validation
 */
const safeCalculateAge = (birthdate: string): number | null => {
  if (!birthdate || typeof birthdate !== 'string') return null;
  
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return null;
  
  return calculateAge(birthdate);
};

/**
 * Safely determine gender with type checking
 */
const safeGetGender = (sex: string): 'male' | 'female' | null => {
  if (!sex || typeof sex !== 'string') return null;
  
  const normalized = sex.toLowerCase().trim();
  if (normalized === 'male') return 'male';
  if (normalized === 'female') return 'female';
  return null;
};

/**
 * Process population data for population pyramid with improved type safety
 */
export const processPopulationData = (residents: ResidentData[]): AgeGroup[] => {
  if (!Array.isArray(residents)) return [];
  
  const counts: Record<string, { male: number; female: number }> = {};

  // Initialize age groups
  STANDARD_AGE_GROUPS.forEach(group => {
    counts[group] = { male: 0, female: 0 };
  });

  // Calculate ages and categorize with safe type checking
  residents.forEach(resident => {
    if (!resident || typeof resident !== 'object') return;
    
    const age = safeCalculateAge(resident.birthdate);
    if (age === null || age < 0 || age > 150) return; // Invalid age
    
    const gender = safeGetGender(resident.sex);
    if (!gender) return;
    
    const ageGroup = getAgeGroup(age);
    if (counts[ageGroup]) {
      counts[ageGroup][gender]++;
    }
  });

  const totalPopulation = residents.length;

  return STANDARD_AGE_GROUPS.map(ageRange => {
    const male = counts[ageRange]?.male ?? 0;
    const female = counts[ageRange]?.female ?? 0;

    return {
      ageRange,
      male,
      female,
      malePercentage: totalPopulation > 0 ? Number(((male / totalPopulation) * 100).toFixed(2)) : 0,
      femalePercentage: totalPopulation > 0 ? Number(((female / totalPopulation) * 100).toFixed(2)) : 0,
    };
  });
};

/**
 * Calculate dependency ratios
 */
export const calculateDependencyRatios = (ageGroups: AgeGroup[]) => {
  let youngDependents = 0; // 0-14
  let workingAge = 0; // 15-64
  let oldDependents = 0; // 65+

  ageGroups.forEach(group => {
    const total = group.male + group.female;
    const ageRange = group.ageRange;
    
    if (['0-4', '5-9', '10-14'].includes(ageRange)) {
      youngDependents += total;
    } else if (['65-69', '70-74', '75-79', '80-84', '85-89', '90-94', '95-99', '100+'].includes(ageRange)) {
      oldDependents += total;
    } else {
      workingAge += total;
    }
  });

  const totalDependents = youngDependents + oldDependents;
  const dependencyRatio = workingAge > 0 ? (totalDependents / workingAge) * 100 : 0;
  const youngDependencyRatio = workingAge > 0 ? (youngDependents / workingAge) * 100 : 0;
  const oldDependencyRatio = workingAge > 0 ? (oldDependents / workingAge) * 100 : 0;

  return {
    youngDependents,
    workingAge,
    oldDependents,
    dependencyRatio,
    youngDependencyRatio,
    oldDependencyRatio,
  };
};

/**
 * Calculate sex distribution with improved type safety
 */
export const calculateSexDistribution = (residents: ResidentData[]) => {
  if (!Array.isArray(residents)) {
    return {
      male: 0,
      female: 0,
      total: 0,
      malePercentage: 0,
      femalePercentage: 0,
    };
  }

  const male = residents.filter(r => r && safeGetGender(r.sex) === 'male').length;
  const female = residents.filter(r => r && safeGetGender(r.sex) === 'female').length;
  const total = male + female;

  return {
    male,
    female,
    total,
    malePercentage: total > 0 ? Number(((male / total) * 100).toFixed(2)) : 0,
    femalePercentage: total > 0 ? Number(((female / total) * 100).toFixed(2)) : 0,
  };
};

/**
 * Civil status counts type
 */
export type CivilStatusCounts = {
  single: number;
  married: number;
  widowed: number;
  divorced: number;
  separated: number;
  annulled: number;
  registeredPartnership: number;
  liveIn: number;
};

/**
 * Safely normalize civil status string
 */
const safeCivilStatus = (status: string): string | null => {
  if (!status || typeof status !== 'string') return null;
  return status.toLowerCase().trim();
};

/**
 * Calculate civil status distribution with improved type safety
 */
export const calculateCivilStatusDistribution = (residents: ResidentData[]): CivilStatusCounts => {
  const counts: CivilStatusCounts = {
    single: 0,
    married: 0,
    widowed: 0,
    divorced: 0,
    separated: 0,
    annulled: 0,
    registeredPartnership: 0,
    liveIn: 0,
  };

  if (!Array.isArray(residents)) return counts;

  // Civil status mapping for cleaner logic
  const civilStatusMap: Record<string, keyof CivilStatusCounts> = {
    'single': 'single',
    'married': 'married',
    'widowed': 'widowed',
    'divorced': 'divorced',
    'separated': 'separated',
    'annulled': 'annulled',
    'registered partnership': 'registeredPartnership',
    'registered_partnership': 'registeredPartnership',
    'live-in': 'liveIn',
    'live_in': 'liveIn',
    'livein': 'liveIn',
  };

  residents.forEach(resident => {
    if (!resident || typeof resident !== 'object') return;
    
    const status = safeCivilStatus(resident.civil_status);
    if (!status) return;
    
    const mappedStatus = civilStatusMap[status];
    if (mappedStatus && mappedStatus in counts) {
      counts[mappedStatus]++;
    }
  });

  return counts;
};

/**
 * Employment status counts type
 */
export type EmploymentStatusCounts = {
  employed: number;
  unemployed: number;
  selfEmployed: number;
  student: number;
  retired: number;
  homemaker: number;
  disabled: number;
  other: number;
};

/**
 * Safely normalize employment status string
 */
const safeEmploymentStatus = (status: string): string | null => {
  if (!status || typeof status !== 'string') return null;
  return status.toLowerCase().trim();
};

/**
 * Calculate employment status distribution with improved type safety
 */
export const calculateEmploymentStatusDistribution = (residents: ResidentData[]): EmploymentStatusCounts => {
  const counts: EmploymentStatusCounts = {
    employed: 0,
    unemployed: 0,
    selfEmployed: 0,
    student: 0,
    retired: 0,
    homemaker: 0,
    disabled: 0,
    other: 0,
  };

  if (!Array.isArray(residents)) return counts;

  // Employment status mapping for cleaner logic
  const employmentStatusMap: Record<string, keyof EmploymentStatusCounts> = {
    'employed': 'employed',
    'unemployed': 'unemployed',
    'self-employed': 'selfEmployed',
    'self_employed': 'selfEmployed',
    'selfemployed': 'selfEmployed',
    'student': 'student',
    'retired': 'retired',
    'homemaker': 'homemaker',
    'housewife': 'homemaker',
    'househusband': 'homemaker',
    'disabled': 'disabled',
    'person with disability': 'disabled',
    'pwd': 'disabled',
  };

  residents.forEach(resident => {
    if (!resident || typeof resident !== 'object') return;
    
    const status = safeEmploymentStatus(resident.employment_status);
    if (!status) return;
    
    const mappedStatus = employmentStatusMap[status];
    if (mappedStatus && mappedStatus in counts) {
      counts[mappedStatus]++;
    } else if (status.length > 0) {
      counts.other++;
    }
  });

  return counts;
};

/**
 * Return type for dashboard calculations hook
 */
/**
 * Dependency ratio calculation results
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
 * Sex distribution calculation results
 */
export interface SexDistributionData {
  male: number;
  female: number;
  total: number;
  malePercentage: number;
  femalePercentage: number;
}

export interface UseDashboardCalculationsReturn {
  /** Processed population data for pyramid chart */
  populationData: AgeGroup[];
  /** Dependency ratio calculations */
  dependencyData: DependencyRatioData;
  /** Sex distribution calculations */
  sexDistribution: SexDistributionData;
  /** Civil status distribution calculations */
  civilStatusData: CivilStatusCounts;
  /** Employment status distribution calculations */
  employmentData: EmploymentStatusCounts;
  /** Total population count */
  totalPopulation: number;
}

/**
 * Hook for dashboard calculations
 * 
 * @description Processes resident data into dashboard statistics with memoization.
 * Handles population pyramid, dependency ratios, and demographic distributions.
 */
export function useDashboardCalculations(
  residents: ResidentData[] = []
): UseDashboardCalculationsReturn {
  
  /**
   * Process population data with memoization
   */
  const populationData = useMemo(() => {
    return processPopulationData(residents);
  }, [residents]);

  /**
   * Calculate dependency ratios with memoization
   */
  const dependencyData = useMemo(() => {
    return calculateDependencyRatios(populationData);
  }, [populationData]);

  /**
   * Calculate sex distribution with memoization
   */
  const sexDistribution = useMemo(() => {
    return calculateSexDistribution(residents);
  }, [residents]);

  /**
   * Calculate civil status distribution with memoization
   */
  const civilStatusData = useMemo(() => {
    return calculateCivilStatusDistribution(residents);
  }, [residents]);

  /**
   * Calculate employment status distribution with memoization
   */
  const employmentData = useMemo(() => {
    return calculateEmploymentStatusDistribution(residents);
  }, [residents]);

  /**
   * Total population with memoization
   */
  const totalPopulation = useMemo(() => {
    return residents.length;
  }, [residents]);

  return {
    populationData,
    dependencyData,
    sexDistribution,
    civilStatusData,
    employmentData,
    totalPopulation,
  };
}

// Export utility functions for external use
export {
  STANDARD_AGE_GROUPS,
};

// Export for backward compatibility
export default useDashboardCalculations;