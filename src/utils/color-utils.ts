/**
 * Color Generation Utilities - CONSOLIDATED
 * Pure utility functions for generating colors for charts and graphics
 * Moved from src/lib/ui/colorGenerator.ts for centralization
 */

/**
 * Semantic chart color palette aligned with design system
 * Uses brand colors from tailwind.config.js for consistent theming
 */
export const SEMANTIC_CHART_PALETTE = [
  '#3B82F6', // Primary Blue (brandColors.primary[600])
  '#10B981', // Success Green (brandColors.success[600])
  '#F59E0B', // Warning Orange (brandColors.warning[600])
  '#EF4444', // Danger Red (brandColors.danger[600])
  '#8B5CF6', // Secondary Purple (brandColors.secondary[600])
  '#6B7280', // Neutral Gray (brandColors.zinc[500])
  '#059669', // Success Dark (brandColors.success[700])
  '#D97706', // Warning Dark (brandColors.warning[700])
  '#DC2626', // Danger Dark (brandColors.danger[700])
  '#7C3AED', // Secondary Dark (brandColors.secondary[700])
  '#374151', // Neutral Dark (brandColors.zinc[700])
  '#2563EB', // Primary Dark (brandColors.primary[700])
  '#065F46', // Success Darker (brandColors.success[800])
  '#92400E', // Warning Darker (brandColors.warning[800])
  '#991B1B', // Danger Darker (brandColors.danger[800])
];

/**
 * Generate color variations using semantic chart palette
 */
export function generateColorVariations(count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    return SEMANTIC_CHART_PALETTE[index % SEMANTIC_CHART_PALETTE.length];
  });
}

/**
 * Check if a color is valid and usable
 */
export function isValidColor(color: string): boolean {
  return !!(color && color !== '' && color !== '#000000');
}

/**
 * Apply colors to data items, using predefined colors when available
 */
export function applyColorsToData<T extends { color: string }>(
  data: T[],
  colorGenerator: (count: number) => string[] = generateColorVariations
): T[] {
  const colorVariations = colorGenerator(data.length);

  return data.map((item, index) => {
    // If item has a valid predefined color, use it; otherwise use generated color
    if (isValidColor(item.color)) {
      return item;
    }

    return {
      ...item,
      color: colorVariations[index],
    };
  });
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Lighten a hex color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 + percent / 100;
  const r = Math.min(255, Math.round(rgb.r * factor));
  const g = Math.min(255, Math.round(rgb.g * factor));
  const b = Math.min(255, Math.round(rgb.b * factor));

  return rgbToHex(r, g, b);
}

/**
 * Darken a hex color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = Math.max(0, Math.round(rgb.r * factor));
  const g = Math.max(0, Math.round(rgb.g * factor));
  const b = Math.max(0, Math.round(rgb.b * factor));

  return rgbToHex(r, g, b);
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastingTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  // Calculate luminance using WCAG formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate a random hex color
 */
export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Check if a color string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Convert color to rgba with alpha
 */
export function colorToRgba(hex: string, alpha: number = 1): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Color utility functions object (for backward compatibility)
 * @deprecated Use individual exported functions instead
 */
export const colorUtils = {
  hexToRgb,
  rgbToHex,
  lightenColor,
  darkenColor,
  getContrastingTextColor,
};