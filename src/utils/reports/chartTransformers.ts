/**
 * Chart Data Transformers Library
 *
 * @description Pure business logic for transforming raw data into chart-ready formats.
 * Contains data transformation utilities separated from UI components.
 *
 * @deprecated Chart types have been moved to @/types/app/ui/charts.
 * This file now re-exports types for backwards compatibility.
 * Please update imports to use the new location directly.
 *
 * @see {@link @/types/app/ui/charts} - New location for chart types
 */

// Import types for internal use and re-export for backwards compatibility
import type {
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
  ChartType,
  ChartDataPoint,
} from '@/types/app/ui/charts';

// Re-export for backwards compatibility
export type {
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
  ChartType,
  ChartDataPoint,
} from '@/types/app/ui/charts';

/**
 * Helper function to create chart data points and reduce complexity
 */
function createChartDataPoint(label: string, value: number, total: number): ChartDataPoint {
  return {
    label,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
    color: '',
  };
}

// Chart configuration constants
export const DEFAULT_CHART_TITLES: Record<ChartType, string> = {
  dependency: 'Age Distribution',
  sex: 'Sex Distribution',
  civilStatus: 'Civil Status Distribution',
  employment: 'Employment Status',
};

export const CHART_COLORS: Record<ChartType, Record<string, string>> = {
  sex: {
    male: '#3b82f6', // primary-500 (matches population pyramid)
    female: '#a855f7', // secondary-500 (matches population pyramid)
  },
  dependency: {},
  civilStatus: {},
  employment: {},
};

/**
 * Transform dependency age data into chart format
 */
export function transformDependencyData(data: DependencyData): ChartDataPoint[] {
  const { youngDependents, workingAge, oldDependents } = data;
  const total = youngDependents + workingAge + oldDependents;

  return [
    {
      label: 'Young (0-14)',
      value: youngDependents,
      percentage: total > 0 ? (youngDependents / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Working (15-64)',
      value: workingAge,
      percentage: total > 0 ? (workingAge / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Elderly (65+)',
      value: oldDependents,
      percentage: total > 0 ? (oldDependents / total) * 100 : 0,
      color: '',
    },
  ];
}

/**
 * Transform sex distribution data into chart format
 */
export function transformSexData(data: SexData): ChartDataPoint[] {
  const { male, female } = data;
  const total = male + female;

  return [
    {
      label: 'Male',
      value: male,
      percentage: total > 0 ? (male / total) * 100 : 0,
      color: CHART_COLORS.sex.male,
    },
    {
      label: 'Female',
      value: female,
      percentage: total > 0 ? (female / total) * 100 : 0,
      color: CHART_COLORS.sex.female,
    },
  ];
}

/**
 * Transform civil status data into chart format
 */
export function transformCivilStatusData(data: CivilStatusData): ChartDataPoint[] {
  const { single, married, widowed, divorced, separated, annulled, registeredPartnership, liveIn } = data;
  const total = single + married + widowed + divorced + separated + annulled + registeredPartnership + liveIn;

  const civilStatusItems = [
    { label: 'Single', value: single },
    { label: 'Married', value: married },
    { label: 'Widowed', value: widowed },
    { label: 'Divorced', value: divorced },
    { label: 'Separated', value: separated },
    { label: 'Annulled', value: annulled },
    { label: 'Registered Partnership', value: registeredPartnership },
    { label: 'Live-in', value: liveIn },
  ];

  return civilStatusItems.map(item => createChartDataPoint(item.label, item.value, total));
}

/**
 * Transform employment status data into chart format
 */
export function transformEmploymentData(data: EmploymentStatusData): ChartDataPoint[] {
  const { employed, unemployed, selfEmployed, student, retired, homemaker, disabled, other } = data;
  const total = employed + unemployed + selfEmployed + student + retired + homemaker + disabled + other;

  const employmentItems = [
    { label: 'Employed', value: employed },
    { label: 'Unemployed', value: unemployed },
    { label: 'Self-employed', value: selfEmployed },
    { label: 'Student', value: student },
    { label: 'Retired', value: retired },
    { label: 'Homemaker', value: homemaker },
    { label: 'Disabled', value: disabled },
    { label: 'Other', value: other },
  ];

  return employmentItems.map(item => createChartDataPoint(item.label, item.value, total));
}

/**
 * Transform chart data based on type
 */
export function transformChartData(
  type: ChartType,
  data: DependencyData | SexData | CivilStatusData | EmploymentStatusData
): ChartDataPoint[] {
  switch (type) {
    case 'dependency':
      return transformDependencyData(data as DependencyData);
    case 'sex':
      return transformSexData(data as SexData);
    case 'civilStatus':
      return transformCivilStatusData(data as CivilStatusData);
    case 'employment':
      return transformEmploymentData(data as EmploymentStatusData);
    default:
      throw new Error(`Unknown chart type: ${type}`);
  }
}

/**
 * Get default title for chart type
 */
export function getChartTitle(type: ChartType, customTitle?: string): string {
  return customTitle || DEFAULT_CHART_TITLES[type];
}

/**
 * Chart utilities for common operations
 */
export const chartUtils = {
  /**
   * Calculate total from chart data points
   */
  calculateTotal: (data: ChartDataPoint[]): number => {
    return data.reduce((sum, point) => sum + point.value, 0);
  },

  /**
   * Filter out empty data points
   */
  filterEmptyPoints: (data: ChartDataPoint[]): ChartDataPoint[] => {
    return data.filter(point => point.value > 0);
  },

  /**
   * Sort data points by value (descending)
   */
  sortByValue: (data: ChartDataPoint[]): ChartDataPoint[] => {
    return [...data].sort((a, b) => b.value - a.value);
  },

  /**
   * Get data point with highest value
   */
  getMaxPoint: (data: ChartDataPoint[]): ChartDataPoint | null => {
    if (data.length === 0) return null;
    return data.reduce((max, point) => (point.value > max.value ? point : max), data[0]);
  },

  /**
   * Get data point with lowest value
   */
  getMinPoint: (data: ChartDataPoint[]): ChartDataPoint | null => {
    if (data.length === 0) return null;
    return data.reduce((min, point) => (point.value < min.value ? point : min), data[0]);
  },
};
