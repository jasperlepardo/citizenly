import React from 'react';
import { SelectField, ControlFieldSet } from '@/components';
import { Radio } from '@/components/atoms/Field/Control/Radio/Radio';
import { EDUCATION_LEVEL_OPTIONS_WITH_EMPTY } from '@/lib/constants/resident-enums';
import type { FormMode } from '@/types';

// Graduate status options
const GRADUATE_STATUS_OPTIONS = [
  { value: 'yes', label: 'Yes, graduated' },
  { value: 'no', label: 'No, not graduated' }
];

export interface EducationInformationData {
  education_attainment: string;
  is_graduate: string; // 'yes' | 'no' (defaults to 'yes')
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
    let updatedValue = {
      ...value,
      [field]: fieldValue,
    };

    // Business logic: Auto-set graduate status based on education level
    if (field === 'education_attainment') {
      // Post-graduate education implies college graduation
      if (fieldValue === 'post_graduate') {
        updatedValue.is_graduate = 'yes';
      }
      // For other levels, keep the current graduate status or default to 'no' if empty
      else if (!value.is_graduate) {
        updatedValue.is_graduate = 'no';
      }
    }

    onChange(updatedValue);
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
          errorMessage={errors.education_attainment}
          mode={mode}
          selectProps={{
            placeholder: "Select education level...",
            options: EDUCATION_LEVEL_OPTIONS_WITH_EMPTY,
            value: value.education_attainment,
            onSelect: (option) => handleChange('education_attainment', option?.value || '')
          }}
        />
        
        <ControlFieldSet
          type="radio"
          label="Graduate Status"
          labelSize="sm"
          radioName="is_graduate"
          radioValue={value.is_graduate}
          onRadioChange={(selectedValue: string) => handleChange('is_graduate', selectedValue)}
          errorMessage={errors.is_graduate}
          orientation="horizontal"
          spacing="sm"
          mode={value.education_attainment === 'post_graduate' ? 'view' : mode}
          // helperText={
          //   value.education_attainment === 'post_graduate' 
          //     ? "Automatically set to 'Yes' for post-graduate education"
          //     : "Whether the current education level has been completed"
          // }
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