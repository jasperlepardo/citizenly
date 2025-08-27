import React from 'react';

import { InputField, SelectField, ControlFieldSet } from '@/components';
import { Radio } from '@/components/atoms/Field/Control/Radio/Radio';
import {
  SEX_OPTIONS_WITH_DEFAULT,
  CIVIL_STATUS_OPTIONS_WITH_DEFAULT,
} from '@/lib/constants/resident-enums';
import type { FormMode } from '@/types';

export interface BasicInformationData {
  first_name: string;
  middle_name: string;
  last_name: string;
  extension_name: string;
  sex: 'male' | 'female' | '';
  civil_status: string;
  civil_status_others_specify?: string;
}

interface BasicInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: BasicInformationData;
  onChange: (value: BasicInformationData) => void;
  errors?: Partial<Record<keyof BasicInformationData, string>>;
  className?: string;
}

// Use imported options with default empty values

export function BasicInformation({
  mode = 'create',
  value,
  onChange,
  errors = {},
  className = '',
}: BasicInformationProps) {
  const handleChange = (field: keyof BasicInformationData, newValue: string) => {
    const updatedValue = {
      ...value,
      [field]: newValue,
    };
    onChange(updatedValue);
  };

  const handleSelectChange = (field: keyof BasicInformationData) => (option: any) => {
    handleChange(field, option?.value || '');
  };

  // Helper function to format full name
  const formatFullName = () => {
    const parts = [
      value.first_name?.trim(),
      value.middle_name?.trim(),
      value.last_name?.trim(),
      value.extension_name?.trim(),
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '—';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Basic Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Basic details and identification information.
        </p>
      </div>

      {/* All Fields in One Grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Name Fields - Combined in view mode */}
        {mode === 'view' ? (
          <div className="col-span-full">
            <InputField
              mode={mode}
              label="Full Name"
              labelSize="sm"
              inputProps={{
                value: formatFullName(),
                readOnly: true,
              }}
            />
          </div>
        ) : (
          <>
            <InputField
              mode={mode}
              label="First Name"
              required
              labelSize="sm"
              errorMessage={errors.first_name}
              inputProps={{
                value: value.first_name,
                onChange: e => handleChange('first_name', e.target.value),
                placeholder: 'Enter first name',
                required: true,
              }}
            />

            <InputField
              mode={mode}
              label="Middle Name"
              labelSize="sm"
              inputProps={{
                value: value.middle_name,
                onChange: e => handleChange('middle_name', e.target.value),
                placeholder: 'Enter middle name',
              }}
            />

            <InputField
              mode={mode}
              label="Last Name"
              required
              labelSize="sm"
              errorMessage={errors.last_name}
              inputProps={{
                value: value.last_name,
                onChange: e => handleChange('last_name', e.target.value),
                placeholder: 'Enter last name',
                required: true,
              }}
            />

            <InputField
              mode={mode}
              label="Extension Name"
              labelSize="sm"
              inputProps={{
                value: value.extension_name,
                onChange: e => handleChange('extension_name', e.target.value),
                placeholder: 'Jr., Sr., III, etc.',
              }}
            />
          </>
        )}

        {/* Sex, Civil Status, Civil Status Other (conditional), Citizenship */}
        <ControlFieldSet
          mode={mode}
          type="radio"
          label="Sex"
          labelSize="sm"
          radioName="sex"
          radioValue={value.sex}
          onRadioChange={(selectedValue: string) => handleChange('sex', selectedValue)}
          errorMessage={errors.sex}
          orientation="horizontal"
          spacing="sm"
        >
          {SEX_OPTIONS_WITH_DEFAULT.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              size="md"
              style="button"
              buttonProps={{
                variant: 'neutral-outline',
                size: 'lg',
              }}
            />
          ))}
        </ControlFieldSet>

        <SelectField
          mode={mode}
          label="Civil Status"
          labelSize="sm"
          errorMessage={errors.civil_status}
          selectProps={{
            placeholder: 'Select civil status...',
            options: CIVIL_STATUS_OPTIONS_WITH_DEFAULT as any,
            value: value.civil_status,
            onSelect: handleSelectChange('civil_status'),
          }}
        />

        {/* Show input field when "others" is selected */}
        {value.civil_status === 'others' && (
          <InputField
            mode={mode}
            label="Specify Civil Status"
            required
            labelSize="sm"
            errorMessage={errors.civil_status_others_specify}
            inputProps={{
              value: value.civil_status_others_specify || '',
              onChange: e => handleChange('civil_status_others_specify', e.target.value),
              placeholder: 'Please specify civil status',
              required: true,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default BasicInformation;
