import React from 'react';

import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import { EDUCATION_LEVEL_OPTIONS_WITH_EMPTY } from '@/constants/residentEnums';
import type { FormMode } from '@/types/app/ui/forms';
import type { EducationInformationFormData } from '@/types/domain/residents/forms';
import { formatGraduateStatus } from '@/utils/shared/dateUtils';

// Graduate status options
const GRADUATE_STATUS_OPTIONS = [
  { value: 'yes', label: 'Yes, graduated' },
  { value: 'no', label: 'No, not graduated' },
];

export interface EducationInformationProps {
  value: EducationInformationFormData;
  onChange: (value: EducationInformationFormData) => void;
  errors: Record<string, string>;
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  className?: string;
  // Loading states
  loadingStates?: {
    education_attainment?: boolean;
    is_graduate?: boolean;
  };
}

export function EducationInformation({
  value,
  onChange,
  errors,
  mode = 'create',
  className = '',
  loadingStates = {},
}: EducationInformationProps) {
  const handleChange = (field: keyof EducationInformationFormData, fieldValue: string) => {
    const updatedValue = {
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
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Education Information
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Educational attainment and graduation status.
        </p>
      </div>

      <div className={mode === 'view' ? 'space-y-4' : 'grid grid-cols-1 gap-6 sm:grid-cols-2'}>
        <SelectField
          label="Highest Educational Attainment"
          required
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.education_attainment}
          mode={mode}
          loading={loadingStates.education_attainment}
          selectProps={{
            placeholder: 'Select education level...',
            options: EDUCATION_LEVEL_OPTIONS_WITH_EMPTY,
            value: value.education_attainment || '',
            onSelect: (option: any) => handleChange('education_attainment', option?.value || ''),
          }}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Graduate Status
          </label>
          {errors.is_graduate && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.is_graduate}</p>
          )}
          <div className="flex space-x-4">
            {GRADUATE_STATUS_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="is_graduate"
                  value={option.value}
                  checked={(mode === 'view' ? formatGraduateStatus(value.is_graduate || '') : (value.is_graduate || '')) === option.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('is_graduate', e.target.value)}
                  disabled={value.education_attainment === 'post_graduate' && mode !== 'view'}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EducationInformation;
