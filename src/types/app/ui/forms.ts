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
 * import { ResidentRecord } from '@/types/infrastructure/database';
 * import { ResidentFormData } from '@/types/domain/residents/forms';
 *
 * // Form data extends database record with UI-specific additions
 * const formData: ResidentFormData = {
 *   ...residentRecord, // All database fields included
 *   // Domain-specific form fields for residents
 * };
 * ```
 *
 * @example Generic Form Component Usage
 * ```typescript
 * import { ValidatedFieldSetProps, FormSubmissionState } from '@/types/app/ui/forms';
 *
 * const MyFormField: React.FC<ValidatedFieldSetProps<string>> = ({
 *   value, onChange, errorMessage, required, ...props
 * }) => {
 *   // Type-safe form field implementation
 * };
 * ```
 */

import { ReactNode } from 'react';

// =============================================================================
// BASE FORM FIELD INTERFACES
// =============================================================================

// Note: BaseFieldSetProps removed - unused

// Note: FieldSetWithIconsProps removed - unused

// Note: ClearableFieldSetProps removed - unused

// =============================================================================
// VALIDATION AND STATE TYPES
// =============================================================================

/**
 * Common validation state types
 */
export type ValidationState = 'default' | 'error' | 'success' | 'warning';

// Note: FieldSize removed - unused

// Note: ValidatedFieldSetProps removed - unused

// Note: LoadableFieldSetProps removed - unused

// =============================================================================
// SELECT AND OPTION INTERFACES
// =============================================================================

// Note: GenericSelectOption removed - unused

// Note: SelectFieldBaseProps removed - unused

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

// Note: ValidatableFieldSetProps removed - unused

// =============================================================================
// FORM SUBMISSION AND STATE
// =============================================================================

/**
 * Form modes supported by the application
 */
export type FormMode = 'view' | 'edit' | 'create';

// Note: FormSubmissionState removed - unused

// =============================================================================
// FORM DATA INTERFACES (Database-Aligned Extensions)
// =============================================================================

// Import canonical database records
import type { ResidentRecord, HouseholdRecord } from '@/types/infrastructure/database/database';

/**
 * NOTE: ResidentFormData has been moved to @/types/domain/residents/forms
 * for better domain-driven design alignment. Import from the domain layer instead.
 */

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
