/**
 * Accessibility Types
 */

export interface FieldAccessibilityOptions {
  required?: boolean;
  hasError?: boolean;
  baseId?: string;
  hasHelperText?: boolean;
  label?: string;
}

export interface FieldAccessibilityIds {
  field: string;
  label: string;
  helper: string;
  error: string;
}

export interface FieldAccessibilityProps {
  ids: FieldAccessibilityIds;
  ariaDescribedBy?: string;
  ariaLabelledBy: string;
  ariaInvalid: boolean;
  ariaRequired: boolean;
}

export interface FieldGroupAccessibilityIds {
  group: string;
  legend: string;
  error: string;
}

export interface FieldGroupAccessibilityReturn {
  ids: FieldGroupAccessibilityIds;
  ariaDescribedBy?: string;
  ariaInvalid: boolean;
  ariaRequired: boolean;
  role: 'group';
}