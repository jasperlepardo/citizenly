import React from 'react';
import { SelectField } from '@/components/molecules';
import { EDUCATION_LEVEL_OPTIONS } from '@/lib/constants/resident-enums';

export interface EducationInformationData {
  educationAttainment: string;
  isGraduate: boolean;
}

export interface EducationInformationProps {
  value: EducationInformationData;
  onChange: (value: EducationInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function EducationInformation({ 
  value, 
  onChange, 
  errors,
  className = '' 
}: EducationInformationProps) {
  
  const handleChange = (field: keyof EducationInformationData, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Education Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Educational attainment and graduation status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField
          label="Highest Educational Attainment"
          required
          labelSize="sm"
          errorMessage={errors.educationAttainment}
          selectProps={{
            placeholder: "Select education level...",
            options: EDUCATION_LEVEL_OPTIONS,
            value: value.educationAttainment,
            onSelect: (option) => handleChange('educationAttainment', option?.value || '')
          }}
        />
        
        <SelectField
          label="Graduate Status"
          labelSize="sm"
          errorMessage={errors.isGraduate}
          selectProps={{
            placeholder: "Select status...",
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ],
            value: value.isGraduate ? 'yes' : 'no',
            onSelect: (option) => handleChange('isGraduate', option?.value === 'yes')
          }}
        />
      </div>
    </div>
  );
}

export default EducationInformation;