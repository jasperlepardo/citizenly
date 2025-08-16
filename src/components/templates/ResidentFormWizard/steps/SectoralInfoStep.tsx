import React from 'react';
import SectoralInfo, { SectoralInformation, SectoralContext } from '@/components/organisms/SectoralInfo/SectoralInfo';
import { StepComponentProps } from '../types';

export function SectoralInfoStep({ formData, onChange, errors }: StepComponentProps) {
  // Map form data to SectoralInfo component props
  const sectoralValue: SectoralInformation = {
    is_labor_force: formData.isLaborForce || false,
    is_employed: formData.isLaborForceEmployed || false,
    is_unemployed: formData.isUnemployed || false,
    is_ofw: formData.isOverseasFilipino || false,
    is_pwd: formData.isPersonWithDisability || false,
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
  };

  // Handle changes from SectoralInfo component
  const handleSectoralChange = (value: SectoralInformation) => {
    onChange('isLaborForce', value.is_labor_force);
    onChange('isLaborForceEmployed', value.is_employed);
    onChange('isUnemployed', value.is_unemployed);
    onChange('isOverseasFilipino', value.is_ofw);
    onChange('isPersonWithDisability', value.is_pwd);
    onChange('isOutOfSchoolChildren', value.is_out_of_school_children);
    onChange('isOutOfSchoolYouth', value.is_out_of_school_youth);
    onChange('isSeniorCitizen', value.is_senior_citizen);
    onChange('isRegisteredSeniorCitizen', value.is_registered_senior_citizen);
    onChange('isSoloParent', value.is_solo_parent);
    onChange('isIndigenousPeople', value.is_indigenous_people);
    onChange('isMigrant', value.is_migrant);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600 dark:text-gray-400">Section 4: Sectoral Information</h3>
        <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
          Specify sectoral classifications for the resident.
        </p>
      </div>

      <SectoralInfo
        value={sectoralValue}
        onChange={handleSectoralChange}
        context={sectoralContext}
      />
    </div>
  );
}
