/**
 * Chart Utilities
 * Consolidated chart mathematics and data transformation utilities
 */

import type { AgeGroupData, PopulationStats, TooltipData } from '@/types/charts';

import { calculateAge, getAgeGroup } from './date-utils';

export interface PieSliceData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PieSliceWithAngles extends PieSliceData {
  startAngle: number;
  endAngle: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
  metadata?: Record<string, any>;
}

/**
 * Create SVG path for pie slices
 */
export function createPieSlicePath(startAngle: number, endAngle: number, radius: number): string {
  const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
  const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = 50 + radius * Math.cos(startAngleRad);
  const y1 = 50 + radius * Math.sin(startAngleRad);
  const x2 = 50 + radius * Math.cos(endAngleRad);
  const y2 = 50 + radius * Math.sin(endAngleRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return ['M', 50, 50, 'L', x1, y1, 'A', radius, radius, 0, largeArcFlag, 1, x2, y2, 'Z'].join(' ');
}

/**
 * Calculate angles for pie chart slices
 */
export function calculatePieSliceAngles(data: PieSliceData[]): PieSliceWithAngles[] {
  let currentAngle = 0;

  return data.map(item => {
    const angle = (item.percentage / 100) * 360;
    const slice: PieSliceWithAngles = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return slice;
  });
}

/**
 * Calculate percentages from values
 */
export function calculatePercentages<T extends { value: number }>(data: T[]): (T & { percentage: number })[] {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return data.map(item => ({ ...item, percentage: 0 }));
  }
  
  return data.map(item => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));
}

/**
 * Transform data for chart display
 */
export function transformChartData(
  data: Array<{ label: string; value: number }>,
  colors: string[]
): ChartDataPoint[] {
  const dataWithPercentages = calculatePercentages(data);
  
  return dataWithPercentages.map((item, index) => ({
    label: item.label,
    value: item.value,
    percentage: item.percentage,
    color: colors[index % colors.length],
  }));
}

/**
 * Generate age group data for population pyramid
 */
export function generateAgeGroupData(residents: Array<{ birthdate: string; sex: 'male' | 'female' }>): {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}[] {
  const ageGroups: Record<string, { male: number; female: number }> = {};
  
  // Initialize age groups
  const groups = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];
  groups.forEach(group => {
    ageGroups[group] = { male: 0, female: 0 };
  });
  
  // Count residents by age group and sex
  residents.forEach(resident => {
    const age = calculateAge(resident.birthdate);
    const ageGroup = getAgeGroupLocal(age);
    
    if (ageGroups[ageGroup]) {
      if (resident.sex === 'male') {
        ageGroups[ageGroup].male++;
      } else if (resident.sex === 'female') {
        ageGroups[ageGroup].female++;
      }
    }
  });
  
  // Transform to chart format
  return Object.entries(ageGroups).map(([ageGroup, counts]) => ({
    ageGroup,
    male: counts.male,
    female: counts.female,
    total: counts.male + counts.female,
  }));
}

/**
 * Calculate dependency ratio
 */
export function calculateDependencyRatio(ageGroupData: Array<{ ageGroup: string; total: number }>): {
  total: number;
  child: number;
  elderly: number;
} {
  const dependents = ageGroupData.filter(group => 
    group.ageGroup.startsWith('0-') || 
    group.ageGroup.startsWith('5-') || 
    group.ageGroup.startsWith('10-') ||
    group.ageGroup === '65-69' ||
    group.ageGroup === '70-74' ||
    group.ageGroup === '75-79' ||
    group.ageGroup === '80+'
  );
  
  const workingAge = ageGroupData.filter(group =>
    !dependents.some(dep => dep.ageGroup === group.ageGroup)
  );
  
  const childDependents = dependents.filter(group => 
    group.ageGroup.startsWith('0-') || 
    group.ageGroup.startsWith('5-') || 
    group.ageGroup.startsWith('10-')
  );
  
  const elderlyDependents = dependents.filter(group =>
    group.ageGroup === '65-69' ||
    group.ageGroup === '70-74' ||
    group.ageGroup === '75-79' ||
    group.ageGroup === '80+'
  );
  
  const totalWorking = workingAge.reduce((sum, group) => sum + group.total, 0);
  const totalChild = childDependents.reduce((sum, group) => sum + group.total, 0);
  const totalElderly = elderlyDependents.reduce((sum, group) => sum + group.total, 0);
  
  if (totalWorking === 0) {
    return { total: 0, child: 0, elderly: 0 };
  }
  
  return {
    total: ((totalChild + totalElderly) / totalWorking) * 100,
    child: (totalChild / totalWorking) * 100,
    elderly: (totalElderly / totalWorking) * 100,
  };
}

// calculateAge and getAgeGroup imported from date-utils above

function getAgeGroupLocal(age: number): string {
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
  return '80+';
}

/**
 * CONSOLIDATED POPULATION PYRAMID UTILITIES
 * Moved from lib/ui/population-pyramid.ts and services/statistics/population-pyramid.ts
 */

/**
 * Filter out empty age groups (where both male and female are 0)
 */
export function filterEmptyAgeGroups(data: AgeGroupData[]): AgeGroupData[] {
  return data.filter(group => group.male > 0 || group.female > 0);
}

/**
 * Check if there's any population data in the age groups
 */
export function hasPopulationData(data: AgeGroupData[]): boolean {
  return data.some(group => group.male > 0 || group.female > 0);
}

/**
 * Calculate population statistics from age group data
 */
export function calculatePopulationStats(data: AgeGroupData[]): PopulationStats {
  const totalMale = data.reduce((sum, group) => sum + group.male, 0);
  const totalFemale = data.reduce((sum, group) => sum + group.female, 0);
  const totalPopulation = totalMale + totalFemale;

  return {
    totalMale,
    totalFemale,
    totalPopulation,
    malePercentage: totalPopulation > 0 ? (totalMale / totalPopulation) * 100 : 0,
    femalePercentage: totalPopulation > 0 ? (totalFemale / totalPopulation) * 100 : 0,
  };
}

/**
 * Calculate the maximum percentage for chart scaling
 */
export function calculateMaxPercentage(data: AgeGroupData[]): number {
  const filteredData = filterEmptyAgeGroups(data);

  if (filteredData.length === 0) return 0;

  return Math.max(
    ...filteredData.map(group => Math.max(group.malePercentage, group.femalePercentage))
  );
}

/**
 * Generate tooltip data for a specific age group and side
 */
export function generateTooltipData(ageGroup: AgeGroupData, side?: 'male' | 'female'): TooltipData {
  if (side === 'male') {
    return {
      label: `Male ${ageGroup.ageRange}`,
      count: ageGroup.male,
      percentage: ageGroup.malePercentage,
      type: 'single',
    };
  } else if (side === 'female') {
    return {
      label: `Female ${ageGroup.ageRange}`,
      count: ageGroup.female,
      percentage: ageGroup.femalePercentage,
      type: 'single',
    };
  } else {
    // Comparison view
    return {
      label: `Age Group ${ageGroup.ageRange}`,
      maleCount: ageGroup.male,
      femaleCount: ageGroup.female,
      malePercentage: ageGroup.malePercentage,
      femalePercentage: ageGroup.femalePercentage,
      total: ageGroup.male + ageGroup.female,
      type: 'comparison',
    };
  }
}

/**
 * Comprehensive population pyramid statistics
 */
export function populationPyramidStats(data: AgeGroupData[]): PopulationStats & {
  maxPercentage: number;
  hasData: boolean;
  dependencyRatio: {
    total: number;
    child: number;
    elderly: number;
  };
} {
  const basicStats = calculatePopulationStats(data);
  const maxPercentage = calculateMaxPercentage(data);
  const hasData = hasPopulationData(data);
  
  // Calculate dependency ratio
  const simplifiedData = data.map(group => ({
    ageGroup: group.ageRange,
    total: group.male + group.female,
  }));
  const dependencyRatio = calculateDependencyRatio(simplifiedData);
  
  return {
    ...basicStats,
    maxPercentage,
    hasData,
    dependencyRatio,
  };
}