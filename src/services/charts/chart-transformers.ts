/**
 * Chart Data Transformers Library
 * @fileoverview Pure business logic for transforming raw demographic data into chart-ready formats.
 * Provides type-safe transformations for various chart types used in the Citizenly dashboard.
 *
 * @description
 * This module contains data transformation utilities that are completely separated from UI components,
 * making them highly testable and reusable across different visualization contexts.
 *
 * Supported chart types:
 * - Dependency ratio charts (age demographics)
 * - Sex distribution charts
 * - Civil status breakdown charts
 * - Employment status analysis charts
 *
 * @author Citizenly Development Team
 * @since 2.0.0
 * @version 2.1.0
 *
 * @example
 * ```typescript
 * import { transformSexData, ChartDataPoint } from './chart-transformers';
 *
 * const rawData = { male: 150, female: 175 };
 * const chartPoints: ChartDataPoint[] = transformSexData(rawData);
 * // Result: [
 * //   { label: 'Male', value: 150, percentage: 46.15, color: '#3B82F6' },
 * //   { label: 'Female', value: 175, percentage: 53.85, color: '#EC4899' }
 * // ]
 * ```
 */

/**
 * Raw demographic data for dependency ratio analysis
 * @typedef {Object} DependencyData
 * @property {number} youngDependents - Population under 15 years old
 * @property {number} workingAge - Population 15-64 years old
 * @property {number} oldDependents - Population 65+ years old
 * @since 2.0.0
 */
export type DependencyData = {
  /** Population under 15 years old */
  youngDependents: number;
  /** Population 15-64 years old */
  workingAge: number;
  /** Population 65+ years old */
  oldDependents: number;
};

/**
 * Raw sex distribution data
 * @typedef {Object} SexData
 * @property {number} male - Male population count
 * @property {number} female - Female population count
 * @since 2.0.0
 */
export type SexData = {
  /** Male population count */
  male: number;
  /** Female population count */
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
 * Supported chart types for demographic visualization
 * @typedef {'dependency' | 'sex' | 'civilStatus' | 'employment'} ChartType
 * @since 2.0.0
 */
export type ChartType = 'dependency' | 'sex' | 'civilStatus' | 'employment';

/**
 * Standard chart data point interface used across all chart types
 * @interface ChartDataPoint
 * @since 2.0.0
 *
 * @example
 * ```typescript
 * const dataPoint: ChartDataPoint = {
 *   label: 'Male',
 *   value: 150,
 *   percentage: 46.15,
 *   color: '#3B82F6'
 * };
 * ```
 */
export interface ChartDataPoint {
  /** Display label for the data point */
  label: string;
  /** Raw numeric value */
  value: number;
  /** Calculated percentage of total (0-100) */
  percentage: number;
  /** Hex color code for visualization */
  color: string;
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
  const { single, married, widowed, divorced, separated, annulled, registeredPartnership, liveIn } =
    data;
  const total =
    single + married + widowed + divorced + separated + annulled + registeredPartnership + liveIn;

  return [
    {
      label: 'Single',
      value: single,
      percentage: total > 0 ? (single / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Married',
      value: married,
      percentage: total > 0 ? (married / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Widowed',
      value: widowed,
      percentage: total > 0 ? (widowed / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Divorced',
      value: divorced,
      percentage: total > 0 ? (divorced / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Separated',
      value: separated,
      percentage: total > 0 ? (separated / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Annulled',
      value: annulled,
      percentage: total > 0 ? (annulled / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Registered Partnership',
      value: registeredPartnership,
      percentage: total > 0 ? (registeredPartnership / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Live-in',
      value: liveIn,
      percentage: total > 0 ? (liveIn / total) * 100 : 0,
      color: '',
    },
  ];
}

/**
 * Transform employment status data into chart format
 */
export function transformEmploymentData(data: EmploymentStatusData): ChartDataPoint[] {
  const { employed, unemployed, selfEmployed, student, retired, homemaker, disabled, other } = data;
  const total =
    employed + unemployed + selfEmployed + student + retired + homemaker + disabled + other;

  return [
    {
      label: 'Employed',
      value: employed,
      percentage: total > 0 ? (employed / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Unemployed',
      value: unemployed,
      percentage: total > 0 ? (unemployed / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Self-employed',
      value: selfEmployed,
      percentage: total > 0 ? (selfEmployed / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Student',
      value: student,
      percentage: total > 0 ? (student / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Retired',
      value: retired,
      percentage: total > 0 ? (retired / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Homemaker',
      value: homemaker,
      percentage: total > 0 ? (homemaker / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Disabled',
      value: disabled,
      percentage: total > 0 ? (disabled / total) * 100 : 0,
      color: '',
    },
    {
      label: 'Other',
      value: other,
      percentage: total > 0 ? (other / total) * 100 : 0,
      color: '',
    },
  ];
}

/**
 * Map chart types to their corresponding data types
 */
type ChartDataMap = {
  dependency: DependencyData;
  sex: SexData;
  civilStatus: CivilStatusData;
  employment: EmploymentStatusData;
};

/**
 * Transform chart data based on type - type-safe version
 */
export function transformChartData<T extends ChartType>(
  type: T,
  data: ChartDataMap[T]
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
 * Legacy function - kept for backward compatibility
 * @deprecated Use the type-safe version above
 */
export function transformChartDataLegacy(
  type: ChartType,
  data: DependencyData | SexData | CivilStatusData | EmploymentStatusData
): ChartDataPoint[] {
  return transformChartData(type, data as any);
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
    return data.reduce((max, point) => (point.value > max.value ? point : max));
  },

  /**
   * Get data point with lowest value
   */
  getMinPoint: (data: ChartDataPoint[]): ChartDataPoint | null => {
    if (data.length === 0) return null;
    return data.reduce((min, point) => (point.value < min.value ? point : min));
  },
};
