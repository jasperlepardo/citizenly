/**
 * Standardized Form Field Types
 * Common interfaces for form field components to ensure consistency
 */

import { ReactNode } from 'react';

/**
 * Base form field props that all form components should implement
 */
export interface BaseFormFieldProps {
  /** Field label text */
  label?: string;

  /** Helper text shown below the field */
  helperText?: string;

  /** Error message text (overrides helperText when present) */
  errorMessage?: string;

  /** Whether the field is required */
  required?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Whether the field is disabled */
  disabled?: boolean;

  /** Placeholder text for input fields */
  placeholder?: string;
}

/**
 * Props for form fields with icon support
 */
export interface FormFieldWithIconsProps extends BaseFormFieldProps {
  /** Icon displayed on the left side */
  leftIcon?: ReactNode;

  /** Icon displayed on the right side */
  rightIcon?: ReactNode;

  /** Addon content displayed on the left side (e.g., currency symbol) */
  leftAddon?: ReactNode;

  /** Addon content displayed on the right side (e.g., unit label) */
  rightAddon?: ReactNode;
}

/**
 * Props for clearable form fields
 */
export interface ClearableFormFieldProps extends FormFieldWithIconsProps {
  /** Whether the field can be cleared */
  clearable?: boolean;

  /** Callback when field is cleared */
  onClear?: () => void;
}

/**
 * Common validation state types
 */
export type ValidationState = 'default' | 'error' | 'success' | 'warning';

/**
 * Common field sizes
 */
export type FieldSize = 'sm' | 'md' | 'lg';

/**
 * Props for form fields with validation states
 */
export interface ValidatedFormFieldProps extends ClearableFormFieldProps {
  /** Visual state of the field */
  state?: ValidationState;

  /** Size variant of the field */
  size?: FieldSize;
}

/**
 * Props for form fields with loading states
 */
export interface LoadableFormFieldProps extends ValidatedFormFieldProps {
  /** Whether the field is in loading state */
  loading?: boolean;
}

/**
 * Generic select option type for dropdown components
 * @deprecated Use the specific SelectOption from SelectField component instead
 */
export interface GenericSelectOption<T = string> {
  /** Display label */
  label: string;

  /** Option value */
  value: T;

  /** Whether option is disabled */
  disabled?: boolean;

  /** Optional description */
  description?: string;

  /** Optional icon */
  icon?: ReactNode;

  /** Optional group/category */
  group?: string;
}

/**
 * Props for select field components
 */
export interface SelectFieldBaseProps<T = string> extends LoadableFormFieldProps {
  /** Available options */
  options: GenericSelectOption<T>[];

  /** Currently selected value */
  value?: T | T[];

  /** Callback when selection changes */
  onChange?: (value: T | T[] | undefined) => void;

  /** Whether multiple selection is allowed */
  multiple?: boolean;

  /** Whether the field is searchable */
  searchable?: boolean;

  /** Custom search filter function */
  filterOption?: (option: GenericSelectOption<T>, search: string) => boolean;
}

/**
 * Props for form section/group components
 */
export interface FormSectionProps {
  /** Section title/legend */
  title?: string;

  /** Section description */
  description?: string;

  /** Child form fields */
  children: ReactNode;

  /** Whether any field in the section is required */
  required?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Spacing between fields */
  spacing?: 'sm' | 'md' | 'lg';

  /** Section layout orientation */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Common field validation function type
 */
export type FieldValidator<T> = (value: T) => string | undefined;

/**
 * Props for form fields with built-in validation
 */
export interface ValidatableFormFieldProps<T> extends LoadableFormFieldProps {
  /** Field value */
  value?: T;

  /** Change handler */
  onChange?: (value: T) => void;

  /** Validation function */
  validator?: FieldValidator<T>;

  /** Whether to validate on change */
  validateOnChange?: boolean;

  /** Whether to validate on blur */
  validateOnBlur?: boolean;
}
