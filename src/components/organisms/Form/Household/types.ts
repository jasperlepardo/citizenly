import { HouseholdFormData } from '@/types/households';

/**
 * Form Mode Types
 */
export type FormMode = 'create' | 'view' | 'edit';

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
 * Form Section Props Interface
 */
export interface FormSectionProps<T> {
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
  name: keyof ExtendedHouseholdFormData;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
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