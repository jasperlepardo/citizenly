import React from 'react';

import type {
  FormMode,
  BasicInformationFormData,
  BirthInformationFormData,
  EducationInformationFormData,
  EmploymentInformationFormData,
} from '@/types';

import { BasicInformation } from './FormField/BasicInformation';
import { BirthInformation } from './FormField/BirthInformation';
import { EducationInformation } from './FormField/EducationInformation';
import { EmploymentInformation } from './FormField/EmploymentInformation';
import { PhilSysCardField } from './FormField/PhilSysCardField';

export interface PersonalInformationFormProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  formData: {
    // PhilSys and Personal Info
    philsys_card_number?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    extension_name?: string;
    sex?: string;
    civil_status?: string;
    civil_status_others_specify?: string;
    citizenship?: string;
    // Birth Information
    birthdate?: string;
    birth_place_name?: string;
    birth_place_code?: string;
    // Education
    education_attainment?: string;
    is_graduate?: boolean;
    // Employment
    employment_status?: string;
    occupation_code?: string;
    occupation_title?: string;
  };
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
  // API handlers for search functionality
  onPsgcSearch?: (query: string) => void;
  onPsocSearch?: (query: string) => void;
  psgcOptions?: any[];
  psocOptions?: any[];
  psgcLoading?: boolean;
  psocLoading?: boolean;
}

export function PersonalInformationForm({
  mode = 'create',
  formData,
  onChange,
  errors,
  onPsgcSearch,
  onPsocSearch,
  psgcOptions = [],
  psocOptions = [],
  psgcLoading = false,
  psocLoading = false,
}: PersonalInformationFormProps) {
  // Map form data to BasicInformation component props
  const basicInfoValue: BasicInformationFormData = React.useMemo(
    () => ({
      first_name: formData.first_name || '',
      middle_name: formData.middle_name || '',
      last_name: formData.last_name || '',
      extension_name: formData.extension_name || '',
      sex: (formData.sex || '') as '' | 'male' | 'female',
      civil_status: formData.civil_status || '',
    }),
    [
      formData.first_name,
      formData.middle_name,
      formData.last_name,
      formData.extension_name,
      formData.sex,
      formData.civil_status,
    ]
  );

  // Handle changes from BasicInformation component
  const handleBasicInfoChange = React.useCallback(
    (value: BasicInformationFormData) => {
      // Only update fields that have actually changed from current form data
      const currentBasicInfo: BasicInformationFormData = {
        first_name: formData.first_name || '',
        middle_name: formData.middle_name || '',
        last_name: formData.last_name || '',
        extension_name: formData.extension_name || '',
        sex: (formData.sex || '') as '' | 'male' | 'female',
        civil_status: formData.civil_status || '',
        civil_status_others_specify: formData.civil_status_others_specify || '',
      };

      Object.entries(value).forEach(([field, fieldValue]) => {
        if (currentBasicInfo[field as keyof BasicInformationFormData] !== fieldValue) {
          onChange(field, fieldValue);
        }
      });
    },
    [
      onChange,
      formData.first_name,
      formData.middle_name,
      formData.last_name,
      formData.extension_name,
      formData.sex,
      formData.civil_status,
    ]
  );

  // Handle changes from BirthInformation component
  const handleBirthInfoChange = React.useCallback(
    (value: BirthInformationFormData) => {
      console.log('🔍 PersonalInformationForm: handleBirthInfoChange called with:', value);
      
      // Only update fields that have actually changed from current form data
      const currentBirthInfo: BirthInformationFormData = {
        birthdate: formData.birthdate || '',
        birth_place_name: formData.birth_place_name || '',
        birth_place_code: formData.birth_place_code || '',
      };

      console.log('🔍 PersonalInformationForm: currentBirthInfo:', currentBirthInfo);

      Object.entries(value).forEach(([field, fieldValue]) => {
        if (currentBirthInfo[field as keyof BirthInformationFormData] !== fieldValue) {
          console.log(`🔍 PersonalInformationForm: Birth field changed - ${field}:`, fieldValue);
          onChange(field, fieldValue);
        }
      });
    },
    [onChange, formData.birthdate, formData.birth_place_name, formData.birth_place_code]
  );

  // Handle changes from EducationInformation component
  const handleEducationInfoChange = React.useCallback(
    (value: EducationInformationFormData) => {
      // Only update fields that have actually changed from current form data
      const currentEducationInfo = {
        education_attainment: formData.education_attainment || '',
        is_graduate: formData.is_graduate ? 'yes' : 'no',
      };

      Object.entries(value).forEach(([field, fieldValue]) => {
        if (currentEducationInfo[field as keyof typeof currentEducationInfo] !== fieldValue) {
          // Convert is_graduate string back to boolean for form state
          if (field === 'is_graduate') {
            onChange(field, fieldValue === 'yes');
          } else {
            onChange(field, fieldValue);
          }
        }
      });
    },
    [onChange, formData.education_attainment, formData.is_graduate]
  );

  // Handle changes from EmploymentInformation component
  const handleEmploymentInfoChange = React.useCallback(
    (value: EmploymentInformationFormData) => {
      console.log('🔍 PersonalInformationForm: handleEmploymentInfoChange called with:', value);
      
      // Only update fields that have actually changed from current form data
      const currentEmploymentInfo: EmploymentInformationFormData = {
        employment_status: formData.employment_status || '',
        occupation_code: formData.occupation_code || '',
        occupation_title: formData.occupation_title || '',
      };

      console.log('🔍 PersonalInformationForm: currentEmploymentInfo:', currentEmploymentInfo);

      // Check if any fields have changed
      const changedFields: Partial<EmploymentInformationFormData> = {};
      Object.entries(value).forEach(([field, fieldValue]) => {
        if (currentEmploymentInfo[field as keyof EmploymentInformationFormData] !== fieldValue) {
          console.log(`🔍 PersonalInformationForm: Employment field changed - ${field}:`, fieldValue);
          changedFields[field as keyof EmploymentInformationFormData] = fieldValue;
        }
      });

      // If occupation_code and occupation_title are both changing, update them together as a batch
      if (changedFields.occupation_code !== undefined || changedFields.occupation_title !== undefined) {
        console.log('🔍 PersonalInformationForm: Batch updating occupation fields:', {
          occupation_code: changedFields.occupation_code ?? currentEmploymentInfo.occupation_code,
          occupation_title: changedFields.occupation_title ?? currentEmploymentInfo.occupation_title
        });
        
        // Use batch update for occupation fields to prevent race conditions
        onChange('__employment_occupation_batch__', {
          occupation_code: changedFields.occupation_code ?? currentEmploymentInfo.occupation_code,
          occupation_title: changedFields.occupation_title ?? currentEmploymentInfo.occupation_title,
        });
        
        // Remove occupation fields from individual updates
        delete changedFields.occupation_code;
        delete changedFields.occupation_title;
      }

      // Update remaining fields individually
      Object.entries(changedFields).forEach(([field, fieldValue]) => {
        onChange(field, fieldValue);
      });
    },
    [onChange, formData.employment_status, formData.occupation_code, formData.occupation_title]
  );

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-xs dark:border-gray-600 dark:bg-gray-800">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Basic personal details, birth information, and educational/employment background.
          </p>
        </div>

        <div className="space-y-8">
          {/* PhilSys Card Number */}
          <PhilSysCardField
            mode={mode}
            value={formData.philsys_card_number || ''}
            onChange={value => onChange('philsys_card_number', value)}
            error={errors.philsys_card_number}
          />

          {/* Basic Information Component - Names, Sex, Civil Status, Citizenship */}
          <BasicInformation
            mode={mode}
            value={basicInfoValue}
            onChange={handleBasicInfoChange}
            errors={errors}
          />

          {/* Birth Information */}
          <BirthInformation
            mode={mode}
            value={React.useMemo(
              () => ({
                birthdate: formData.birthdate || '',
                birth_place_name: formData.birth_place_name || '',
                birth_place_code: formData.birth_place_code || '',
              }),
              [formData.birthdate, formData.birth_place_name, formData.birth_place_code]
            )}
            onChange={handleBirthInfoChange}
            errors={errors}
            onPsgcSearch={onPsgcSearch}
            psgcOptions={psgcOptions}
            psgcLoading={psgcLoading}
          />

          {/* Education Information */}
          <EducationInformation
            mode={mode}
            value={React.useMemo(
              () => ({
                education_attainment: formData.education_attainment || '',
                is_graduate: formData.is_graduate ? 'yes' : 'no',
              }),
              [formData.education_attainment, formData.is_graduate]
            )}
            onChange={handleEducationInfoChange}
            errors={errors}
          />

          {/* Employment Information */}
          <EmploymentInformation
            mode={mode}
            value={React.useMemo(
              () => ({
                employment_status: formData.employment_status || '',
                occupation_code: formData.occupation_code || '',
                occupation_title: formData.occupation_title || '',
              }),
              [formData.employment_status, formData.occupation_code, formData.occupation_title]
            )}
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
