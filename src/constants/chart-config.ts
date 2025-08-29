/**
 * Chart Configuration Constants
 * Consolidated chart-related constants and configurations
 */

// =============================================================================
// CHART COLOR PALETTES
// =============================================================================

/**
 * Primary color palette for charts
 */
export const CHART_COLORS = {
  PRIMARY: [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ],

  SECONDARY: [
    '#64748B', // Slate
    '#6B7280', // Gray
    '#78716C', // Stone
    '#71717A', // Zinc
    '#737373', // Neutral
  ],

  // Semantic colors
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',

  // Gender-specific colors
  MALE: '#3B82F6',
  FEMALE: '#EC4899',

  // Age group colors
  AGE_GROUPS: {
    CHILDREN: '#84CC16', // 0-14
    YOUTH: '#3B82F6', // 15-30
    ADULTS: '#10B981', // 31-59
    SENIORS: '#F59E0B', // 60+
  },

  // Employment status colors
  EMPLOYMENT: {
    EMPLOYED: '#10B981',
    UNEMPLOYED: '#EF4444',
    STUDENT: '#3B82F6',
    RETIRED: '#8B5CF6',
    HOMEMAKER: '#EC4899',
    OTHER: '#6B7280',
  },
} as const;

// =============================================================================
// CHART DIMENSIONS AND SIZING
// =============================================================================

/**
 * Standard chart dimensions
 */
export const CHART_DIMENSIONS = {
  // Default sizes
  SMALL: {
    width: 300,
    height: 200,
  },
  MEDIUM: {
    width: 500,
    height: 300,
  },
  LARGE: {
    width: 800,
    height: 500,
  },

  // Specific chart types
  PIE_CHART: {
    SMALL: { width: 250, height: 250 },
    MEDIUM: { width: 400, height: 400 },
    LARGE: { width: 600, height: 600 },
  },

  BAR_CHART: {
    SMALL: { width: 300, height: 200 },
    MEDIUM: { width: 600, height: 400 },
    LARGE: { width: 900, height: 500 },
  },

  POPULATION_PYRAMID: {
    SMALL: { width: 400, height: 300 },
    MEDIUM: { width: 600, height: 450 },
    LARGE: { width: 800, height: 600 },
  },
} as const;

// =============================================================================
// CHART MARGINS AND PADDING
// =============================================================================

/**
 * Chart margin configurations
 */
export const CHART_MARGINS = {
  DEFAULT: {
    top: 20,
    right: 30,
    bottom: 40,
    left: 50,
  },

  COMPACT: {
    top: 10,
    right: 20,
    bottom: 30,
    left: 40,
  },

  SPACIOUS: {
    top: 40,
    right: 60,
    bottom: 60,
    left: 80,
  },

  PIE_CHART: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
} as const;

// =============================================================================
// CHART TYPOGRAPHY
// =============================================================================

/**
 * Typography settings for charts
 */
export const CHART_TYPOGRAPHY = {
  TITLE: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
  },

  SUBTITLE: {
    fontSize: 14,
    fontWeight: 400,
    color: '#6B7280',
  },

  AXIS_LABEL: {
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
  },

  TICK_LABEL: {
    fontSize: 11,
    fontWeight: 400,
    color: '#6B7280',
  },

  LEGEND: {
    fontSize: 12,
    fontWeight: 400,
    color: '#374151',
  },

  TOOLTIP: {
    fontSize: 12,
    fontWeight: 500,
    color: '#111827',
  },
} as const;

// =============================================================================
// ANIMATION CONFIGURATIONS
// =============================================================================

/**
 * Chart animation settings
 */
export const CHART_ANIMATIONS = {
  DEFAULT: {
    duration: 750,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  FAST: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  SLOW: {
    duration: 1200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  SPRING: {
    duration: 800,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// =============================================================================
// CHART-SPECIFIC CONFIGURATIONS
// =============================================================================

/**
 * Pie chart specific configurations
 */
export const PIE_CHART_CONFIG = {
  innerRadius: 0,
  outerRadius: 100,
  padAngle: 0.02,
  cornerRadius: 2,

  DONUT: {
    innerRadius: 60,
    outerRadius: 100,
  },

  LEGEND: {
    position: 'right',
    itemHeight: 20,
    symbolSize: 12,
  },
} as const;

/**
 * Bar chart specific configurations
 */
export const BAR_CHART_CONFIG = {
  barPadding: 0.1,
  categoryPadding: 0.2,
  cornerRadius: 4,

  HORIZONTAL: {
    barHeight: 20,
    categoryHeight: 30,
  },

  VERTICAL: {
    barWidth: 30,
    categoryWidth: 40,
  },
} as const;

/**
 * Population pyramid specific configurations
 */
export const POPULATION_PYRAMID_CONFIG = {
  ageGroupHeight: 15,
  ageGroupPadding: 2,
  centerGap: 20,
  maxBarWidth: 150,

  LABELS: {
    showAgeLabels: true,
    showPercentageLabels: true,
    showCountLabels: false,
  },

  COLORS: {
    male: '#3B82F6',
    female: '#EC4899',
  },
} as const;

// =============================================================================
// RESPONSIVE BREAKPOINTS
// =============================================================================

/**
 * Responsive breakpoints for charts
 */
export const CHART_BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1440,
} as const;

/**
 * Responsive chart configurations
 */
export const RESPONSIVE_CHART_CONFIG = {
  MOBILE: {
    fontSize: 10,
    margins: CHART_MARGINS.COMPACT,
    showLegend: false,
  },

  TABLET: {
    fontSize: 11,
    margins: CHART_MARGINS.DEFAULT,
    showLegend: true,
  },

  DESKTOP: {
    fontSize: 12,
    margins: CHART_MARGINS.DEFAULT,
    showLegend: true,
  },
} as const;

// =============================================================================
// ACCESSIBILITY CONFIGURATIONS
// =============================================================================

/**
 * Accessibility settings for charts
 */
export const CHART_ACCESSIBILITY = {
  // Color contrast ratios (WCAG AA compliant)
  CONTRAST_RATIOS: {
    TEXT: 4.5,
    GRAPHICS: 3,
  },

  // Alternative text patterns
  ALT_TEXT_PATTERNS: {
    PIE_CHART: 'Pie chart showing {title}. {description}',
    BAR_CHART: 'Bar chart showing {title}. {description}',
    POPULATION_PYRAMID: 'Population pyramid showing {title}. {description}',
  },

  // Keyboard navigation
  KEYBOARD_NAVIGATION: {
    tabIndex: 0,
    ariaLabel: 'Interactive chart',
    ariaDescription: 'Use arrow keys to navigate chart elements',
  },
} as const;
