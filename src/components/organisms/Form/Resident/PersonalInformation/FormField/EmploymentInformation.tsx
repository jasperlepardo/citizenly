import React from 'react';

import { SelectField } from '@/components';
import { EMPLOYMENT_STATUS_OPTIONS_WITH_EMPTY } from '@/lib/constants/resident-enums';
import type { FormMode } from '@/types';

export interface EmploymentInformationData {
  employment_status: string;
  occupation_code: string;
  occupation_title: string;
}

export interface EmploymentInformationProps {
  value: EmploymentInformationData;
  onChange: (value: EmploymentInformationData) => void;
  errors: Record<string, string>;
  // PSOC search functionality
  onPsocSearch?: (query: string) => void;
  psocOptions?: any[];
  psocLoading?: boolean;
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  className?: string;
}

export function EmploymentInformation({
  value,
  onChange,
  errors,
  onPsocSearch,
  psocOptions = [],
  psocLoading = false,
  mode = 'create',
  className = '',
}: EmploymentInformationProps) {
  const handleChange = (field: keyof EmploymentInformationData, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Employment Information
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Employment status and occupation details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField
          label="Employment Status"
          labelSize="sm"
          errorMessage={errors.employment_status}
          mode={mode}
          selectProps={{
            placeholder: 'Select employment status...',
            options: EMPLOYMENT_STATUS_OPTIONS_WITH_EMPTY,
            value: value.employment_status,
            onSelect: option => handleChange('employment_status', option?.value || ''),
          }}
        />

        <SelectField
          label="Occupation Name"
          labelSize="sm"
          errorMessage={errors.occupation_title || errors.occupation_code}
          mode={mode}
          selectProps={{
            placeholder: 'Search occupation from level 1-5...',
            options: (() => {
              // Ensure the current selected value is in options
              const currentOptions = [...psocOptions];
              if (value.occupation_code && value.occupation_title) {
                // Check if current selection is already in options
                const hasCurrentOption = currentOptions.some(
                  opt => opt.value === value.occupation_code
                );
                if (!hasCurrentOption) {
                  // Add the current value as an option so it displays correctly
                  currentOptions.unshift({
                    value: value.occupation_code,
                    label: value.occupation_title, // Use full hierarchy as label
                    description: `PSOC Code: ${value.occupation_code}`,
                    badge: 'occupation', // Add badge to indicate it's selected occupation
                  });
                }
              }
              return currentOptions;
            })(),
            value: value.occupation_code,
            loading: psocLoading,
            onSearch: onPsocSearch,
            onSelect: option => {
              if (option) {
                // Only allow specific occupation (level 5) as final result
                if ((option as any).level_type === 'occupation') {
                  handleChange('occupation_code', (option as any).occupation_code);
                  handleChange('occupation_title', (option as any).occupation_title);
                } else {
                  // If higher level is selected, clear the fields
                  handleChange('occupation_code', '');
                  handleChange('occupation_title', '');
                }
              } else {
                handleChange('occupation_code', '');
                handleChange('occupation_title', '');
              }
            },
          }}
        />
      </div>
    </div>
  );
}

export default EmploymentInformation;
