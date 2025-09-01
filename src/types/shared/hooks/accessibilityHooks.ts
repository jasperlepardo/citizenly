/**
 * Accessibility Hook Types
 *
 * @fileoverview TypeScript interfaces for accessibility-related React hooks
 * in the Citizenly RBI system.
 */

// =============================================================================
// ACCESSIBILITY HOOK TYPES
// =============================================================================

/**
 * Field accessibility options interface
 * Consolidates from src/hooks/accessibility/useFieldAccessibility.ts
 */
export interface FieldAccessibilityOptions {
  /** Base identifier for the field */
  baseId?: string;
  /** Whether the field has an error */
  hasError?: boolean;
  /** Whether the field has helper text */
  hasHelperText?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Custom label */
  label?: string;
}

/**
 * Field accessibility IDs interface
 * Consolidates from src/hooks/accessibility/useFieldAccessibility.ts
 */
export interface FieldAccessibilityIds {
  /** ID for the field input element */
  field: string;
  /** ID for the field label */
  label: string;
  /** ID for helper text */
  helper: string;
  /** ID for error message */
  error: string;
}

/**
 * Field accessibility props interface
 * Consolidates from src/hooks/accessibility/useFieldAccessibility.ts
 */
export interface FieldAccessibilityProps {
  /** Generated IDs for field elements */
  ids: FieldAccessibilityIds;
  /** aria-describedby attribute value */
  ariaDescribedBy?: string;
  /** aria-labelledby attribute value */
  ariaLabelledBy: string;
  /** aria-invalid attribute value */
  ariaInvalid: boolean | 'false' | 'true';
  /** aria-required attribute value */
  ariaRequired: boolean | 'false' | 'true';
}

/**
 * Field group accessibility return interface
 * Consolidates from src/hooks/accessibility/useFieldAccessibility.ts
 */
export interface FieldGroupAccessibilityReturn {
  ids: {
    group: string;
    legend: string;
    error: string;
  };
  ariaDescribedBy?: string;
  ariaInvalid: boolean;
  ariaRequired: boolean;
  role: 'group';
}