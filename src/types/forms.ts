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
 * Resident form data (matching database schema exactly)
 */
export interface ResidentFormData {
  // Personal Information - matching database schema
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  birthdate: string;
  birth_place_code?: string;
  birth_place_name?: string; // For UI display purposes
  sex: 'male' | 'female';

  // Civil status
  civil_status?: 'single' | 'married' | 'divorced' | 'separated' | 'widowed' | 'others';
  civil_status_others_specify?: string;

  // Citizenship and identity
  citizenship?: 'filipino' | 'dual_citizen' | 'foreigner';
  philsys_card_number?: string;

  // Contact information
  mobile_number?: string;
  telephone_number?: string;
  email?: string;

  // Physical characteristics
  height?: number;
  weight?: number;
  complexion?: string;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

  // Family information
  mother_maiden_first?: string;
  mother_maiden_middle?: string;
  mother_maiden_last?: string;

  // Location and affiliation
  household_code?: string;

  // Cultural and religious
  ethnicity?: string;
  religion?: string;
  religion_others_specify?: string;

  // Education and employment
  employment_status?: string;
  education_attainment?: string;
  is_graduate?: boolean;
  occupation_code?: string;

  // Voting information (matching database schema)
  is_voter?: boolean;
  is_resident_voter?: boolean;
  last_voted_date?: string;

  // Migration information (matching database schema)
  previous_barangay_code?: string;
  previous_city_municipality_code?: string;
  previous_province_code?: string;
  previous_region_code?: string;
  date_of_transfer?: string;
  reason_for_migration?: string;
  length_of_stay_previous_months?: number;
  migration_type?: string;
}

/**
 * Household form data - aligned with database structure (27 fields)
 */
export interface HouseholdFormData {
  // Primary identification
  code: string;
  name?: string;
  address?: string;

  // Location details (matching database schema)
  house_number: string;
  street_id: string; // UUID reference to geo_streets
  subdivision_id?: string; // UUID reference to geo_subdivisions
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string;
  region_code: string;
  zip_code?: string;

  // Household metrics (matching database schema)
  no_of_families?: number;
  no_of_household_members?: number;
  no_of_migrants?: number;

  // Household classifications (enums, matching database schema)
  household_type?:
    | 'nuclear'
    | 'single_parent'
    | 'extended'
    | 'childless'
    | 'one_person'
    | 'non_family'
    | 'other';
  tenure_status?:
    | 'owned'
    | 'owned_with_mortgage'
    | 'rented'
    | 'occupied_for_free'
    | 'occupied_without_consent'
    | 'others';
  tenure_others_specify?: string;
  household_unit?:
    | 'single_house'
    | 'duplex'
    | 'apartment'
    | 'townhouse'
    | 'condominium'
    | 'boarding_house'
    | 'institutional'
    | 'makeshift'
    | 'others';

  // Economic information (matching database schema)
  monthly_income?: number;
  income_class?:
    | 'rich'
    | 'high_income'
    | 'upper_middle_income'
    | 'middle_class'
    | 'lower_middle_class'
    | 'low_income'
    | 'poor'
    | 'not_determined';

  // Head of household (matching database schema)
  household_head_id?: string; // UUID reference to residents
  household_head_position?:
    | 'father'
    | 'mother'
    | 'son'
    | 'daughter'
    | 'grandmother'
    | 'grandfather'
    | 'father_in_law'
    | 'mother_in_law'
    | 'brother_in_law'
    | 'sister_in_law'
    | 'spouse'
    | 'sibling'
    | 'guardian'
    | 'ward'
    | 'other';
}

// =============================================================================
// FORM COMPONENT SPECIFIC TYPES
// =============================================================================

/**
 * Extended Household Form Data with additional UI fields
 * Now that HouseholdFormData includes all database fields, this mainly adds UI-specific fields
 */
export interface ExtendedHouseholdFormData extends HouseholdFormData {
  // Additional UI-specific fields (not in database)
  householdName?: string; // Display name for UI

  // Form-specific metadata
  isEditing?: boolean;
  isDirty?: boolean;
  lastModified?: string;
}

/**
 * Household Details Form Data - subset of full household data for form sections
 */
export interface HouseholdDetailsData {
  // Location details (matching database schema)
  house_number: string;
  street_id: string;
  subdivision_id?: string;
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string;
  region_code: string;
  zip_code?: string;

  // Household metrics (matching database schema)
  no_of_families?: number;
  no_of_household_members?: number;
  no_of_migrants?: number;

  // Household classifications (matching database schema)
  household_type?:
    | 'nuclear'
    | 'single_parent'
    | 'extended'
    | 'childless'
    | 'one_person'
    | 'non_family'
    | 'other';
  tenure_status?:
    | 'owned'
    | 'owned_with_mortgage'
    | 'rented'
    | 'occupied_for_free'
    | 'occupied_without_consent'
    | 'others';
  tenure_others_specify?: string;
  household_unit?:
    | 'single_house'
    | 'duplex'
    | 'apartment'
    | 'townhouse'
    | 'condominium'
    | 'boarding_house'
    | 'institutional'
    | 'makeshift'
    | 'others';

  // Economic information (matching database schema)
  monthly_income?: number;
  income_class?:
    | 'rich'
    | 'high_income'
    | 'upper_middle_income'
    | 'middle_class'
    | 'lower_middle_class'
    | 'low_income'
    | 'poor'
    | 'not_determined';

  // Head of household (matching database schema)
  household_head_id?: string;
  household_head_position?:
    | 'father'
    | 'mother'
    | 'son'
    | 'daughter'
    | 'grandmother'
    | 'grandfather'
    | 'father_in_law'
    | 'mother_in_law'
    | 'brother_in_law'
    | 'sister_in_law'
    | 'spouse'
    | 'sibling'
    | 'guardian'
    | 'ward'
    | 'other';
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
