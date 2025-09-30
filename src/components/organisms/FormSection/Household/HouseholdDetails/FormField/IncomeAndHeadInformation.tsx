import React from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import type { FormMode } from '@/types/app/ui/forms';
import type { IncomeAndHeadInformationFormData } from '@/types/domain/households/forms';

export interface IncomeAndHeadInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: IncomeAndHeadInformationFormData;
  onChange: (value: IncomeAndHeadInformationFormData) => void;
  errors: Record<string, string>;
  className?: string;
  // Head of family options (residents who can be heads)
  householdHeadOptions?: Array<{ value: string; label: string }>;
  householdHeadsLoading?: boolean;
}

// Household Head Position Options
const HOUSEHOLD_HEAD_POSITION_OPTIONS = [
  { value: '', label: 'Select position' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'grandmother', label: 'Grandmother' },
  { value: 'grandfather', label: 'Grandfather' },
  { value: 'father_in_law', label: 'Father-in-law' },
  { value: 'mother_in_law', label: 'Mother-in-law' },
  { value: 'brother_in_law', label: 'Brother-in-law' },
  { value: 'sister_in_law', label: 'Sister-in-law' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'ward', label: 'Ward' },
  { value: 'other', label: 'Other' },
];

export function IncomeAndHeadInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
  householdHeadOptions = [],
  householdHeadsLoading = false,
}: IncomeAndHeadInformationProps) {
  const handleChange = (field: keyof IncomeAndHeadInformationFormData, fieldValue: string | number) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handleSelectChange = (field: keyof IncomeAndHeadInformationFormData) => (option: any) => {
    handleChange(field, option?.value || '');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Income & Head of Family
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Household income and head of family information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Income */}
        <InputField
          label="Monthly Income (PHP)"
          required
          labelSize="sm"
          errorMessage={errors.monthlyIncome}
          mode={mode}
          inputProps={{
            type: 'number',
            min: 0,
            step: '0.01',
            value: value.monthlyIncome,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('monthlyIncome', parseFloat(e.target.value) || 0),
            placeholder: 'Enter monthly income',
            error: errors.monthlyIncome,
          }}
        />

        {/* Head of Family */}
        <SelectField
          label="Head of Family"
          labelSize="sm"
          errorMessage={errors.householdHeadId}
          mode={mode}
          selectProps={{
            options: householdHeadOptions,
            value: value.householdHeadId,
            onSelect: handleSelectChange('householdHeadId'),
            placeholder: householdHeadsLoading
              ? 'Loading household members...'
              : 'Select head of family',
            loading: householdHeadsLoading,
          }}
        />

        {/* Head Position */}
        <SelectField
          label="Head Position"
          required
          labelSize="sm"
          errorMessage={errors.householdHeadPosition}
          mode={mode}
          selectProps={{
            options: HOUSEHOLD_HEAD_POSITION_OPTIONS,
            value: value.householdHeadPosition,
            onSelect: handleSelectChange('householdHeadPosition'),
            placeholder: 'Select head position',
          }}
        />
      </div>

      {/* Income Guidelines */}
      <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
        <div className="text-sm text-green-700 dark:text-green-300">
          <p className="mb-1 font-medium">Income Guidelines:</p>
          <ul className="list-inside list-disc space-y-1 text-xs">
            <li>
              <strong>Monthly Income:</strong> Total household income per month in Philippine Peso
              (PHP)
            </li>
            <li>
              <strong>Head of Family:</strong> Primary decision-maker and income provider (if
              applicable)
            </li>
            <li>
              <strong>Head Position:</strong> Relationship of the head to other household members
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default IncomeAndHeadInformation;
