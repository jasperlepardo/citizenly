import React from 'react';
import { SelectField, ControlFieldSet } from '@/components/molecules';
import { Radio } from '@/components/atoms/Field/Control/Radio/Radio';
import { EDUCATION_LEVEL_OPTIONS_WITH_EMPTY } from '@/lib/constants/resident-enums';
import type { FormMode } from '@/types/forms';

// Graduate status options
const GRADUATE_STATUS_OPTIONS = [
  { value: 'yes', label: 'Yes, graduated' },
  { value: 'no', label: 'No, not graduated' }
];

export interface EducationInformationData {
  educationAttainment: string;
  isGraduate: string; // 'yes' | 'no' (defaults to 'yes')
}

export interface EducationInformationProps {
  value: EducationInformationData;
  onChange: (value: EducationInformationData) => void;
  errors: Record<string, string>;
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  className?: string;
}

export function EducationInformation({ 
  value, 
  onChange, 
  errors,
  mode = 'create',
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
          mode={mode}
          selectProps={{
            placeholder: "Select education level...",
            options: EDUCATION_LEVEL_OPTIONS_WITH_EMPTY,
            value: value.educationAttainment,
            onSelect: (option) => handleChange('educationAttainment', option?.value || '')
          }}
        />
        
        <ControlFieldSet
          type="radio"
          label="Graduate Status"
          labelSize="sm"
          radioName="isGraduate"
          radioValue={value.isGraduate}
          onRadioChange={(selectedValue: string) => handleChange('isGraduate', selectedValue)}
          errorMessage={errors.isGraduate}
          orientation="horizontal"
          spacing="sm"
          mode={mode}
        >
          {GRADUATE_STATUS_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              style="button"
              buttonProps={{
                variant: 'neutral-outline',
                size: 'lg'
              }}
            />
          ))}
        </ControlFieldSet>
      </div>
    </div>
  );
}

export default EducationInformation;