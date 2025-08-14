import React from 'react';
import { PersonalInformation } from '@/components/organisms';
import { StepComponentProps } from '../types';
import { PersonalInformationData } from '@/components/organisms/PersonalInformation/PersonalInformation';

export function BasicInfoStep({ formData, onChange, errors }: StepComponentProps) {
  // Map form data to PersonalInformation component props
  const personalInfoValue: PersonalInformationData = {
    firstName: formData.firstName,
    middleName: formData.middleName,
    lastName: formData.lastName,
    extensionName: formData.extensionName,
    birthdate: formData.birthdate,
    sex: formData.sex,
    civilStatus: formData.civilStatus,
    citizenship: formData.citizenship,
  };

  // Handle changes from PersonalInformation component
  const handlePersonalInfoChange = (value: PersonalInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600">Personal Information</h3>
        <p className="mt-1 text-sm/6 text-gray-600">
          Enter the resident's basic personal details and identification information.
        </p>
      </div>

      <PersonalInformation
        value={personalInfoValue}
        onChange={handlePersonalInfoChange}
        errors={errors}
      />
    </div>
  );
}
