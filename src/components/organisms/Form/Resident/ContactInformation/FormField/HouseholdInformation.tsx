import React from 'react';
import HouseholdSelector from '@/components/organisms/HouseholdSelector/HouseholdSelector';

export interface HouseholdInformationData {
  householdCode: string;
}

export interface HouseholdInformationProps {
  value: HouseholdInformationData;
  onChange: (value: HouseholdInformationData) => void;
  errors: Record<string, string>;
  className?: string;
  // Optional external search functionality (HouseholdSelector has its own built-in search)
  onHouseholdSearch?: (query: string) => Promise<any>;
  householdOptions?: any[];
  householdLoading?: boolean;
}

export function HouseholdInformation({ 
  value, 
  onChange, 
  errors,
  className = '',
  onHouseholdSearch,
  householdOptions,
  householdLoading
}: HouseholdInformationProps) {
  
  const handleHouseholdSelect = (householdCode: string | null) => {
    onChange({
      householdCode: householdCode || '',
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Household
        </label>
        <HouseholdSelector
          value={value.householdCode}
          onSelect={handleHouseholdSelect}
          error={errors.householdCode}
          placeholder="🏠 Search households or leave blank to create new"
        />
      </div>
    </div>
  );
}

export default HouseholdInformation;