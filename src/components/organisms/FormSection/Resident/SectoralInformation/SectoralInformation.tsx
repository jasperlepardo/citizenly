import React from 'react';

import SectoralClassifications from './FormField/SectoralClassifications';

import type { FormMode } from '@/types/app/ui/forms';
import type { ResidentFormData, SectoralInformation } from '@/types/domain/residents/forms';


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
  formData: ResidentFormData & SectoralInformation;

  /**
   * Callback when any sectoral field changes.
   * @param field - The form field name (e.g., 'is_overseas_filipino')
   * @param value - The new value for the field
   */
  onChange: (field: string, value: boolean | string | null) => void;

  // Loading states
  loading?: boolean;
  sectionLoadingStates?: {
    sectoral_info?: boolean;
  };
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
  loading = false,
  sectionLoadingStates = {},
}: SectoralInformationFormProps) {
  console.log('🔍 SectoralInformationForm: COMPONENT LOADING - Full formData keys:', Object.keys(formData || {}));
  console.log('🔍 SectoralInformationForm: Received formData:', {
    birthdate: formData.birthdate,
    employment_status: formData.employment_status,
    ethnicity: formData.ethnicity,
    is_senior_citizen: formData.is_senior_citizen,
    is_labor_force_employed: formData.is_labor_force_employed,
    is_indigenous_people: formData.is_indigenous_people,
  });
  
  // Special debug for ethnicity changes
  if (formData.ethnicity) {
    console.log('🎯 SectoralInformationForm: ETHNICITY DETECTED:', formData.ethnicity);
    if (formData.ethnicity === 'badjao') {
      console.log('🎯 SectoralInformationForm: BADJAO RECEIVED - is_indigenous_people should be true!');
      console.log('🎯 SectoralInformationForm: Current is_indigenous_people value:', formData.is_indigenous_people);
    }
  }
  
  // Map form data to SectoralInfo component props using configuration
  const sectoralValue: SectoralInformation = React.useMemo(
    () => {
      const result = SECTORAL_FIELD_MAPPING.reduce(
        (acc, field) => ({
          ...acc,
          [field.dbKey]: getSectoralFieldValue(formData, field.dbKey),
        }),
        {} as SectoralInformation
      );
      console.log('🔍 SectoralInformationForm: Computed sectoralValue:', result);
      return result;
    },
    [
      // Depend on specific sectoral fields instead of entire formData object
      formData.is_labor_force_employed,
      formData.is_unemployed,
      formData.is_overseas_filipino_worker,
      formData.is_person_with_disability,
      formData.is_out_of_school_children,
      formData.is_out_of_school_youth,
      formData.is_senior_citizen,
      formData.is_registered_senior_citizen,
      formData.is_solo_parent,
      formData.is_indigenous_people,
      formData.is_migrant,
      // Also depend on context fields that affect auto-calculation
      formData.ethnicity,        // For indigenous people classification
      formData.birthdate,        // For age-based calculations (senior citizen, out-of-school)
      formData.employment_status, // For employment-based classifications  
      formData.education_attainment, // For education-based classifications (out-of-school)
    ]
  );

  // Context for auto-calculation (form data already uses database field names)
  const sectoralContext = React.useMemo(
    () => {
      const context = {
        birthdate: formData.birthdate,
        employment_status: formData.employment_status,
        education_attainment: formData.education_attainment,
        civil_status: formData.civil_status,
        ethnicity: formData.ethnicity,
      };
      console.log('🔍 SectoralInformationForm: Context created:', context);
      return context;
    },
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
      // Create a batch update object with all sectoral changes
      const batchUpdate: Record<string, boolean | string | null> = {};
      SECTORAL_FIELD_MAPPING.forEach(field => {
        const fieldValue = setSectoralFieldValue(value, field.dbKey);
        batchUpdate[field.dbKey] = fieldValue;
      });
      
      // Send all updates as a single batch to avoid race conditions
      onChange('__sectoral_batch__', JSON.stringify(batchUpdate));
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
          loadingStates={sectionLoadingStates?.sectoral_info ? {
            is_labor_force_employed: true,
            is_unemployed: true,
            is_overseas_filipino_worker: true,
            is_person_with_disability: true,
            is_out_of_school_children: true,
            is_out_of_school_youth: true,
            is_senior_citizen: true,
            is_registered_senior_citizen: true,
            is_solo_parent: true,
            is_indigenous_people: true,
            is_migrant: true,
          } : {}}
        />
      </div>
    </div>
  );
}

export default SectoralInformationForm;
