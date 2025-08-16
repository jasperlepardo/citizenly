import React from 'react';
import { InputField, SelectField } from '@/components/molecules';
import { BLOOD_TYPE_OPTIONS, ETHNICITY_OPTIONS, RELIGION_OPTIONS } from '@/lib/constants/resident-enums';

export interface PhysicalCharacteristicsData {
  bloodType: string;
  complexion: string;
  height: string;
  weight: string;
  citizenship: string;
  ethnicity: string;
  religion: string;
  religionOthersSpecify: string;
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

  // Add empty option for dropdowns
  const bloodTypeOptionsWithEmpty = [
    { value: '', label: 'Select blood type' },
    ...BLOOD_TYPE_OPTIONS,
  ];

  const ethnicityOptionsWithEmpty = [
    { value: '', label: 'Select ethnicity' },
    ...ETHNICITY_OPTIONS,
  ];

  const religionOptionsWithEmpty = [
    { value: '', label: 'Select religion' }, 
    ...RELIGION_OPTIONS
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Physical Characteristics</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Physical attributes and personal identifiers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField
          label="Blood Type"
          labelSize="sm"
          errorMessage={errors.bloodType}
          selectProps={{
            placeholder: "Select blood type...",
            options: bloodTypeOptionsWithEmpty,
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
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <InputField
          label="Citizenship"
          labelSize="sm"
          errorMessage={errors.citizenship}
          inputProps={{
            value: value.citizenship,
            onChange: (e) => handleChange('citizenship', e.target.value),
            placeholder: "Filipino",
            error: errors.citizenship
          }}
        />
        
        <SelectField
          label="Ethnicity"
          labelSize="sm"
          errorMessage={errors.ethnicity}
          selectProps={{
            placeholder: "Select ethnicity...",
            options: ethnicityOptionsWithEmpty,
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
            options: religionOptionsWithEmpty,
            value: value.religion,
            onSelect: (option) => handleChange('religion', option?.value || '')
          }}
        />
      </div>

      {value.religion === 'others' && (
        <InputField
          label="Please specify religion"
          labelSize="sm"
          errorMessage={errors.religionOthersSpecify}
          inputProps={{
            value: value.religionOthersSpecify,
            onChange: (e) => handleChange('religionOthersSpecify', e.target.value),
            placeholder: "Specify other religion",
            error: errors.religionOthersSpecify
          }}
        />
      )}
    </div>
  );
}

export default PhysicalCharacteristics;