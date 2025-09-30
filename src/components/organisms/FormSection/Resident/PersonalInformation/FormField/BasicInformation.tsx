import React from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import {
  SEX_OPTIONS_WITH_DEFAULT,
  CIVIL_STATUS_OPTIONS_WITH_DEFAULT,
} from '@/constants/residentEnums';
import type { FormMode } from '@/types/app/ui/forms';
import type { BasicInformationFormData } from '@/types/domain/residents/forms';

interface BasicInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: BasicInformationFormData;
  onChange: (value: BasicInformationFormData) => void;
  errors?: Partial<Record<keyof BasicInformationFormData, string>>;
  className?: string;
  // Loading states
  loading?: boolean;
  loadingStates?: {
    first_name?: boolean;
    middle_name?: boolean;
    last_name?: boolean;
    extension_name?: boolean;
    sex?: boolean;
    civil_status?: boolean;
    civil_status_others_specify?: boolean;
  };
}

// Use imported options with default empty values

export function BasicInformation({
  mode = 'create',
  value,
  onChange,
  errors = {},
  className = '',
  loading = false,
  loadingStates = {},
}: BasicInformationProps) {
  console.log('🔍 BasicInformation Loading States:', {
    loading,
    loadingStates,
    first_name_loading: loading || loadingStates?.first_name,
    mode
  });
  const handleChange = (field: keyof BasicInformationFormData, newValue: string) => {
    const updatedValue = {
      ...value,
      [field]: newValue,
    };
    onChange(updatedValue);
  };

  const handleSelectChange = (field: keyof BasicInformationFormData) => (option: any) => {
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
      <div className={mode === 'view' ? 'space-y-4' : 'grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4'}>
        {/* Name Fields - Combined in view mode */}
        {mode === 'view' ? (
          <InputField
            mode={mode}
            label="Full Name"
            labelSize="sm"
            orientation="horizontal"
            loading={loading || loadingStates?.first_name || loadingStates?.last_name}
            inputProps={{
              value: formatFullName(),
              readOnly: true,
            }}
          />
        ) : (
          <>
            <InputField
              mode={mode}
              label="First Name"
              required
              labelSize="sm"
              errorMessage={errors.first_name}
              loading={loading || loadingStates?.first_name}
              inputProps={{
                value: value.first_name,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('first_name', e.target.value),
                placeholder: 'Enter first name',
                required: true,
              }}
            />

            <InputField
              mode={mode}
              label="Middle Name"
              labelSize="sm"
              loading={loading || loadingStates?.middle_name}
              inputProps={{
                value: value.middle_name || '',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('middle_name', e.target.value),
                placeholder: 'Enter middle name',
              }}
            />

            <InputField
              mode={mode}
              label="Last Name"
              required
              labelSize="sm"
              errorMessage={errors.last_name}
              loading={loading || loadingStates?.last_name}
              inputProps={{
                value: value.last_name,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('last_name', e.target.value),
                placeholder: 'Enter last name',
                required: true,
              }}
            />

            <InputField
              mode={mode}
              label="Extension Name"
              labelSize="sm"
              loading={loading || loadingStates?.extension_name}
              inputProps={{
                value: value.extension_name || '',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('extension_name', e.target.value),
                placeholder: 'Jr., Sr., III, etc.',
              }}
            />
          </>
        )}

        {/* Sex, Civil Status, Civil Status Other (conditional), Citizenship */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sex
          </label>
          {errors.sex && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.sex}</p>
          )}
          <div className="flex space-x-4">
            {SEX_OPTIONS_WITH_DEFAULT.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sex"
                  value={option.value}
                  checked={value.sex === option.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('sex', e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <SelectField
          mode={mode}
          label="Civil Status"
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.civil_status}
          loading={loading || loadingStates?.civil_status}
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
            orientation={mode === 'view' ? 'horizontal' : 'vertical'}
            errorMessage={errors.civil_status_others_specify}
            loading={loading || loadingStates?.civil_status_others_specify}
            inputProps={{
              value: value.civil_status_others_specify || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('civil_status_others_specify', e.target.value),
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
