import React from 'react';
import { SelectField } from '@/components/molecules';

export interface HouseholdInformationData {
  householdCode: string;
}

export interface HouseholdInformationProps {
  value: HouseholdInformationData;
  onChange: (value: HouseholdInformationData) => void;
  errors: Record<string, string>;
  // Household search functionality
  onHouseholdSearch?: (query: string) => void;
  householdOptions?: any[];
  householdLoading?: boolean;
  className?: string;
}

export function HouseholdInformation({ 
  value, 
  onChange, 
  errors,
  onHouseholdSearch,
  householdOptions = [],
  householdLoading = false,
  className = '' 
}: HouseholdInformationProps) {
  
  const handleChange = (field: keyof HouseholdInformationData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Household Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Household assignment and relationship details.
        </p>
      </div>

      <SelectField
        label="Current Household"
        labelSize="sm"
        errorMessage={errors.householdCode}
        selectProps={{
          placeholder: "🏠 Search household by code, head name, or address...",
          options: householdOptions,
          value: value.householdCode,
          loading: householdLoading,
          onSearch: onHouseholdSearch,
          onSelect: (option) => {
            handleChange('householdCode', option?.value || '');
          }
        }}
      />
    </div>
  );
}

export default HouseholdInformation;