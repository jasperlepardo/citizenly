import React from 'react';

import { InputField, SelectField } from '@/components';
import { BLOOD_TYPE_OPTIONS_WITH_DEFAULT, ETHNICITY_OPTIONS_WITH_DEFAULT, RELIGION_OPTIONS_WITH_DEFAULT, CITIZENSHIP_OPTIONS_WITH_DEFAULT } from '@/lib/constants/resident-enums';
import type { FormMode } from '@/types';

export interface PhysicalCharacteristicsData {
  blood_type: string;
  complexion: string;
  height: string;
  weight: string;
  citizenship: string;
  ethnicity: string;
  religion: string;
  religion_others_specify?: string;
}

export interface PhysicalCharacteristicsProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: PhysicalCharacteristicsData;
  onChange: (value: PhysicalCharacteristicsData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function PhysicalCharacteristics({ 
  mode = 'create',
  value, 
  onChange, 
  errors,
  className = '' 
}: PhysicalCharacteristicsProps) {
  
  const handleChange = (field: keyof PhysicalCharacteristicsData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Use pre-defined options - blood_type and citizenship have database defaults, religion and ethnicity have "Select" options
  const bloodTypeOptions = BLOOD_TYPE_OPTIONS_WITH_DEFAULT as any;
  const ethnicityOptions = ETHNICITY_OPTIONS_WITH_DEFAULT as any;
  const religionOptions = RELIGION_OPTIONS_WITH_DEFAULT as any;
  const citizenshipOptions = CITIZENSHIP_OPTIONS_WITH_DEFAULT as any;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Physical Characteristics</h4>
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
            placeholder: "Select blood type...",
            options: bloodTypeOptions,
            value: value.blood_type,
            onSelect: (option) => handleChange('blood_type', option?.value || '')
          }}
        />
        
        <InputField
          label="Complexion"
          labelSize="sm"
          errorMessage={errors.complexion}
          mode={mode}
          inputProps={{
            value: value.complexion,
            onChange: (e) => handleChange('complexion', e.target.value),
            placeholder: "e.g., Fair, Medium, Dark",
            error: errors.complexion
          }}
        />

        <InputField
          label="Height (cm)"
          labelSize="sm"
          errorMessage={errors.height}
          mode={mode}
          inputProps={{
            type: "number",
            value: value.height,
            onChange: (e) => handleChange('height', e.target.value),
            placeholder: "170",
            error: errors.height
          }}
        />
        
        <InputField
          label="Weight (kg)"
          labelSize="sm"
          errorMessage={errors.weight}
          mode={mode}
          inputProps={{
            type: "number",
            value: value.weight,
            onChange: (e) => handleChange('weight', e.target.value),
            placeholder: "65",
            error: errors.weight
          }}
        />

        <SelectField
          label="Citizenship"
          labelSize="sm"
          errorMessage={errors.citizenship}
          mode={mode}
          selectProps={{
            placeholder: "Select citizenship...",
            options: citizenshipOptions,
            value: value.citizenship || 'filipino',
            onSelect: (option) => handleChange('citizenship', option?.value || 'filipino')
          }}
        />
        
        <SelectField
          label="Ethnicity"
          labelSize="sm"
          errorMessage={errors.ethnicity}
          mode={mode}
          selectProps={{
            placeholder: "Select ethnicity...",
            options: ethnicityOptions,
            value: value.ethnicity,
            onSelect: (option) => handleChange('ethnicity', option?.value || '')
          }}
        />

        
        <SelectField
          label="Religion"
          labelSize="sm"
          errorMessage={errors.religion}
          mode={mode}
          selectProps={{
            placeholder: "Select religion...",
            options: religionOptions,
            value: value.religion,
            onSelect: (option) => handleChange('religion', option?.value || '')
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
              onChange: (e) => handleChange('religion_others_specify', e.target.value),
              placeholder: "Please specify religion",
              required: true
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PhysicalCharacteristics;