import React from 'react';
import { InputField, SelectField } from '@/components/molecules';

export interface BirthInformationData {
  birthdate: string;
  birthPlaceName: string;
  birthPlaceCode: string;
}

export interface BirthInformationProps {
  value: BirthInformationData;
  onChange: (value: BirthInformationData) => void;
  errors: Record<string, string>;
  // PSGC search functionality
  onPsgcSearch?: (query: string) => void;
  psgcOptions?: any[];
  psgcLoading?: boolean;
  className?: string;
}

export function BirthInformation({ 
  value, 
  onChange, 
  errors,
  onPsgcSearch,
  psgcOptions = [],
  psgcLoading = false,
  className = '' 
}: BirthInformationProps) {
  
  const handleChange = (field: keyof BirthInformationData, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Birth Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Birth date and place information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <InputField
          label="Birth Date"
          required
          labelSize="sm"
          errorMessage={errors.birthdate}
          inputProps={{
            type: "date",
            value: value.birthdate,
            onChange: (e) => handleChange('birthdate', e.target.value),
            required: true
          }}
        />
        
        <SelectField
          label="Birth Place"
          required
          labelSize="sm"
          errorMessage={errors.birthPlaceName}
          selectProps={{
            placeholder: "Search for province or city/municipality...",
            options: psgcOptions,
            value: value.birthPlaceCode,
            loading: psgcLoading,
            onSearch: onPsgcSearch,
            onSelect: (option) => {
              if (option) {
                // Only allow city/municipality selection as final result
                if ((option as any).level === 'city') {
                  handleChange('birthPlaceName', (option as any).full_hierarchy);
                  handleChange('birthPlaceCode', (option as any).code);
                } else {
                  // If province is selected, clear the fields
                  handleChange('birthPlaceName', '');
                  handleChange('birthPlaceCode', '');
                }
              } else {
                handleChange('birthPlaceName', '');
                handleChange('birthPlaceCode', '');
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default BirthInformation;