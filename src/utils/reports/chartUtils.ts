/**
 * Chart Utilities
 * Consolidated chart mathematics and data transformation utilities
 */

import type { AgeGroupData, PopulationStats, TooltipData, PieSliceData, PieSliceWithAngles, ChartDataPoint } from '@/types/app/ui/charts';

import { calculateAge } from '../shared/dateUtils';

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
export function calculatePercentages<T extends { value: number }>(
  data: T[]
): (T & { percentage: number })[] {
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
export function transformGenericChartData(
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
export function generateAgeGroupData(
  residents: Array<{ birthdate: string; sex: 'male' | 'female' }>
): {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}[] {
  const ageGroups: Record<string, { male: number; female: number }> = {};

  // Initialize age groups
  const groups = [
    '0-4',
    '5-9',
    '10-14',
    '15-19',
    '20-24',
    '25-29',
    '30-34',
    '35-39',
    '40-44',
    '45-49',
    '50-54',
    '55-59',
    '60-64',
    '65-69',
    '70-74',
    '75-79',
    '80+',
  ];
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
 * Helper functions for dependency ratio calculation
 */
const isChildDependent = (ageGroup: string): boolean => 
  ['0-4', '5-9', '10-14'].includes(ageGroup);

const isElderlyDependent = (ageGroup: string): boolean =>
  ['65-69', '70-74', '75-79', '80+'].includes(ageGroup);

const isDependent = (ageGroup: string): boolean =>
  isChildDependent(ageGroup) || isElderlyDependent(ageGroup);

/**
 * Calculate dependency ratio
 */
export function calculateDependencyRatio(
  ageGroupData: Array<{ ageGroup: string; total: number }>
): {
  total: number;
  child: number;
  elderly: number;
} {
  const childDependents = ageGroupData.filter(group => isChildDependent(group.ageGroup));
  const elderlyDependents = ageGroupData.filter(group => isElderlyDependent(group.ageGroup));
  const workingAge = ageGroupData.filter(group => !isDependent(group.ageGroup));

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
  const ageGroups = [
    { max: 5, label: '0-4' },
    { max: 10, label: '5-9' },
    { max: 15, label: '10-14' },
    { max: 20, label: '15-19' },
    { max: 25, label: '20-24' },
    { max: 30, label: '25-29' },
    { max: 35, label: '30-34' },
    { max: 40, label: '35-39' },
    { max: 45, label: '40-44' },
    { max: 50, label: '45-49' },
    { max: 55, label: '50-54' },
    { max: 60, label: '55-59' },
    { max: 65, label: '60-64' },
    { max: 70, label: '65-69' },
    { max: 75, label: '70-74' },
    { max: 80, label: '75-79' },
  ];

  const group = ageGroups.find(group => age < group.max);
  return group ? group.label : '80+';
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

// =============================================================================
// PIE CHART SPECIFIC UTILITIES (consolidated from pieChartMath.ts)
// =============================================================================

/**
 * Calculate the total value from pie chart data
 */
export function calculatePieChartTotal(data: PieSliceData[]): number {
  return data.reduce((sum, item) => sum + item.value, 0);
}

/**
 * Filter out empty data points (value > 0)
 */
export function filterNonEmptySlices(data: PieSliceData[]): PieSliceData[] {
  return data.filter(item => item.value > 0);
}

/**
 * Check if there's only one non-empty slice (100% case)
 */
export function isSingleSlice(data: PieSliceData[]): boolean {
  return filterNonEmptySlices(data).length === 1;
}

/**
 * Get the single non-empty slice
 */
export function getSingleSlice(data: PieSliceData[]): PieSliceData | null {
  const nonEmptySlices = filterNonEmptySlices(data);
  return nonEmptySlices.length === 1 ? nonEmptySlices[0] : null;
}
