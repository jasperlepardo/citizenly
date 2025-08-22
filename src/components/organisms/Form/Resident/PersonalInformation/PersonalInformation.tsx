import React from 'react';
import { PhilSysCardField } from './FormField/PhilSysCardField';
import { BasicInformation, BasicInformationData } from './FormField/BasicInformation';
import { BirthInformation, BirthInformationData } from './FormField/BirthInformation';
import { EducationInformation, EducationInformationData } from './FormField/EducationInformation';
import { EmploymentInformation, EmploymentInformationData } from './FormField/EmploymentInformation';

export interface PersonalInformationFormProps {
  formData: {
    // PhilSys and Personal Info
    philsysCardNumber?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    extensionName?: string;
    sex?: string;
    civilStatus?: string;
    citizenship?: string;
    // Birth Information
    birthdate?: string;
    birthPlaceName?: string;
    birthPlaceCode?: string;
    // Education
    educationAttainment?: string;
    isGraduate?: boolean;
    // Employment
    employmentStatus?: string;
    psocCode?: string;
    occupationTitle?: string;
  };
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
  // API handlers for search functionality (only PSOC needed now)
  onPsocSearch?: (query: string) => void;
  psocOptions?: any[];
  psocLoading?: boolean;
}

export function PersonalInformationForm({ 
  formData, 
  onChange, 
  errors,
  onPsocSearch,
  psocOptions = [],
  psocLoading = false
}: PersonalInformationFormProps) {


  // Map form data to BasicInformation component props
  const basicInfoValue: BasicInformationData = {
    firstName: formData.firstName || '',
    middleName: formData.middleName || '',
    lastName: formData.lastName || '',
    extensionName: formData.extensionName || '',
    sex: (formData.sex || '') as '' | 'male' | 'female',
    civilStatus: formData.civilStatus || '',
  };

  // Handle changes from BasicInformation component
  const handleBasicInfoChange = (value: BasicInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  // Handle changes from BirthInformation component
  const handleBirthInfoChange = (value: BirthInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  // Handle changes from EducationInformation component
  const handleEducationInfoChange = (value: EducationInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  // Handle changes from EmploymentInformation component
  const handleEmploymentInfoChange = (value: EmploymentInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-xs p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Personal Information</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Basic personal details, birth information, and educational/employment background.
          </p>
        </div>

        <div className="space-y-8">
          {/* PhilSys Card Number */}
          <PhilSysCardField
            value={formData.philsysCardNumber || ''}
            onChange={(value) => onChange('philsysCardNumber', value)}
            error={errors.philsysCardNumber}
          />

          {/* Basic Information Component - Names, Sex, Civil Status, Citizenship */}
          <BasicInformation
            value={basicInfoValue}
            onChange={handleBasicInfoChange}
            errors={errors}
          />

          {/* Birth Information */}
          <BirthInformation
            value={{
              birthdate: formData.birthdate || '',
              birthPlaceName: formData.birthPlaceName || '',
              birthPlaceCode: formData.birthPlaceCode || '',
            }}
            onChange={handleBirthInfoChange}
            errors={errors}
          />

          {/* Education Information */}
          <EducationInformation
            value={{
              educationAttainment: formData.educationAttainment || '',
              isGraduate: formData.isGraduate ? 'yes' : 'no',
            }}
            onChange={handleEducationInfoChange}
            errors={errors}
          />

          {/* Employment Information */}
          <EmploymentInformation
            value={{
              employmentStatus: formData.employmentStatus || '',
              psocCode: formData.psocCode || '',
              occupationTitle: formData.occupationTitle || '',
            }}
            onChange={handleEmploymentInfoChange}
            errors={errors}
            onPsocSearch={onPsocSearch}
            psocOptions={psocOptions}
            psocLoading={psocLoading}
          />
        </div>
      </div>
    </div>
  );
}
