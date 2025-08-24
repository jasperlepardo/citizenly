import React from 'react';
import type { FormMode } from '@/types/forms';
import { InputField, SelectField } from '@/components/molecules';

export interface HouseholdTypeInformationData {
  householdType: string;
  tenureStatus: string;
  tenureOthersSpecify: string;
  householdUnit: string;
  householdName: string;
}

export interface HouseholdTypeInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: HouseholdTypeInformationData;
  onChange: (value: HouseholdTypeInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

// Household Type Options
const HOUSEHOLD_TYPE_OPTIONS = [
  { value: '', label: 'Select household type' },
  { value: 'nuclear', label: 'Nuclear Family' },
  { value: 'single_parent', label: 'Single Parent' },
  { value: 'extended', label: 'Extended Family' },
  { value: 'childless', label: 'Childless' },
  { value: 'one_person', label: 'One Person' },
  { value: 'non_family', label: 'Non-Family' },
  { value: 'other', label: 'Other' },
];

// Tenure Status Options
const TENURE_STATUS_OPTIONS = [
  { value: '', label: 'Select tenure status' },
  { value: 'owned', label: 'Owned' },
  { value: 'owned_with_mortgage', label: 'Owned with Mortgage' },
  { value: 'rented', label: 'Rented' },
  { value: 'occupied_for_free', label: 'Occupied for Free' },
  { value: 'occupied_without_consent', label: 'Occupied without Consent' },
  { value: 'others', label: 'Others' },
];

// Household Unit Options
const HOUSEHOLD_UNIT_OPTIONS = [
  { value: '', label: 'Select household unit' },
  { value: 'single_house', label: 'Single House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condominium', label: 'Condominium' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'makeshift', label: 'Makeshift' },
  { value: 'others', label: 'Others' },
];

export function HouseholdTypeInformation({ 
  mode = 'create',
  value, 
  onChange, 
  errors,
  className = '' 
}: HouseholdTypeInformationProps) {
  
  const handleChange = (field: keyof HouseholdTypeInformationData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handleSelectChange = (field: keyof HouseholdTypeInformationData) => (option: any) => {
    handleChange(field, option?.value || '');
  };

  // Show tenure others specify field when 'others' is selected
  const showTenureOthersSpecify = value.tenureStatus === 'others';

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Household Type Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Classification and structural details of the household.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Household Type */}
        <SelectField
          label="Household Type"
          required
          labelSize="sm"
          errorMessage={errors.householdType}
          mode={mode}
          selectProps={{
            options: HOUSEHOLD_TYPE_OPTIONS,
            value: value.householdType,
            onSelect: handleSelectChange('householdType'),
            placeholder: "Select household type"
          }}
        />
        
        {/* Tenure Status */}
        <SelectField
          label="Tenure Status"
          required
          labelSize="sm"
          errorMessage={errors.tenureStatus}
          mode={mode}
          selectProps={{
            options: TENURE_STATUS_OPTIONS,
            value: value.tenureStatus,
            onSelect: handleSelectChange('tenureStatus'),
            placeholder: "Select tenure status"
          }}
        />
        
        {/* Tenure Others Specify - Only show when 'others' is selected */}
        {showTenureOthersSpecify && (
          <InputField
            label="Tenure Status (Others)"
            required
            labelSize="sm"
            errorMessage={errors.tenureOthersSpecify}
            mode={mode}
            inputProps={{
              value: value.tenureOthersSpecify,
              onChange: (e) => handleChange('tenureOthersSpecify', e.target.value),
              placeholder: "Please specify tenure status",
              error: errors.tenureOthersSpecify
            }}
          />
        )}

        {/* Household Unit */}
        <SelectField
          label="Household Unit"
          required
          labelSize="sm"
          errorMessage={errors.householdUnit}
          mode={mode}
          selectProps={{
            options: HOUSEHOLD_UNIT_OPTIONS,
            value: value.householdUnit,
            onSelect: handleSelectChange('householdUnit'),
            placeholder: "Select household unit"
          }}
        />
        
        {/* Household Name */}
        <div className={showTenureOthersSpecify ? 'sm:col-span-2' : 'sm:col-span-1'}>
          <InputField
            label="Household Name"
            required
            labelSize="sm"
            errorMessage={errors.householdName}
            mode={mode}
            inputProps={{
              value: value.householdName,
              onChange: (e) => handleChange('householdName', e.target.value),
              placeholder: "Enter household name",
              error: errors.householdName
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default HouseholdTypeInformation;