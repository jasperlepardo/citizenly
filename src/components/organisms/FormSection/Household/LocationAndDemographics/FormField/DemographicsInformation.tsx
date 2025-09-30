import React from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import type { FormMode } from '@/types/app/ui/forms';
import type { DemographicsInformationFormData } from '@/types/domain/households/forms';

export interface DemographicsInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: DemographicsInformationFormData;
  onChange: (value: DemographicsInformationFormData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function DemographicsInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
}: DemographicsInformationProps) {
  const handleChange = (field: keyof DemographicsInformationFormData, fieldValue: number) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Demographics Information
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Household composition and family statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Number of Families */}
        <InputField
          label="Number of Families"
          required
          labelSize="sm"
          errorMessage={errors.noOfFamilies}
          mode={mode}
          inputProps={{
            type: 'number',
            min: 1,
            value: value.noOfFamilies,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('noOfFamilies', parseInt(e.target.value) || 1),
            placeholder: 'Enter number of families',
            error: errors.noOfFamilies,
          }}
        />

        {/* Number of Household Members */}
        <InputField
          label="Number of Household Members"
          required
          labelSize="sm"
          errorMessage={errors.noOfHouseholdMembers}
          mode={mode}
          inputProps={{
            type: 'number',
            min: 0,
            value: value.noOfHouseholdMembers,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('noOfHouseholdMembers', parseInt(e.target.value) || 0),
            placeholder: 'Enter number of members',
            error: errors.noOfHouseholdMembers,
          }}
        />

        {/* Number of Migrants */}
        <InputField
          label="Number of Migrants"
          labelSize="sm"
          errorMessage={errors.noOfMigrants}
          mode={mode}
          inputProps={{
            type: 'number',
            min: 0,
            value: value.noOfMigrants,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('noOfMigrants', parseInt(e.target.value) || 0),
            placeholder: 'Enter number of migrants',
            error: errors.noOfMigrants,
          }}
        />
      </div>

      {/* Helper Information */}
      <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="mb-1 font-medium">Information Guidelines:</p>
          <ul className="list-inside list-disc space-y-1 text-xs">
            <li>
              <strong>Families:</strong> Number of family units living in this household
            </li>
            <li>
              <strong>Members:</strong> Total number of people residing in the household
            </li>
            <li>
              <strong>Migrants:</strong> Number of household members who are migrants or OFWs
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DemographicsInformation;
