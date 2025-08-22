import React from 'react';
import { InputField } from '@/components/molecules/FieldSet';
import { HouseholdDetailsData } from '../../types';

export interface HouseholdStatisticsProps {
  formData: HouseholdDetailsData;
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors?: Record<string, string>;
  mode?: 'create' | 'view' | 'edit';
  className?: string;
}

/**
 * Household Statistics Form Fields Component
 * 
 * Handles the numerical statistics for households:
 * - Number of families
 * - Number of household members
 * - Number of migrants
 */
export function HouseholdStatistics({
  formData,
  onChange,
  errors,
  mode = 'edit',
  className = '',
}: HouseholdStatisticsProps) {
  const isReadOnly = mode === 'view';

  const handleFieldChange = (field: string) => (value: string | number | boolean | null) => {
    onChange(field, value);
  };

  const handleNumberChange = (field: string) => (value: string | number | boolean | null) => {
    // Convert string to number for numeric fields
    const numericValue = typeof value === 'string' ? parseInt(value, 10) || 0 : value;
    onChange(field, numericValue);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Number of Families */}
        <InputField
          label="Number of Families"
          helperText="Total families in this household"
          errorMessage={errors?.noOfFamilies}
          inputProps={{
            name: "noOfFamilies",
            type: "number",
            value: formData.noOfFamilies?.toString() || '1',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('noOfFamilies')(e.target.value),
            readOnly: isReadOnly,
            placeholder: "1",
            min: 1,
            max: 50
          }}
        />

        {/* Number of Household Members */}
        <InputField
          label="Household Members"
          helperText="Total people living in household"
          errorMessage={errors?.noOfHouseholdMembers}
          inputProps={{
            name: "noOfHouseholdMembers",
            type: "number",
            value: formData.noOfHouseholdMembers?.toString() || '0',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('noOfHouseholdMembers')(e.target.value),
            readOnly: isReadOnly,
            placeholder: "0",
            min: 0,
            max: 100
          }}
        />

        {/* Number of Migrants */}
        <InputField
          label="Number of Migrants"
          helperText="Household members who are migrants"
          errorMessage={errors?.noOfMigrants}
          inputProps={{
            name: "noOfMigrants",
            type: "number",
            value: formData.noOfMigrants?.toString() || '0',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleNumberChange('noOfMigrants')(e.target.value),
            readOnly: isReadOnly,
            placeholder: "0",
            min: 0,
            max: 100
          }}
        />
      </div>

      {/* Statistics Information Panel */}
      <div className="bg-info/5 border border-info/20 rounded-md p-3">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Household Statistics Guidelines:</p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Families:</strong> Count each family unit living in the household (minimum 1)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Members:</strong> Total number of people who regularly live in this household</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Migrants:</strong> Household members who moved from another location</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Validation Summary */}
      {(formData.noOfMigrants || 0) > (formData.noOfHouseholdMembers || 0) && (
        <div className="bg-warning/5 border border-warning/20 rounded-md p-3">
          <div>
            <p className="font-medium text-yellow-600 dark:text-yellow-400">⚠️ Data Validation Warning</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
              Number of migrants ({formData.noOfMigrants}) cannot exceed the total household members ({formData.noOfHouseholdMembers}).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}