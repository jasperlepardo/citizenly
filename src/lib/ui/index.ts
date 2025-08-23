/**
 * UI Utilities Index
 * @description Complete UI system including charts, graphics, accessibility, and statistics
 */

// Core UI utilities
export * from './accessibility';
export * from './lazy-components';
export * from './typography';

// Charts (moved from charts/)
export * from './chart-transformers';

// Graphics (moved from graphics/)
export * from './colorGenerator';
export * from './pieChartMath';

// Statistics (moved from statistics/)
export {
  filterEmptyAgeGroups,
  hasPopulationData,
  calculatePopulationStats,
  calculateMaxPercentage,
  generateTooltipData,
  populationPyramidStats,
} from './population-pyramid';

export type {
  AgeGroupData,
  PopulationStats,
  TooltipData,
} from './population-pyramid';