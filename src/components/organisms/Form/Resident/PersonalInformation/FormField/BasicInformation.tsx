import React from 'react';
import { InputField, SelectField, ControlFieldSet } from '@/components/molecules';
import { Radio } from '@/components/atoms/Field/Control/Radio/Radio';
import { 
  SEX_OPTIONS_WITH_DEFAULT, 
  CIVIL_STATUS_OPTIONS_WITH_DEFAULT
} from '@/lib/constants/resident-enums';

export interface BasicInformationData {
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: 'male' | 'female' | '';
  civilStatus: string;
  civilStatusOthersSpecify?: string;
}

interface BasicInformationProps {
  value: BasicInformationData;
  onChange: (value: BasicInformationData) => void;
  errors?: Partial<Record<keyof BasicInformationData, string>>;
  className?: string;
}

// Use imported options with default empty values

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

      {/* All Fields in One Grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Name Fields */}
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

        {/* Sex, Civil Status, Civil Status Other (conditional), Citizenship */}
        <ControlFieldSet
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
          {SEX_OPTIONS_WITH_DEFAULT.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              size="md"
              style="button"
              buttonProps={{
                variant: 'neutral-outline',
                size: 'lg'
              }}
            />
          ))}
        </ControlFieldSet>

        <SelectField
          label="Civil Status"
          labelSize="sm"
          errorMessage={errors.civilStatus}
          selectProps={{
            placeholder: "Select civil status...",
            options: CIVIL_STATUS_OPTIONS_WITH_DEFAULT as any,
            value: value.civilStatus,
            onSelect: handleSelectChange('civilStatus')
          }}
        />
        
        {/* Show input field when "others" is selected */}
        {value.civilStatus === 'others' && (
          <InputField
            label="Specify Civil Status"
            required
            labelSize="sm"
            errorMessage={errors.civilStatusOthersSpecify}
            inputProps={{
              value: value.civilStatusOthersSpecify || '',
              onChange: e => handleChange('civilStatusOthersSpecify', e.target.value),
              placeholder: "Please specify civil status",
              required: true
            }}
          />
        )}

      </div>
    </div>
  );
}

export default BasicInformation;