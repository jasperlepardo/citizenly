/**
 * Citizenly Design System - Utility Functions
 * Helper functions for working with design tokens and maintaining consistency
 */

import { designTokens } from './tokens';

// =============================================================================
// COLOR UTILITIES
// =============================================================================

/**
 * Get color value from design tokens
 * @param colorPath - Dot notation path to color (e.g., 'primary.500', 'semantic.text.primary')
 * @returns Hex color value
 */
export function getColor(colorPath: string): string {
  const keys = colorPath.split('.');
  let current: any = designTokens.colors;

  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Color token '${colorPath}' not found. Using fallback.`);
      return designTokens.colors.neutral[500];
    }
    current = current[key];
  }

  return current;
}

/**
 * Get semantic color for RBI classifications
 * @param classification - RBI sectoral classification type
 * @returns Color value
 */
export function getRBIColor(
  classification:
    | 'laborForce'
    | 'unemployed'
    | 'seniorCitizen'
    | 'youth'
    | 'pwd'
    | 'ofw'
    | 'indigenous'
    | 'migrant'
    | 'nuclear'
    | 'singleParent'
    | 'extended'
    | 'childless'
    | 'grandparents'
    | 'stepfamily'
    | 'active'
    | 'inactive'
    | 'pending'
    | 'verified'
    | 'unverified'
): string {
  return designTokens.semantic.rbi[classification] || designTokens.colors.neutral[500];
}

/**
 * Generate color variants (lighter/darker) for a base color
 * @param baseColor - Base hex color
 * @param variant - Variant type
 * @returns Modified color
 */
export function getColorVariant(
  baseColor: string,
  variant: 'lighter' | 'darker' | 'muted'
): string {
  // This is a simplified implementation
  // In a production system, you might use a color manipulation library
  const colorMap: Record<string, Record<string, string>> = {
    [designTokens.colors.primary[500]]: {
      lighter: designTokens.colors.primary[100],
      darker: designTokens.colors.primary[700],
      muted: designTokens.colors.primary[200],
    },
    [designTokens.colors.secondary[700]]: {
      lighter: designTokens.colors.secondary[100],
      darker: designTokens.colors.secondary[800],
      muted: designTokens.colors.secondary[200],
    },
    // Add more mappings as needed
  };

  return colorMap[baseColor]?.[variant] || baseColor;
}

// =============================================================================
// SPACING UTILITIES
// =============================================================================

/**
 * Get spacing value from design tokens
 * @param size - Spacing size key
 * @returns Spacing value in pixels
 */
export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size];
}

/**
 * Generate responsive spacing classes
 * @param baseSize - Base spacing size
 * @returns Object with responsive spacing
 */
export function getResponsiveSpacing(baseSize: keyof typeof designTokens.spacing) {
  return {
    base: designTokens.spacing[baseSize],
    sm: designTokens.spacing[baseSize],
    md:
      designTokens.spacing[
        Math.min(Number(baseSize) + 1, 96) as keyof typeof designTokens.spacing
      ] || designTokens.spacing[baseSize],
    lg:
      designTokens.spacing[
        Math.min(Number(baseSize) + 2, 96) as keyof typeof designTokens.spacing
      ] || designTokens.spacing[baseSize],
  };
}

// =============================================================================
// TYPOGRAPHY UTILITIES
// =============================================================================

/**
 * Get font size configuration
 * @param size - Font size key
 * @returns Font size configuration with line height
 */
export function getFontSize(size: keyof typeof designTokens.typography.fontSize) {
  return designTokens.typography.fontSize[size];
}

/**
 * Generate typography scale for headings
 * @param level - Heading level (1-6)
 * @returns Typography configuration
 */
export function getHeadingStyle(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const sizeMap = {
    1: '4xl',
    2: '3xl',
    3: '2xl',
    4: 'xl',
    5: 'lg',
    6: 'base',
  } as const;

  const weightMap = {
    1: designTokens.typography.fontWeight.bold,
    2: designTokens.typography.fontWeight.bold,
    3: designTokens.typography.fontWeight.semibold,
    4: designTokens.typography.fontWeight.semibold,
    5: designTokens.typography.fontWeight.medium,
    6: designTokens.typography.fontWeight.medium,
  };

  return {
    fontSize: designTokens.typography.fontSize[sizeMap[level]],
    fontWeight: weightMap[level],
    fontFamily: designTokens.typography.fontFamily.display,
  };
}

// =============================================================================
// COMPONENT UTILITIES
// =============================================================================

/**
 * Get button styles based on variant and size
 * @param variant - Button variant
 * @param size - Button size
 * @returns Style configuration
 */
export function getButtonStyles(
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' | 'ghost',
  size: 'sm' | 'md' | 'lg' = 'md'
) {
  const baseStyles = {
    fontFamily: designTokens.typography.fontFamily.primary,
    fontWeight: designTokens.typography.fontWeight.medium,
    borderRadius: designTokens.borderRadius.md,
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    height: designTokens.components.button.height[size],
  };

  const variantStyles = {
    primary: {
      backgroundColor: designTokens.colors.primary[500],
      color: designTokens.colors.neutral[50],
      '&:hover': { backgroundColor: designTokens.colors.primary[600] },
    },
    secondary: {
      backgroundColor: designTokens.colors.secondary[700],
      color: designTokens.colors.neutral[50],
      '&:hover': { backgroundColor: designTokens.colors.secondary[800] },
    },
    success: {
      backgroundColor: designTokens.colors.success[600],
      color: designTokens.colors.neutral[50],
      '&:hover': { backgroundColor: designTokens.colors.success[700] },
    },
    warning: {
      backgroundColor: designTokens.colors.warning[600],
      color: designTokens.colors.neutral[50],
      '&:hover': { backgroundColor: designTokens.colors.warning[700] },
    },
    danger: {
      backgroundColor: designTokens.colors.danger[600],
      color: designTokens.colors.neutral[50],
      '&:hover': { backgroundColor: designTokens.colors.danger[700] },
    },
    neutral: {
      backgroundColor: designTokens.colors.neutral[300],
      color: designTokens.colors.neutral[700],
      '&:hover': { backgroundColor: designTokens.colors.neutral[400] },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: designTokens.colors.neutral[700],
      '&:hover': { backgroundColor: designTokens.colors.neutral[100] },
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
  };
}

/**
 * Get form input styles based on state
 * @param state - Input state
 * @returns Style configuration
 */
export function getInputStyles(
  state: 'default' | 'focus' | 'error' | 'success' | 'disabled' = 'default'
) {
  const baseStyles = {
    fontFamily: designTokens.typography.fontFamily.primary,
    fontSize: designTokens.typography.fontSize.base,
    padding: designTokens.components.input.padding.md,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: '1px',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const stateStyles = {
    default: {
      borderColor: designTokens.colors.neutral[300],
      backgroundColor: designTokens.colors.neutral[50],
    },
    focus: {
      borderColor: designTokens.colors.primary[500],
      boxShadow: designTokens.boxShadow['primary-focus'],
    },
    error: {
      borderColor: designTokens.colors.danger[500],
      boxShadow: designTokens.boxShadow['danger-focus'],
    },
    success: {
      borderColor: designTokens.colors.success[500],
      boxShadow: designTokens.boxShadow['success-focus'],
    },
    disabled: {
      borderColor: designTokens.colors.neutral[200],
      backgroundColor: designTokens.colors.neutral[100],
      color: designTokens.colors.neutral[400],
    },
  };

  return {
    ...baseStyles,
    ...stateStyles[state],
  };
}

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Check if color combination meets WCAG contrast requirements
 * @param foreground - Foreground color
 * @param background - Background color
 * @param level - WCAG level ('AA' | 'AAA')
 * @returns Boolean indicating if contrast is sufficient
 */
export function checkContrast(
  foreground: string,
  background: string,
  _level: 'AA' | 'AAA' = 'AA'
): boolean {
  // This is a simplified implementation
  // In production, you would use a proper contrast calculation library

  // Common combinations we know are compliant
  const compliantCombinations = {
    [`${designTokens.colors.neutral[800]}_${designTokens.colors.neutral[50]}`]: true,
    [`${designTokens.colors.neutral[50]}_${designTokens.colors.primary[500]}`]: true,
    [`${designTokens.colors.neutral[50]}_${designTokens.colors.secondary[700]}`]: true,
  };

  const key = `${foreground}_${background}`;

  // Use _level for future implementation of different contrast requirements
  // const minRatio = _level === 'AAA' ? 7 : 4.5;

  return compliantCombinations[key] || false;
}

/**
 * Get focus ring styles for interactive elements
 * @param variant - Color variant for focus ring
 * @returns Focus ring styles
 */
export function getFocusRing(
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'primary'
) {
  return {
    outline: 'none',
    boxShadow: designTokens.boxShadow[`${variant}-focus`],
  };
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate that a component uses design system tokens
 * @param styles - Component styles object
 * @returns Validation results with suggestions
 */
export function validateDesignTokenUsage(styles: Record<string, any>) {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for hardcoded colors
  for (const [property, value] of Object.entries(styles)) {
    if (typeof value === 'string' && value.match(/#[0-9a-fA-F]{6}/)) {
      warnings.push(`Hardcoded color '${value}' in property '${property}'`);
      suggestions.push(`Consider using a design token instead of '${value}'`);
    }

    // Check for non-standard spacing values
    if (property.includes('padding') || property.includes('margin')) {
      if (
        typeof value === 'string' &&
        !(Object.values(designTokens.spacing) as string[]).includes(value)
      ) {
        warnings.push(`Non-standard spacing '${value}' in property '${property}'`);
        suggestions.push(
          `Consider using spacing tokens: ${Object.keys(designTokens.spacing).slice(0, 5).join(', ')}...`
        );
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  };
}

// =============================================================================
// RBI-SPECIFIC UTILITIES
// =============================================================================

/**
 * Get appropriate color for sectoral classification badge
 * @param classification - Sectoral classification
 * @param variant - Badge variant style
 * @returns Badge color configuration
 */
export function getSectoralBadgeColor(
  classification: string,
  variant: 'solid' | 'outline' | 'subtle' = 'solid'
) {
  const baseColor = getRBIColor(classification as any);

  switch (variant) {
    case 'solid':
      return {
        backgroundColor: baseColor,
        color: designTokens.colors.neutral[50],
        borderColor: baseColor,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        color: baseColor,
        borderColor: baseColor,
      };
    case 'subtle':
      return {
        backgroundColor: getColorVariant(baseColor, 'muted'),
        color: getColorVariant(baseColor, 'darker'),
        borderColor: 'transparent',
      };
  }
}

/**
 * Get household type icon and color
 * @param householdType - Type of household
 * @returns Icon and color configuration
 */
export function getHouseholdTypeStyle(householdType: string) {
  const styles = {
    nuclear: { icon: '👪', color: designTokens.colors.primary[500] },
    single_parent: { icon: '👩‍👧‍👦', color: designTokens.colors.secondary[500] },
    extended: { icon: '🏠', color: designTokens.colors.success[500] },
    childless: { icon: '👫', color: designTokens.colors.neutral[500] },
    grandparents: { icon: '👴👵', color: designTokens.colors.secondary[600] },
    stepfamily: { icon: '👨‍👩‍👧‍👧', color: designTokens.colors.primary[600] },
  };

  return styles[householdType as keyof typeof styles] || styles.nuclear;
}

const designSystemUtils = {
  getColor,
  getRBIColor,
  getColorVariant,
  getSpacing,
  getResponsiveSpacing,
  getFontSize,
  getHeadingStyle,
  getButtonStyles,
  getInputStyles,
  checkContrast,
  getFocusRing,
  validateDesignTokenUsage,
  getSectoralBadgeColor,
  getHouseholdTypeStyle,
};

export default designSystemUtils;
