/**
 * Chart Size Constants
 *
 * @description Centralized chart sizing values aligned with design tokens.
 * These values correspond to the chart sizing tokens in tailwind.config.js.
 */

export const CHART_SIZES = {
  /**
   * Pie chart radius values
   */
  PIE_CHART_RADIUS_DEFAULT: 45, // Corresponds to size-chart-radius-default (45px)
  PIE_CHART_RADIUS_HOVER: 47, // Corresponds to size-chart-radius-hover (47px)
} as const;

export type ChartSizes = typeof CHART_SIZES;
