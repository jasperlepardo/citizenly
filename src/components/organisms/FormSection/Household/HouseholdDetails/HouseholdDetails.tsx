import React from 'react';

import type { FormMode } from '@/types/app/ui/forms';
import type { HouseholdTypeInformationFormData , IncomeAndHeadInformationFormData } from '@/types/domain/households/forms';

import {
  HouseholdTypeInformation,
} from './FormField/HouseholdTypeInformation';
import {
  IncomeAndHeadInformation,
} from './FormField/IncomeAndHeadInformation';

export interface HouseholdDetailsFormProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  formData: {
    // Household Type Information
    householdType: string;
    tenureStatus: string;
    tenureOthersSpecify: string;
    householdUnit: string;
    householdName: string;
    // Income and Head Information
    monthlyIncome: number;
    householdHeadId: string;
    householdHeadPosition: string;
  };
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
  // Head of family options (residents who can be heads)
  householdHeadOptions?: Array<{ value: string; label: string }>;
  householdHeadsLoading?: boolean;
}

export function HouseholdDetailsForm({
  mode = 'create',
  formData,
  onChange,
  errors,
  householdHeadOptions,
  householdHeadsLoading,
}: HouseholdDetailsFormProps) {
  // Map form data to HouseholdTypeInformation component props
  const householdTypeValue: HouseholdTypeInformationFormData = {
    householdType: formData.householdType || '',
    tenureStatus: formData.tenureStatus || '',
    tenureOthersSpecify: formData.tenureOthersSpecify || '',
    householdUnit: formData.householdUnit || '',
    householdName: formData.householdName || '',
  };

  // Map form data to IncomeAndHeadInformation component props
  const incomeAndHeadValue: IncomeAndHeadInformationFormData = {
    monthlyIncome: formData.monthlyIncome || 0,
    householdHeadId: formData.householdHeadId || '',
    householdHeadPosition: formData.householdHeadPosition || '',
  };

  // Handle changes from HouseholdTypeInformation component
  const handleHouseholdTypeChange = (value: HouseholdTypeInformationFormData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field, fieldValue);
    });
  };

  // Handle changes from IncomeAndHeadInformation component
  const handleIncomeAndHeadChange = (value: IncomeAndHeadInformationFormData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field, fieldValue);
    });
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-xs dark:border-gray-600 dark:bg-gray-800">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Household Details
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Household classification, tenure status, income, and head of family information.
          </p>
        </div>

        <div className="space-y-8">
          {/* Household Type Information */}
          <HouseholdTypeInformation
            mode={mode}
            value={householdTypeValue}
            onChange={handleHouseholdTypeChange}
            errors={errors}
          />

          {/* Income and Head Information */}
          <IncomeAndHeadInformation
            mode={mode}
            value={incomeAndHeadValue}
            onChange={handleIncomeAndHeadChange}
            errors={errors}
            householdHeadOptions={householdHeadOptions}
            householdHeadsLoading={householdHeadsLoading}
          />
        </div>
      </div>
    </div>
  );
}
