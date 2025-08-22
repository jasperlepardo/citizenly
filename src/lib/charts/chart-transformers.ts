/**
 * Chart Data Transformers Library
 * 
 * @description Pure business logic for transforming raw data into chart-ready formats.
 * Contains data transformation utilities separated from UI components.
 */

// Chart data types
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

export type ChartType = 'dependency' | 'sex' | 'civilStatus' | 'employment';

// Standard chart data point interface
export interface ChartDataPoint {
  label: string;
  value: number;
  percentage: number;
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
  const { single, married, widowed, divorced, separated, annulled, registeredPartnership, liveIn } = data;
  const total = single + married + widowed + divorced + separated + annulled + registeredPartnership + liveIn;
  
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
  const total = employed + unemployed + selfEmployed + student + retired + homemaker + disabled + other;
  
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
    return data.reduce((max, point) => point.value > max.value ? point : max);
  },

  /**
   * Get data point with lowest value
   */
  getMinPoint: (data: ChartDataPoint[]): ChartDataPoint | null => {
    if (data.length === 0) return null;
    return data.reduce((min, point) => point.value < min.value ? point : min);
  },
};