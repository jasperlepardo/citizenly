/**
 * Form Types - Database-Aligned Form Interface Collection
 *
 * @fileoverview Comprehensive form-related TypeScript interfaces that provide
 * type-safe form handling with 100% database schema alignment. All form data
 * interfaces extend canonical database records to ensure data integrity.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 *
 * Key Features:
 * - 100% database schema compliance through canonical record extension
 * - Generic form component interfaces for reusable form building blocks
 * - Type-safe validation framework with field-level error handling
 * - Composition pattern: FormData extends DatabaseRecord + UI-specific fields
 * - Professional form state management interfaces
 *
 * @example Basic Form Data Extension Pattern
 * ```typescript
 * import { ResidentRecord } from '@/types/database';
 * import { ResidentFormData } from '@/types/forms';
 *
 * // Form data extends database record with UI-specific additions
 * const formData: ResidentFormData = {
 *   ...residentRecord, // All database fields included
 *   isEditing: true,   // UI-specific field
 *   isDirty: false     // UI-specific field
 * };
 * ```
 *
 * @example Generic Form Component Usage
 * ```typescript
 * import { ValidatedFieldSetProps, FormSubmissionState } from '@/types/forms';
 *
 * const MyFormField: React.FC<ValidatedFieldSetProps<string>> = ({
 *   value, onChange, errorMessage, required, ...props
 * }) => {
 *   // Type-safe form field implementation
 * };
 * ```
 */

import { ReactNode } from 'react';
export type { ValidationError } from './validation';

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
// FORM DATA INTERFACES (Database-Aligned Extensions)
// =============================================================================

// Import canonical database records
import type { ResidentRecord, HouseholdRecord } from './database';

/**
 * Resident form data - extends canonical database record with UI-specific fields
 * @description Composition of ResidentRecord + form-specific metadata for complete form handling
 *
 * @example Resident Form Usage
 * ```typescript
 * const formData: ResidentFormData = {
 *   // All ResidentRecord fields inherited from database.ts
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   first_name: 'Maria',
 *   last_name: 'Santos',
 *   sex: 'female', // Uses SexEnum from database
 *   // ... all other database fields
 *
 *   // Form-specific UI fields
 *   isEditing: true,
 *   isDirty: false,
 *   lastModified: '2025-01-27T10:00:00Z'
 * };
 * ```
 */
export interface ResidentFormData extends ResidentRecord {
  // UI-specific form metadata (not in database)
  isEditing?: boolean; // Whether form is in edit mode
  isDirty?: boolean; // Whether form has unsaved changes
  lastModified?: string; // Last modification timestamp
  validationErrors?: Record<string, string>; // Field-level validation errors

  // Form display helpers (computed from database fields)
  birth_place_name?: string; // Resolved from birth_place_code for display
  full_name?: string; // Computed: first + middle + last + extension
  age?: number; // Computed from birthdate
}

/**
 * Household form data - extends canonical database record with UI-specific fields
 * @description Composition of HouseholdRecord + form-specific metadata for complete form handling
 *
 * @example Household Form Usage
 * ```typescript
 * const formData: HouseholdFormData = {
 *   // All HouseholdRecord fields inherited from database.ts
 *   code: 'BRG001-HH-2025-001',
 *   house_number: '123',
 *   street_id: '550e8400-e29b-41d4-a716-446655440000',
 *   barangay_code: '1374000001',
 *   household_type: 'nuclear', // Uses HouseholdTypeEnum from database
 *   tenure_status: 'owned',     // Uses TenureStatusEnum from database
 *   // ... all other database fields
 *
 *   // Form-specific UI fields
 *   isEditing: false,
 *   isDirty: true,
 *   lastModified: '2025-01-27T10:00:00Z'
 * };
 * ```
 */
export interface HouseholdFormData extends HouseholdRecord {
  // UI-specific form metadata (not in database)
  isEditing?: boolean; // Whether form is in edit mode
  isDirty?: boolean; // Whether form has unsaved changes
  lastModified?: string; // Last modification timestamp
  validationErrors?: Record<string, string>; // Field-level validation errors

  // Form display helpers (computed from database fields)
  householdName?: string; // Display name for UI (computed from name || code)
  full_address?: string; // Complete formatted address string
  member_count?: number; // Current member count (may differ from no_of_household_members)
}

// =============================================================================
// FORM COMPONENT SPECIFIC TYPES
// =============================================================================

/**
 * Extended household form data type alias
 * @description For backward compatibility - ExtendedHouseholdFormData is now just HouseholdFormData
 * @deprecated Use HouseholdFormData directly
 */
export type ExtendedHouseholdFormData = HouseholdFormData;

/**
 * Household details form data type alias
 * @description For backward compatibility - HouseholdDetailsData now points through ExtendedHouseholdFormData
 * @deprecated Use ExtendedHouseholdFormData instead (which points to HouseholdFormData)
 * @deprecated This is a duplicate alias - will be removed in future cleanup
 */
export type HouseholdDetailsData = ExtendedHouseholdFormData;

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
  validation?: (value: unknown) => string | undefined;
}

/**
 * Household Form Component Props
 * @description Props for household form components with type-safe change handling
 */
export interface HouseholdFormProps {
  formData: HouseholdFormData;
  onChange: (field: keyof HouseholdFormData, value: string | number | boolean | null) => void;
  errors?: Record<string, string>;
  mode?: FormMode;
  className?: string;
  onSubmit?: (data: HouseholdFormData) => Promise<void>;
  loading?: boolean;
}

// =============================================================================
// VALIDATION ERROR TYPES
// =============================================================================

/**
 * Validation error interface
 */
