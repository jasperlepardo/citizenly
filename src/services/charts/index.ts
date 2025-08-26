/**
 * Charts Library Module
 *
 * @description Centralized chart data transformation and utilities.
 * Provides reusable chart transformers and configuration separated from UI components.
 */

// Explicit exports to prevent circular dependencies
export {
  transformChartData,
  transformDependencyData,
  transformSexData,
  transformCivilStatusData,
  transformEmploymentData,
  getChartTitle,
  chartUtils,
  DEFAULT_CHART_TITLES,
  CHART_COLORS,
} from './chart-transformers';

export type {
  ChartDataPoint,
  ChartType,
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
} from './chart-transformers';
