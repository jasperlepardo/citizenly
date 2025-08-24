import React from 'react';
import type { FormMode } from '@/types';
import SectoralClassifications, { SectoralInformation, SectoralContext } from './FormField/SectoralClassifications';

export interface SectoralInformationFormProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  formData: {
    // Sectoral Information
    isLaborForce?: boolean;
    isLaborForceEmployed?: boolean;
    isUnemployed?: boolean;
    isOverseasFilipino?: boolean;
    isPersonWithDisability?: boolean;
    isOutOfSchoolChildren?: boolean;
    isOutOfSchoolYouth?: boolean;
    isSeniorCitizen?: boolean;
    isRegisteredSeniorCitizen?: boolean;
    isSoloParent?: boolean;
    isIndigenousPeople?: boolean;
    isMigrant?: boolean;
    // Context data for auto-calculation
    birthdate?: string;
    employmentStatus?: string;
    educationAttainment?: string;
    civilStatus?: string;
    ethnicity?: string;
  };
  onChange: (field: string | number | symbol, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
}

export function SectoralInformationForm({ 
  mode = 'create',
  formData, 
  onChange, 
  errors
}: SectoralInformationFormProps) {

  // Map form data to SectoralInfo component props
  const sectoralValue: SectoralInformation = {
    is_labor_force: formData.isLaborForce || false,
    is_labor_force_employed: formData.isLaborForceEmployed || false,
    is_unemployed: formData.isUnemployed || false,
    is_overseas_filipino_worker: formData.isOverseasFilipino || false,
    is_person_with_disability: formData.isPersonWithDisability || false,
    is_out_of_school_children: formData.isOutOfSchoolChildren || false,
    is_out_of_school_youth: formData.isOutOfSchoolYouth || false,
    is_senior_citizen: formData.isSeniorCitizen || false,
    is_registered_senior_citizen: formData.isRegisteredSeniorCitizen || false,
    is_solo_parent: formData.isSoloParent || false,
    is_indigenous_people: formData.isIndigenousPeople || false,
    is_migrant: formData.isMigrant || false,
  };

  // Context for auto-calculation
  const sectoralContext: SectoralContext = {
    birthdate: formData.birthdate,
    employment_status: formData.employmentStatus,
    highest_educational_attainment: formData.educationAttainment,
    marital_status: formData.civilStatus,
    ethnicity: formData.ethnicity,
  };

  // Handle changes from SectoralInfo component
  const handleSectoralChange = (value: SectoralInformation) => {
    onChange('isLaborForce', value.is_labor_force);
    onChange('isLaborForceEmployed', value.is_labor_force_employed);
    onChange('isUnemployed', value.is_unemployed);
    onChange('isOverseasFilipinoWorker', value.is_overseas_filipino_worker);
    onChange('isPersonWithDisability', value.is_person_with_disability);
    onChange('isOutOfSchoolChildren', value.is_out_of_school_children);
    onChange('isOutOfSchoolYouth', value.is_out_of_school_youth);
    onChange('isSeniorCitizen', value.is_senior_citizen);
    onChange('isRegisteredSeniorCitizen', value.is_registered_senior_citizen);
    onChange('isSoloParent', value.is_solo_parent);
    onChange('isIndigenousPeople', value.is_indigenous_people);
    onChange('isMigrant', value.is_migrant);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-xs p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Sectoral Information</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sectoral classifications and group memberships. Some fields are automatically calculated based on age, employment, and education data.
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