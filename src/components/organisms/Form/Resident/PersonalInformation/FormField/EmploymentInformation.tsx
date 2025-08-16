import React from 'react';
import { SelectField } from '@/components/molecules';
import { EMPLOYMENT_STATUS_OPTIONS } from '@/lib/constants/resident-enums';

export interface EmploymentInformationData {
  employmentStatus: string;
  psocCode: string;
  occupationTitle: string;
}

export interface EmploymentInformationProps {
  value: EmploymentInformationData;
  onChange: (value: EmploymentInformationData) => void;
  errors: Record<string, string>;
  // PSOC search functionality
  onPsocSearch?: (query: string) => void;
  psocOptions?: any[];
  psocLoading?: boolean;
  className?: string;
}

export function EmploymentInformation({ 
  value, 
  onChange, 
  errors,
  onPsocSearch,
  psocOptions = [],
  psocLoading = false,
  className = '' 
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
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Employment Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Employment status and occupation details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField
          label="Employment Status"
          labelSize="sm"
          errorMessage={errors.employmentStatus}
          selectProps={{
            placeholder: "Select employment status...",
            options: EMPLOYMENT_STATUS_OPTIONS,
            value: value.employmentStatus,
            onSelect: (option) => handleChange('employmentStatus', option?.value || '')
          }}
        />
        
        <SelectField
          label="Occupation Name"
          labelSize="sm"
          errorMessage={errors.occupationTitle || errors.psocCode}
          selectProps={{
            placeholder: "Search occupation from level 1-5...",
            options: psocOptions,
            value: value.psocCode,
            loading: psocLoading,
            onSearch: onPsocSearch,
            onSelect: (option) => {
              if (option) {
                // Only allow specific occupation (level 5) as final result
                if ((option as any).level_type === 'occupation') {
                  handleChange('psocCode', (option as any).occupation_code);
                  handleChange('occupationTitle', (option as any).occupation_title);
                } else {
                  // If higher level is selected, clear the fields
                  handleChange('psocCode', '');
                  handleChange('occupationTitle', '');
                }
              } else {
                handleChange('psocCode', '');
                handleChange('occupationTitle', '');
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default EmploymentInformation;