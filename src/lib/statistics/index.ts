/**
 * Statistics Library Module
 * 
 * @description Centralized statistical calculations and data processing utilities.
 * Provides reusable statistical functions separated from UI components.
 */

// Explicit exports to prevent circular dependencies
export {
  filterEmptyAgeGroups,
  hasPopulationData,
  calculatePopulationStats,
  calculateMaxPercentage,
  generateTooltipData,
  populationPyramidStats,
} from './populationPyramid';

export type {
  AgeGroupData,
  PopulationStats,
  TooltipData,
} from './populationPyramid';