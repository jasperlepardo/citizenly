/**
 * Population Pyramid Statistics Library
 *
 * @description Pure statistical calculations and data processing for population pyramids.
 * Contains data filtering, statistical calculations, and data transformation utilities.
 */

export interface AgeGroupData {
  ageRange: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

export interface PopulationStats {
  totalMale: number;
  totalFemale: number;
  totalPopulation: number;
  malePercentage: number;
  femalePercentage: number;
}

export interface TooltipData {
  label: string;
  count?: number;
  percentage?: number;
  maleCount?: number;
  femaleCount?: number;
  malePercentage?: number;
  femalePercentage?: number;
  total?: number;
  type: 'single' | 'comparison';
}

/**
 * Filter out empty age groups (where both male and female are 0)
 */
export function filterEmptyAgeGroups(data: AgeGroupData[]): AgeGroupData[] {
  return data.filter(group => group.male > 0 || group.female > 0);
}

/**
 * Check if all age groups are empty (all zeros)
 */
export function hasPopulationData(data: AgeGroupData[]): boolean {
  return filterEmptyAgeGroups(data).length > 0;
}

/**
 * Calculate population statistics from age group data
 */
export function calculatePopulationStats(data: AgeGroupData[]): PopulationStats {
  const filteredData = filterEmptyAgeGroups(data);

  const totalMale = filteredData.reduce((sum, group) => sum + group.male, 0);
  const totalFemale = filteredData.reduce((sum, group) => sum + group.female, 0);
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
      label: `Age ${ageGroup.ageRange}`,
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
 * Population pyramid statistical utilities
 */
export const populationPyramidStats = {
  /**
   * Calculate age group totals
   */
  getAgeGroupTotal: (ageGroup: AgeGroupData): number => {
    return ageGroup.male + ageGroup.female;
  },

  /**
   * Calculate age group gender ratio (male/female)
   */
  getGenderRatio: (ageGroup: AgeGroupData): number => {
    return ageGroup.female > 0 ? ageGroup.male / ageGroup.female : 0;
  },

  /**
   * Find age group with highest population
   */
  findLargestAgeGroup: (data: AgeGroupData[]): AgeGroupData | null => {
    const filteredData = filterEmptyAgeGroups(data);

    if (filteredData.length === 0) return null;

    return filteredData.reduce((largest, current) => {
      const currentTotal = populationPyramidStats.getAgeGroupTotal(current);
      const largestTotal = populationPyramidStats.getAgeGroupTotal(largest);
      return currentTotal > largestTotal ? current : largest;
    });
  },

  /**
   * Find age group with smallest population
   */
  findSmallestAgeGroup: (data: AgeGroupData[]): AgeGroupData | null => {
    const filteredData = filterEmptyAgeGroups(data);

    if (filteredData.length === 0) return null;

    return filteredData.reduce((smallest, current) => {
      const currentTotal = populationPyramidStats.getAgeGroupTotal(current);
      const smallestTotal = populationPyramidStats.getAgeGroupTotal(smallest);
      return currentTotal < smallestTotal ? current : smallest;
    });
  },

  /**
   * Calculate dependency ratio (young + old / working age)
   */
  calculateDependencyRatio: (data: AgeGroupData[]): number => {
    const stats = calculatePopulationStats(data);

    // This is a simplified calculation - in practice, you'd need to categorize age groups
    // For now, return 0 as this would require age group classification logic
    return 0;
  },

  /**
   * Get age groups sorted by population size
   */
  sortByPopulationSize: (data: AgeGroupData[], descending: boolean = true): AgeGroupData[] => {
    const filteredData = filterEmptyAgeGroups(data);

    return [...filteredData].sort((a, b) => {
      const totalA = populationPyramidStats.getAgeGroupTotal(a);
      const totalB = populationPyramidStats.getAgeGroupTotal(b);
      return descending ? totalB - totalA : totalA - totalB;
    });
  },

  /**
   * Calculate percentage of total population for each age group
   */
  calculateAgeGroupPercentages: (data: AgeGroupData[]): AgeGroupData[] => {
    const stats = calculatePopulationStats(data);

    if (stats.totalPopulation === 0) return data;

    return data.map(group => ({
      ...group,
      malePercentage: (group.male / stats.totalPopulation) * 100,
      femalePercentage: (group.female / stats.totalPopulation) * 100,
    }));
  },

  /**
   * Validate population pyramid data structure
   */
  validateData: (data: AgeGroupData[]): boolean => {
    return data.every(
      group =>
        typeof group.ageRange === 'string' &&
        typeof group.male === 'number' &&
        typeof group.female === 'number' &&
        typeof group.malePercentage === 'number' &&
        typeof group.femalePercentage === 'number' &&
        group.male >= 0 &&
        group.female >= 0 &&
        group.malePercentage >= 0 &&
        group.femalePercentage >= 0
    );
  },
};
