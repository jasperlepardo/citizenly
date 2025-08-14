import React from 'react';
import { EducationEmployment } from '@/components/organisms';
import { PSOCSelector } from '@/components/organisms';
import { StepComponentProps } from '../types';
import { EducationEmploymentData } from '@/components/organisms/EducationEmployment/EducationEmployment';

export function EducationEmploymentStep({ formData, onChange, errors }: StepComponentProps) {
  // Map form data to EducationEmployment component props
  const educationEmploymentValue: EducationEmploymentData = {
    educationAttainment: formData.educationAttainment,
    isGraduate: formData.isGraduate,
    psocCode: formData.psocCode,
    psocLevel: String(formData.psocLevel || ''),
    positionTitleId: '', // Not used in current form
    occupationDescription: '', // Not used in current form
    employmentStatus: formData.employmentStatus,
    workplace: formData.workplace,
  };

  // Handle changes from EducationEmployment component
  const handleEducationEmploymentChange = (value: EducationEmploymentData) => {
    onChange('educationAttainment', value.educationAttainment);
    onChange('isGraduate', value.isGraduate);
    onChange('employmentStatus', value.employmentStatus);
    onChange('workplace', value.workplace);
  };

  // Handle PSOC selection
  const handlePSOCSelect = (option: any) => {
    if (option) {
      onChange('psocCode', option.occupation_code);
      onChange('occupationTitle', option.occupation_title);
      onChange('psocLevel', option.hierarchy_level);
    } else {
      onChange('psocCode', '');
      onChange('occupationTitle', '');
      onChange('psocLevel', null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-primary text-base/7 font-semibold">Education & Employment</h3>
        <p className="text-secondary mt-1 text-sm/6">
          Provide education background and employment information.
        </p>
      </div>

      <EducationEmployment
        value={educationEmploymentValue}
        onChange={handleEducationEmploymentChange}
        errors={errors}
      />

      <div className="space-y-4">
        <h4 className="text-primary text-sm font-medium">Occupation Details</h4>
        <PSOCSelector
          value={formData.psocCode}
          onSelect={handlePSOCSelect}
          placeholder="Search for occupation..."
          error={errors.psocCode}
        />

        {formData.occupationTitle && (
          <div className="mt-2 rounded-md border bg-gray-50 p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Selected Occupation:</span> {formData.occupationTitle}
            </p>
            {formData.psocCode && (
              <p className="mt-1 text-xs text-gray-500">
                Code: {formData.psocCode} | Level: {formData.psocLevel}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
