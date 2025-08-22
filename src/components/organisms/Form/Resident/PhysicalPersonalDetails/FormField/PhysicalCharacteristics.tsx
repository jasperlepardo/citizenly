import React from 'react';
import { InputField, SelectField } from '@/components/molecules';
import { BLOOD_TYPE_OPTIONS_WITH_DEFAULT, ETHNICITY_OPTIONS_WITH_DEFAULT, RELIGION_OPTIONS_WITH_DEFAULT, CITIZENSHIP_OPTIONS_WITH_DEFAULT } from '@/lib/constants/resident-enums';

export interface PhysicalCharacteristicsData {
  bloodType: string;
  complexion: string;
  height: string;
  weight: string;
  citizenship: string;
  ethnicity: string;
  religion: string;
  religionOthersSpecify?: string;
}

export interface PhysicalCharacteristicsProps {
  value: PhysicalCharacteristicsData;
  onChange: (value: PhysicalCharacteristicsData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function PhysicalCharacteristics({ 
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

  // Use pre-defined options - these fields have database defaults so no empty options needed
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
          errorMessage={errors.bloodType}
          selectProps={{
            placeholder: "Select blood type...",
            options: bloodTypeOptions,
            value: value.bloodType,
            onSelect: (option) => handleChange('bloodType', option?.value || '')
          }}
        />
        
        <InputField
          label="Complexion"
          labelSize="sm"
          errorMessage={errors.complexion}
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
            errorMessage={errors.religionOthersSpecify}
            inputProps={{
              value: value.religionOthersSpecify || '',
              onChange: (e) => handleChange('religionOthersSpecify', e.target.value),
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