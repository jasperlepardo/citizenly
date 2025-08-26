import React from 'react';
import { HouseholdTypeInformation, HouseholdTypeInformationData } from './FormField/HouseholdTypeInformation';
import { IncomeAndHeadInformation, IncomeAndHeadInformationData } from './FormField/IncomeAndHeadInformation';
import type { FormMode } from '@/types';

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
  householdHeadsLoading
}: HouseholdDetailsFormProps) {

  // Map form data to HouseholdTypeInformation component props
  const householdTypeValue: HouseholdTypeInformationData = {
    householdType: formData.householdType || '',
    tenureStatus: formData.tenureStatus || '',
    tenureOthersSpecify: formData.tenureOthersSpecify || '',
    householdUnit: formData.householdUnit || '',
    householdName: formData.householdName || '',
  };

  // Map form data to IncomeAndHeadInformation component props
  const incomeAndHeadValue: IncomeAndHeadInformationData = {
    monthlyIncome: formData.monthlyIncome || 0,
    householdHeadId: formData.householdHeadId || '',
    householdHeadPosition: formData.householdHeadPosition || '',
  };

  // Handle changes from HouseholdTypeInformation component
  const handleHouseholdTypeChange = (value: HouseholdTypeInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  // Handle changes from IncomeAndHeadInformation component
  const handleIncomeAndHeadChange = (value: IncomeAndHeadInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-xs p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Household Details</h2>
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