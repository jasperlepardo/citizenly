/**
 * Graphics Library Module
 * 
 * @description Centralized graphics utilities and mathematical functions.
 * Provides reusable color generation and mathematical calculations for charts and graphics.
 */

// Explicit exports to prevent circular dependencies
export {
  generateColorVariations,
  applyColorsToData,
  isValidColor,
  colorUtils,
  CHARTJS_COLOR_PALETTE,
} from './colorGenerator';

export {
  createPieSlicePath,
  calculatePieSliceAngles,
  calculatePieChartTotal,
  filterNonEmptySlices,
  isSingleSlice,
  getSingleSlice,
  pieChartMath,
} from './pieChartMath';

export type {
  PieSliceData,
  PieSliceWithAngles,
} from './pieChartMath';