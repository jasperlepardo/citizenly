import React from 'react';

import type { 
  FormMode,
  SectoralInformation, 
  SectoralContext,
  ResidentFormData
} from '@/types';

import SectoralClassifications from './FormField/SectoralClassifications';

/**
 * Props for the SectoralInformationForm component
 * 
 * @description Handles sectoral classifications for residents with automatic
 * calculations based on age, employment, and education data. Maps form field
 * names to database schema (e.g., is_overseas_filipino → is_overseas_filipino_worker).
 */
export interface SectoralInformationFormProps {
  /** 
   * Form mode - determines if fields are editable or read-only
   * @default 'create'
   */
  mode?: FormMode;
  
  /**
   * Form data containing sectoral flags and context fields for auto-calculation.
   * Uses the complete resident form data which includes all needed fields.
   */
  formData: ResidentFormData;
  
  /**
   * Callback when any sectoral field changes.
   * @param field - The form field name (e.g., 'is_overseas_filipino')
   * @param value - The new value for the field
   */
  onChange: (field: string, value: boolean | string | null) => void;
}

// Field mapping configuration (matches database schema exactly)
const SECTORAL_FIELD_MAPPING = [
  { formKey: 'is_labor_force_employed', dbKey: 'is_labor_force_employed' },
  { formKey: 'is_unemployed', dbKey: 'is_unemployed' },
  { formKey: 'is_overseas_filipino', dbKey: 'is_overseas_filipino_worker' },
  { formKey: 'is_person_with_disability', dbKey: 'is_person_with_disability' },
  { formKey: 'is_out_of_school_children', dbKey: 'is_out_of_school_children' },
  { formKey: 'is_out_of_school_youth', dbKey: 'is_out_of_school_youth' },
  { formKey: 'is_senior_citizen', dbKey: 'is_senior_citizen' },
  { formKey: 'is_registered_senior_citizen', dbKey: 'is_registered_senior_citizen' },
  { formKey: 'is_solo_parent', dbKey: 'is_solo_parent' },
  { formKey: 'is_indigenous_people', dbKey: 'is_indigenous_people' },
  { formKey: 'is_migrant', dbKey: 'is_migrant' },
];

/**
 * Type-safe getter for sectoral field values
 */
const getSectoralFieldValue = (
  data: ResidentFormData, 
  key: string
): boolean => {
  const value = (data as unknown as Record<string, unknown>)[key];
  return typeof value === 'boolean' ? value : false;
};

/**
 * Type-safe setter for sectoral field values  
 */
const setSectoralFieldValue = (
  value: SectoralInformation, 
  key: string
): boolean | string | null => {
  const fieldValue = (value as unknown as Record<string, unknown>)[key];
  return fieldValue as boolean | string | null;
};

export function SectoralInformationForm({
  mode = 'create',
  formData,
  onChange,
}: SectoralInformationFormProps) {
  // Map form data to SectoralInfo component props using configuration
  const sectoralValue: SectoralInformation = React.useMemo(
    () => SECTORAL_FIELD_MAPPING.reduce(
      (acc, field) => ({
        ...acc,
        [field.dbKey]: getSectoralFieldValue(formData, field.formKey),
      }),
      {} as SectoralInformation
    ),
    [formData]
  );

  // Context for auto-calculation (form data already uses database field names)
  const sectoralContext: SectoralContext = React.useMemo(
    () => ({
      birthdate: formData.birthdate,
      employment_status: formData.employment_status,
      education_attainment: formData.education_attainment,
      civil_status: formData.civil_status,
      ethnicity: formData.ethnicity,
    }),
    [
      formData.birthdate,
      formData.employment_status,
      formData.education_attainment,
      formData.civil_status,
      formData.ethnicity,
    ]
  );

  // Handle changes from SectoralInfo component using configuration
  const handleSectoralChange = React.useCallback(
    (value: SectoralInformation) => {
      SECTORAL_FIELD_MAPPING.forEach(field => {
        onChange(field.formKey, setSectoralFieldValue(value, field.dbKey));
      });
    },
    [onChange]
  );

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-xs dark:border-gray-600 dark:bg-gray-800">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Sectoral Information
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sectoral classifications and group memberships. Some fields are automatically calculated
            based on age, employment, and education data.
          </p>
        </div>

        <SectoralClassifications
          value={sectoralValue}
          onChange={handleSectoralChange}
          context={sectoralContext}
          mode={mode}
          disabled={mode === 'view'}
        />
      </div>
    </div>
  );
}

export default SectoralInformationForm;
