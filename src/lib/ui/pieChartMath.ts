/**
 * Pie Chart Mathematics Library
 *
 * @description Pure mathematical functions for pie chart calculations.
 * Contains geometry calculations for pie slices, angles, and SVG path generation.
 */

// Import similar types from centralized location
// Note: These have different fields from @/types/components versions
// (percentage field vs value field, etc) so we keep separate definitions
export interface PieSliceData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PieSliceWithAngles extends PieSliceData {
  startAngle: number;
  endAngle: number;
}

/**
 * Create SVG path for pie slices
 */
export function createPieSlicePath(startAngle: number, endAngle: number, radius: number): string {
  // Convert angles to radians and adjust for SVG coordinate system (start from top)
  const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
  const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = 50 + radius * Math.cos(startAngleRad);
  const y1 = 50 + radius * Math.sin(startAngleRad);
  const x2 = 50 + radius * Math.cos(endAngleRad);
  const y2 = 50 + radius * Math.sin(endAngleRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return ['M', 50, 50, 'L', x1, y1, 'A', radius, radius, 0, largeArcFlag, 1, x2, y2, 'Z'].join(' ');
}

/**
 * Calculate angles for pie chart slices
 */
export function calculatePieSliceAngles(data: PieSliceData[]): PieSliceWithAngles[] {
  let currentAngle = 0;

  return data.map(item => {
    const angle = (item.percentage / 100) * 360;
    const slice: PieSliceWithAngles = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return slice;
  });
}

/**
 * Calculate the total value from pie chart data
 */
export function calculatePieChartTotal(data: PieSliceData[]): number {
  return data.reduce((sum, item) => sum + item.value, 0);
}

/**
 * Filter out empty data points (value > 0)
 */
export function filterNonEmptySlices(data: PieSliceData[]): PieSliceData[] {
  return data.filter(item => item.value > 0);
}

/**
 * Check if there's only one non-empty slice (100% case)
 */
export function isSingleSlice(data: PieSliceData[]): boolean {
  return filterNonEmptySlices(data).length === 1;
}

/**
 * Get the single non-empty slice
 */
export function getSingleSlice(data: PieSliceData[]): PieSliceData | null {
  const nonEmptySlices = filterNonEmptySlices(data);
  return nonEmptySlices.length === 1 ? nonEmptySlices[0] : null;
}

/**
 * Pie chart mathematical utilities
 */
export const pieChartMath = {
  /**
   * Convert degrees to radians
   */
  degreesToRadians: (degrees: number): number => {
    return (degrees * Math.PI) / 180;
  },

  /**
   * Convert radians to degrees
   */
  radiansToDegrees: (radians: number): number => {
    return (radians * 180) / Math.PI;
  },

  /**
   * Calculate point coordinates on a circle
   */
  getCirclePoint: (centerX: number, centerY: number, radius: number, angle: number) => {
    const angleRad = pieChartMath.degreesToRadians(angle - 90); // Adjust for top start
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad),
    };
  },

  /**
   * Calculate arc midpoint angle
   */
  getArcMidpointAngle: (startAngle: number, endAngle: number): number => {
    return startAngle + (endAngle - startAngle) / 2;
  },

  /**
   * Calculate if an arc is a large arc (> 180 degrees)
   */
  isLargeArc: (startAngle: number, endAngle: number): boolean => {
    return endAngle - startAngle > 180;
  },

  /**
   * Calculate label positioning for pie slices
   */
  getLabelPosition: (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    offset: number = 10
  ) => {
    const midAngle = pieChartMath.getArcMidpointAngle(startAngle, endAngle);
    return pieChartMath.getCirclePoint(centerX, centerY, radius + offset, midAngle);
  },

  /**
   * Validate pie chart data percentages
   */
  validatePercentages: (data: PieSliceData[]): boolean => {
    const totalPercentage = data.reduce((sum, item) => sum + item.percentage, 0);
    return Math.abs(totalPercentage - 100) < 0.01; // Allow for small floating point errors
  },

  /**
   * Normalize percentages to ensure they sum to 100%
   */
  normalizePercentages: (data: PieSliceData[]): PieSliceData[] => {
    const total = data.reduce((sum, item) => sum + item.percentage, 0);

    if (total === 0) return data;

    return data.map(item => ({
      ...item,
      percentage: (item.percentage / total) * 100,
    }));
  },
};
