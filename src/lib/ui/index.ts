/**
 * UI Utilities Index
 * @description Complete UI system including charts, graphics, accessibility, and statistics
 */

// Core UI utilities
export * from './accessibility';
export * from './typography';

// Lazy loading utilities (selective exports to avoid conflicts)
export {
  createLazyComponent,
  preloadLazyComponent,
  LazyLoadingPresets,
  useLazyLoadOnIntersection,
} from './lazyComponents';

// Use withLazyLoading from lazy-loading.tsx as primary implementation
export { withLazyLoading, preloadComponents } from './lazy-loading';

// Charts (moved from charts/)
export * from './chart-transformers';

// Graphics (moved from graphics/)
export * from '@/utils/color-utils';
export * from './pieChartMath';

// Statistics (moved from statistics/)
export {
  filterEmptyAgeGroups,
  hasPopulationData,
  calculatePopulationStats,
  calculateMaxPercentage,
  generateTooltipData,
  populationPyramidStats,
} from '@/utils/chart-utils';

export type { AgeGroupData, PopulationStats, TooltipData } from '@/types/charts';
