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
 * Resident data for calculations
 */
export interface ResidentData {
  birthdate: string;
  sex: string;
  civil_status: string;
  employment_status: string;
  is_labor_force_employed?: boolean;
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
 * Process population data for population pyramid
 */
export const processPopulationData = (residents: ResidentData[]): AgeGroup[] => {
  const counts: Record<string, { male: number; female: number }> = {};

  // Initialize age groups
  STANDARD_AGE_GROUPS.forEach(group => {
    counts[group] = { male: 0, female: 0 };
  });

  // Calculate ages and categorize
  residents.forEach(resident => {
    if (!resident.birthdate || !resident.sex) {
      return;
    }
    
    const age = calculateAge(resident.birthdate);
    const ageGroup = getAgeGroup(age);
    const gender = resident.sex?.toLowerCase() === 'male' ? 'male' : 'female';

    if (counts[ageGroup]) {
      counts[ageGroup][gender]++;
    }
  });

  const totalPopulation = residents.length;

  return STANDARD_AGE_GROUPS.map(ageRange => {
    const male = counts[ageRange].male;
    const female = counts[ageRange].female;

    return {
      ageRange,
      male,
      female,
      malePercentage: totalPopulation > 0 ? (male / totalPopulation) * 100 : 0,
      femalePercentage: totalPopulation > 0 ? (female / totalPopulation) * 100 : 0,
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
 * Calculate sex distribution
 */
export const calculateSexDistribution = (residents: ResidentData[]) => {
  const male = residents.filter(r => r.sex?.toLowerCase() === 'male').length;
  const female = residents.filter(r => r.sex?.toLowerCase() === 'female').length;
  const total = male + female;

  return {
    male,
    female,
    total,
    malePercentage: total > 0 ? (male / total) * 100 : 0,
    femalePercentage: total > 0 ? (female / total) * 100 : 0,
  };
};

/**
 * Calculate civil status distribution
 */
export const calculateCivilStatusDistribution = (residents: ResidentData[]) => {
  const counts = {
    single: 0,
    married: 0,
    widowed: 0,
    divorced: 0,
    separated: 0,
    annulled: 0,
    registeredPartnership: 0,
    liveIn: 0,
  };

  residents.forEach(resident => {
    const status = resident.civil_status?.toLowerCase();
    switch (status) {
      case 'single':
        counts.single++;
        break;
      case 'married':
        counts.married++;
        break;
      case 'widowed':
        counts.widowed++;
        break;
      case 'divorced':
        counts.divorced++;
        break;
      case 'separated':
        counts.separated++;
        break;
      case 'annulled':
        counts.annulled++;
        break;
      case 'registered partnership':
      case 'registered_partnership':
        counts.registeredPartnership++;
        break;
      case 'live-in':
      case 'live_in':
      case 'livein':
        counts.liveIn++;
        break;
    }
  });

  return counts;
};

/**
 * Calculate employment status distribution
 */
export const calculateEmploymentStatusDistribution = (residents: ResidentData[]) => {
  const counts = {
    employed: 0,
    unemployed: 0,
    selfEmployed: 0,
    student: 0,
    retired: 0,
    homemaker: 0,
    disabled: 0,
    other: 0,
  };

  residents.forEach(resident => {
    const status = resident.employment_status?.toLowerCase();
    switch (status) {
      case 'employed':
        counts.employed++;
        break;
      case 'unemployed':
        counts.unemployed++;
        break;
      case 'self-employed':
      case 'self_employed':
      case 'selfemployed':
        counts.selfEmployed++;
        break;
      case 'student':
        counts.student++;
        break;
      case 'retired':
        counts.retired++;
        break;
      case 'homemaker':
      case 'housewife':
      case 'househusband':
        counts.homemaker++;
        break;
      case 'disabled':
      case 'person with disability':
      case 'pwd':
        counts.disabled++;
        break;
      default:
        if (status && status.trim() !== '') {
          counts.other++;
        }
        break;
    }
  });

  return counts;
};

/**
 * Return type for dashboard calculations hook
 */
export interface UseDashboardCalculationsReturn {
  /** Processed population data for pyramid chart */
  populationData: AgeGroup[];
  /** Dependency ratio calculations */
  dependencyData: ReturnType<typeof calculateDependencyRatios>;
  /** Sex distribution calculations */
  sexDistribution: ReturnType<typeof calculateSexDistribution>;
  /** Civil status distribution calculations */
  civilStatusData: ReturnType<typeof calculateCivilStatusDistribution>;
  /** Employment status distribution calculations */
  employmentData: ReturnType<typeof calculateEmploymentStatusDistribution>;
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