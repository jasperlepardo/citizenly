import React from 'react';

import type { FormMode } from '@/types';

import SectoralClassifications, {
  SectoralInformation,
  SectoralContext,
} from './FormField/SectoralClassifications';

export interface SectoralInformationFormProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  formData: {
    // Sectoral Information (snake_case matching database)
    is_labor_force_employed?: boolean;
    is_unemployed?: boolean;
    is_overseas_filipino?: boolean;
    is_person_with_disability?: boolean;
    is_out_of_school_children?: boolean;
    is_out_of_school_youth?: boolean;
    is_senior_citizen?: boolean;
    is_registered_senior_citizen?: boolean;
    is_solo_parent?: boolean;
    is_indigenous_people?: boolean;
    is_migrant?: boolean;
    // Context data for auto-calculation
    birthdate?: string;
    employment_status?: string;
    education_attainment?: string;
    civil_status?: string;
    ethnicity?: string;
  };
  onChange: (field: string | number | symbol, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
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

export function SectoralInformationForm({
  mode = 'create',
  formData,
  onChange,
  errors,
}: SectoralInformationFormProps) {
  // Map form data to SectoralInfo component props using configuration
  const sectoralValue: SectoralInformation = SECTORAL_FIELD_MAPPING.reduce(
    (acc, field) => ({
      ...acc,
      [field.dbKey]: (formData as any)[field.formKey] || false,
    }),
    {} as SectoralInformation
  );

  // Context for auto-calculation
  const sectoralContext: SectoralContext = React.useMemo(() => ({
    birthdate: formData.birthdate,
    employment_status: formData.employment_status,
    highest_educational_attainment: formData.education_attainment,
    marital_status: formData.civil_status,
    ethnicity: formData.ethnicity,
  }), [
    formData.birthdate,
    formData.employment_status,
    formData.education_attainment,
    formData.civil_status,
    formData.ethnicity,
  ]);


  // Handle changes from SectoralInfo component using configuration
  const handleSectoralChange = React.useCallback((value: SectoralInformation) => {
    SECTORAL_FIELD_MAPPING.forEach(field => {
      onChange(field.formKey, (value as any)[field.dbKey]);
    });
  }, [onChange]);

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
