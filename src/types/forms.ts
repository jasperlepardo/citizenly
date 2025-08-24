/**
 * Form Types Library
 * Consolidated form field types and interfaces for consistent form behavior
 * Combines form-specific types from lib/types/forms.ts and components/types/form-field.ts
 */

import { ReactNode } from 'react';

// =============================================================================
// BASE FORM FIELD INTERFACES
// =============================================================================

/**
 * Base form field props that all form components should implement
 */
export interface BaseFieldSetProps {
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
export interface FieldSetWithIconsProps extends BaseFieldSetProps {
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
export interface ClearableFieldSetProps extends FieldSetWithIconsProps {
  /** Whether the field can be cleared */
  clearable?: boolean;

  /** Callback when field is cleared */
  onClear?: () => void;
}

// =============================================================================
// VALIDATION AND STATE TYPES
// =============================================================================

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
export interface ValidatedFieldSetProps extends ClearableFieldSetProps {
  /** Visual state of the field */
  state?: ValidationState;

  /** Size variant of the field */
  size?: FieldSize;
}

/**
 * Props for form fields with loading states
 */
export interface LoadableFieldSetProps extends ValidatedFieldSetProps {
  /** Whether the field is in loading state */
  loading?: boolean;
}

// =============================================================================
// SELECT AND OPTION INTERFACES
// =============================================================================

/**
 * Generic select option type for dropdown components
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
export interface SelectFieldBaseProps<T = string> extends LoadableFieldSetProps {
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

// =============================================================================
// FORM SECTION AND LAYOUT INTERFACES
// =============================================================================

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

// =============================================================================
// VALIDATION INTERFACES
// =============================================================================

/**
 * Common field validation function type
 */
export type FieldValidator<T> = (value: T) => string | undefined;

/**
 * Props for form fields with built-in validation
 */
export interface ValidatableFieldSetProps<T> extends LoadableFieldSetProps {
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

// =============================================================================
// FORM SUBMISSION AND STATE
// =============================================================================

/**
 * Form modes supported by the application
 */
export type FormMode = 'view' | 'edit' | 'create';

/**
 * Common form submission state
 */
export interface FormSubmissionState {
  /** Whether form is currently submitting */
  isSubmitting: boolean;

  /** Whether form has been submitted successfully */
  isSubmitted: boolean;

  /** General form error message */
  error?: string;

  /** Field-specific validation errors */
  fieldErrors?: Record<string, string>;
}

// =============================================================================
// FORM DATA INTERFACES FROM DATABASE
// =============================================================================

/**
 * Resident form data (from database schema)
 */
export interface ResidentFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  extensionName?: string;
  birthdate: string;
  sex: 'male' | 'female';
  civilStatus: string;
  civilStatusOthersSpecify?: string;
  citizenship: string;
  mobileNumber?: string;
  telephoneNumber?: string;
  email?: string;
  motherMaidenFirstName?: string;
  motherMaidenMiddleName?: string;
  motherMaidenLastName?: string;
  birthPlaceCode?: string;
  householdCode?: string;
  bloodType?: string;
  height?: string;
  weight?: string;
  complexion?: string;
  ethnicity?: string;
  religion?: string;
  religionOthersSpecify?: string;
  employmentStatus?: string;
  educationAttainment?: string;
  isGraduate?: boolean;
  occupationCode?: string;
  philsysCardNumber?: string;
  isVoter?: boolean;
  isResidentVoter?: boolean;
  lastVotedDate?: string;
}

/**
 * Household form data
 */
export interface HouseholdFormData {
  code: string;
  streetName?: string;
  subdivisionName?: string;
  householdNumber?: string;
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  headResidentId?: string;
  householdType?: string;
  tenureStatus?: string;
  monthlyIncome?: number;
  incomeClass?: string;
}

// =============================================================================
// FORM COMPONENT SPECIFIC TYPES
// =============================================================================

/**
 * Extended Household Form Data with additional UI fields
 */
export interface ExtendedHouseholdFormData extends HouseholdFormData {
  // Additional fields for the form that aren't in the database
  houseNumber?: string;
  streetId?: string;
  subdivisionId?: string;
  zipCode?: string;
  noOfFamilies?: number;
  noOfHouseholdMembers?: number;
  noOfMigrants?: number;
}

/**
 * Household Details Form Data
 */
export interface HouseholdDetailsData {
  houseNumber?: string;
  streetId?: string;
  subdivisionId?: string;
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  zipCode?: string;
  noOfFamilies?: number;
  noOfHouseholdMembers?: number;
  noOfMigrants?: number;
}

/**
 * Generic Form Section Props Interface
 */
export interface FormSectionPropsGeneric<T> {
  value: T;
  onChange: (value: T) => void;
  errors?: Partial<Record<keyof T, string>>;
  mode?: FormMode;
  readOnlyFields?: (keyof T)[];
  className?: string;
}

/**
 * Field Configuration for Dynamic Rendering
 */
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'checkbox' | 'radio';
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | undefined;
}

/**
 * Household Form Component Props
 */
export interface HouseholdFormProps {
  formData: ExtendedHouseholdFormData;
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors?: Record<string, string>;
  mode?: FormMode;
  className?: string;
}

// =============================================================================
// VALIDATION ERROR TYPES
// =============================================================================

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}