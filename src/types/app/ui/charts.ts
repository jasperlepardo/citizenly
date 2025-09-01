/**
 * Chart Types - Data Visualization Interface Collection
 *
 * @fileoverview Comprehensive chart and data visualization TypeScript interfaces
 * for the Citizenly RBI system. Provides type-safe chart configurations and data
 * structures for demographic analysis and statistical reporting.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 *
 * @example Demographic Chart Data Usage
 * ```typescript
 * import { SexData, ChartConfiguration } from '@/types/app/ui/charts';
 *
 * const sexDistribution: SexData = {
 *   male: 1250,
 *   female: 1180
 * };
 * ```
 */

// =============================================================================
// CHART DATA TYPES
// =============================================================================

/**
 * Demographic chart data types
 */
export type DependencyData = {
  youngDependents: number;
  workingAge: number;
  oldDependents: number;
};

export type SexData = {
  male: number;
  female: number;
};

export type CivilStatusData = {
  single: number;
  married: number;
  widowed: number;
  divorced: number;
  separated: number;
  annulled: number;
  registeredPartnership: number;
  liveIn: number;
};

export type EmploymentStatusData = {
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
 * Chart type enumeration
 */
export type ChartType = 'dependency' | 'sex' | 'civilStatus' | 'employment';

/**
 * Map chart types to their corresponding data types
 */
export type ChartDataMap = {
  dependency: DependencyData;
  sex: SexData;
  civilStatus: CivilStatusData;
  employment: EmploymentStatusData;
};

/**
 * Pie slice data interface
 */
export interface PieSliceData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

/**
 * Pie slice with calculated angles
 */
export interface PieSliceWithAngles extends PieSliceData {
  startAngle: number;
  endAngle: number;
}

/**
 * Standard chart data point interface
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  percentage: number;
  color: string;
  metadata?: Record<string, any>;
}

/**
 * Chart configuration interface
 */
export interface ChartConfig {
  type: ChartType;
  title?: string;
  colors?: Record<string, string>;
  showLegend?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  width?: number;
  height?: number;
}

/**
 * Population pyramid data point
 */
export interface PopulationPyramidDataPoint {
  ageGroup: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Population pyramid configuration
 */
export interface PopulationPyramidConfig {
  data: PopulationPyramidDataPoint[];
  width?: number;
  height?: number;
  colors?: {
    male: string;
    female: string;
  };
  showLabels?: boolean;
  showValues?: boolean;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Time series chart configuration
 */
export interface TimeSeriesConfig {
  data: TimeSeriesDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  showGrid?: boolean;
  showPoints?: boolean;
}

// =============================================================================
// CHART CONSTANTS
// =============================================================================

/**
 * Default chart titles
 */
export const DEFAULT_CHART_TITLES: Record<ChartType, string> = {
  dependency: 'Age Distribution',
  sex: 'Sex Distribution',
  civilStatus: 'Civil Status Distribution',
  employment: 'Employment Status',
};

/**
 * Chart color schemes
 */
export const CHART_COLORS: Record<ChartType, Record<string, string>> = {
  sex: {
    male: '#3b82f6', // primary-500 (matches population pyramid)
    female: '#a855f7', // secondary-500 (matches population pyramid)
  },
  dependency: {
    youngDependents: '#10b981', // emerald-500
    workingAge: '#3b82f6', // blue-500
    oldDependents: '#f59e0b', // amber-500
  },
  civilStatus: {
    single: '#6366f1', // indigo-500
    married: '#10b981', // emerald-500
    widowed: '#f59e0b', // amber-500
    divorced: '#ef4444', // red-500
    separated: '#f97316', // orange-500
    annulled: '#8b5cf6', // violet-500
    registeredPartnership: '#06b6d4', // cyan-500
    liveIn: '#84cc16', // lime-500
  },
  employment: {
    employed: '#10b981', // emerald-500
    unemployed: '#ef4444', // red-500
    selfEmployed: '#3b82f6', // blue-500
    student: '#8b5cf6', // violet-500
    retired: '#f59e0b', // amber-500
    homemaker: '#ec4899', // pink-500
    disabled: '#6b7280', // gray-500
    other: '#64748b', // slate-500
  },
};

/**
 * Chart size presets
 */
export const CHART_SIZES = {
  SMALL: { width: 300, height: 200 },
  MEDIUM: { width: 500, height: 300 },
  LARGE: { width: 800, height: 400 },
  XLARGE: { width: 1200, height: 600 },
} as const;

// =============================================================================
// CHART UTILITY TYPES
// =============================================================================

/**
 * Chart render mode
 */
export type ChartRenderMode = 'svg' | 'canvas' | 'webgl';

/**
 * Chart animation configuration
 */
export interface ChartAnimation {
  enabled: boolean;
  duration?: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

/**
 * Chart tooltip configuration
 */
export interface ChartTooltip {
  enabled: boolean;
  format?: (value: number, label: string) => string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'follow';
}

/**
 * Chart legend configuration
 */
export interface ChartLegend {
  enabled: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Chart axis configuration
 */
export interface ChartAxis {
  label?: string;
  showGrid?: boolean;
  showTicks?: boolean;
  tickFormat?: (value: number | string) => string;
  domain?: [number, number];
}

/**
 * Complete chart configuration
 */
export interface AdvancedChartConfig extends ChartConfig {
  renderMode?: ChartRenderMode;
  animation?: ChartAnimation;
  tooltip?: ChartTooltip;
  legend?: ChartLegend;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

// =============================================================================
// CHART DATA TRANSFORMERS
// =============================================================================

/**
 * Chart data transformation result
 */
export interface ChartTransformResult<T = ChartDataPoint[]> {
  data: T;
  total: number;
  isEmpty: boolean;
  hasNegativeValues: boolean;
  maxValue: number;
  minValue: number;
}

/**
 * Chart filter options
 */
export interface ChartFilterOptions {
  includeZeroValues?: boolean;
  minValue?: number;
  maxValue?: number;
  sortBy?: 'label' | 'value' | 'percentage';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// =============================================================================
// DASHBOARD CHART TYPES
// =============================================================================

/**
 * Dashboard widget chart type
 */
export type DashboardChartType =
  | 'pie'
  | 'bar'
  | 'line'
  | 'area'
  | 'donut'
  | 'populationPyramid'
  | 'gauge'
  | 'metric';

/**
 * Dashboard chart widget configuration
 */
export interface DashboardChartWidget {
  id: string;
  type: DashboardChartType;
  title: string;
  subtitle?: string;
  config: AdvancedChartConfig;
  dataSource: string;
  refreshInterval?: number;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// =============================================================================
// POPULATION STATISTICS TYPES (from services/statistics/population-pyramid.ts)
// =============================================================================

/**
 * Age group data for population pyramid
 */
export interface AgeGroupData {
  ageRange: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Overall population statistics
 */
export interface PopulationStats {
  totalMale: number;
  totalFemale: number;
  totalPopulation: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Tooltip data for chart interactions
 */
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
