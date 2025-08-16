import React from 'react';
import { InputField, SelectField } from '@/components/molecules';

export interface BasicInformationData {
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: 'male' | 'female' | '';
  civilStatus: string;
  citizenship: string;
}

interface BasicInformationProps {
  value: BasicInformationData;
  onChange: (value: BasicInformationData) => void;
  errors?: Partial<Record<keyof BasicInformationData, string>>;
  className?: string;
}

const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled', label: 'Annulled' },
  { value: 'registered_partnership', label: 'Registered Partnership' },
  { value: 'live_in', label: 'Live-in' },
];

const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreign_national', label: 'Foreign National' },
];

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export function BasicInformation({
  value,
  onChange,
  errors = {},
  className = '',
}: BasicInformationProps) {
  const handleChange = (field: keyof BasicInformationData, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handleSelectChange = (field: keyof BasicInformationData) => (option: any) => {
    handleChange(field, option?.value || '');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Basic Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Basic details and identification information.
        </p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <InputField
          label="First Name"
          required
          labelSize="sm"
          errorMessage={errors.firstName}
          inputProps={{
            value: value.firstName,
            onChange: e => handleChange('firstName', e.target.value),
            placeholder: "Enter first name",
            required: true
          }}
        />

        <InputField
          label="Middle Name"
          labelSize="sm"
          inputProps={{
            value: value.middleName,
            onChange: e => handleChange('middleName', e.target.value),
            placeholder: "Enter middle name"
          }}
        />

        <InputField
          label="Last Name"
          required
          labelSize="sm"
          errorMessage={errors.lastName}
          inputProps={{
            value: value.lastName,
            onChange: e => handleChange('lastName', e.target.value),
            placeholder: "Enter last name",
            required: true
          }}
        />

        <InputField
          label="Extension Name"
          labelSize="sm"
          inputProps={{
            value: value.extensionName,
            onChange: e => handleChange('extensionName', e.target.value),
            placeholder: "Jr., Sr., III, etc."
          }}
        />
      </div>

      {/* Sex, Civil Status, Citizenship */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Sex"
          required
          labelSize="sm"
          errorMessage={errors.sex}
          selectProps={{
            placeholder: "Select sex...",
            options: SEX_OPTIONS,
            value: value.sex,
            searchable: true,
            onSelect: handleSelectChange('sex')
          }}
        />

        <SelectField
          label="Civil Status"
          labelSize="sm"
          errorMessage={errors.civilStatus}
          selectProps={{
            placeholder: "Select civil status...",
            options: CIVIL_STATUS_OPTIONS,
            value: value.civilStatus,
            onSelect: handleSelectChange('civilStatus')
          }}
        />

        <SelectField
          label="Citizenship"
          labelSize="sm"
          errorMessage={errors.citizenship}
          selectProps={{
            placeholder: "Select citizenship...",
            options: CITIZENSHIP_OPTIONS,
            value: value.citizenship,
            onSelect: handleSelectChange('citizenship')
          }}
        />
      </div>
    </div>
  );
}

export default BasicInformation;