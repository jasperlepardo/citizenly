import React from 'react';

import { InputField, SelectField } from '@/components';
import {
  BLOOD_TYPE_OPTIONS_WITH_DEFAULT,
  ETHNICITY_OPTIONS_WITH_DEFAULT,
  RELIGION_OPTIONS_WITH_DEFAULT,
  CITIZENSHIP_OPTIONS_WITH_DEFAULT,
} from '@/constants/residentEnums';
import type { FormMode, PhysicalCharacteristicsFormData } from '@/types';

export interface PhysicalCharacteristicsProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: PhysicalCharacteristicsFormData;
  onChange: (value: PhysicalCharacteristicsFormData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function PhysicalCharacteristics({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
}: PhysicalCharacteristicsProps) {
  const handleChange = (field: keyof PhysicalCharacteristicsFormData, fieldValue: string) => {
    console.log('🔍 PhysicalCharacteristics: handleChange called', { field, fieldValue });
    
    // Special debug for ethnicity changes
    if (field === 'ethnicity') {
      console.log('🎯 ETHNICITY SELECTION DETECTED:', fieldValue);
      if (fieldValue === 'badjao') {
        console.log('🎯 BADJAO SELECTED - This should trigger Indigenous People checkbox!');
      }
    }
    
    const updatedValue = {
      ...value,
      [field]: fieldValue,
    };
    console.log('🔍 PhysicalCharacteristics: calling onChange with', updatedValue);
    onChange(updatedValue);
  };

  // Use pre-defined options - blood_type and citizenship have database defaults, religion and ethnicity have "Select" options
  const bloodTypeOptions = BLOOD_TYPE_OPTIONS_WITH_DEFAULT;
  const ethnicityOptions = ETHNICITY_OPTIONS_WITH_DEFAULT;
  const religionOptions = RELIGION_OPTIONS_WITH_DEFAULT;
  const citizenshipOptions = CITIZENSHIP_OPTIONS_WITH_DEFAULT;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Physical Characteristics
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Physical attributes and personal identifiers.
        </p>
      </div>

      {/* All Fields in One Grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Blood Type"
          labelSize="sm"
          errorMessage={errors.blood_type}
          mode={mode}
          selectProps={{
            placeholder: 'Select blood type...',
            options: bloodTypeOptions as any,
            value: value.blood_type,
            onSelect: option => handleChange('blood_type', option?.value || ''),
          }}
        />

        <InputField
          label="Complexion"
          labelSize="sm"
          errorMessage={errors.complexion}
          mode={mode}
          inputProps={{
            value: value.complexion,
            onChange: e => handleChange('complexion', e.target.value),
            placeholder: 'e.g., Fair, Medium, Dark',
            error: errors.complexion,
          }}
        />

        <InputField
          label="Height (cm)"
          labelSize="sm"
          errorMessage={errors.height}
          mode={mode}
          inputProps={{
            type: 'number',
            value: value.height,
            onChange: e => handleChange('height', e.target.value),
            placeholder: '170',
            error: errors.height,
          }}
        />

        <InputField
          label="Weight (kg)"
          labelSize="sm"
          errorMessage={errors.weight}
          mode={mode}
          inputProps={{
            type: 'number',
            value: value.weight,
            onChange: e => handleChange('weight', e.target.value),
            placeholder: '65',
            error: errors.weight,
          }}
        />

        <SelectField
          label="Citizenship"
          labelSize="sm"
          errorMessage={errors.citizenship}
          mode={mode}
          selectProps={{
            placeholder: 'Select citizenship...',
            options: citizenshipOptions as any,
            value: value.citizenship || 'filipino',
            onSelect: option => handleChange('citizenship', option?.value || 'filipino'),
          }}
        />

        <SelectField
          label="Ethnicity"
          labelSize="sm"
          errorMessage={errors.ethnicity}
          mode={mode}
          selectProps={{
            placeholder: 'Select ethnicity...',
            options: ethnicityOptions as any,
            value: value.ethnicity,
            onSelect: option => handleChange('ethnicity', option?.value || ''),
          }}
        />

        <SelectField
          label="Religion"
          labelSize="sm"
          errorMessage={errors.religion}
          mode={mode}
          selectProps={{
            placeholder: 'Select religion...',
            options: religionOptions as any,
            value: value.religion,
            onSelect: option => handleChange('religion', option?.value || ''),
          }}
        />

        {/* Conditional Religion Other Specify - shows next to religion when religion = 'others' */}
        {value.religion === 'others' && (
          <InputField
            label="Specify Religion"
            required
            labelSize="sm"
            errorMessage={errors.religion_others_specify}
            mode={mode}
            inputProps={{
              value: value.religion_others_specify || '',
              onChange: e => handleChange('religion_others_specify', e.target.value),
              placeholder: 'Please specify religion',
              required: true,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PhysicalCharacteristics;
