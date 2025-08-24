import React from 'react';
import type { FormMode } from '@/types/forms';
import { InputField, ControlFieldSet } from '@/components/molecules';
import { Radio } from '@/components/atoms/Field/Control/Radio/Radio';

export interface VotingInformationData {
  isVoter: string; // 'yes' | 'no' (defaults to 'no')
  isResidentVoter: string; // 'yes' | 'no' (defaults to 'no')
  lastVotedDate: string;
}

export interface VotingInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: VotingInformationData;
  onChange: (value: VotingInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function VotingInformation({ 
  mode = 'create',
  value, 
  onChange, 
  errors,
  className = '' 
}: VotingInformationProps) {
  
  const handleChange = (field: keyof VotingInformationData, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Yes/No options for voter status
  const VOTER_STATUS_OPTIONS = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Voting Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Voter registration and participation details.
        </p>
      </div>

      {/* All Fields in One Grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <ControlFieldSet
          type="radio"
          label="Registered Voter?"
          labelSize="sm"
          radioName="isVoter"
          radioValue={value.isVoter || 'no'}
          onRadioChange={(selectedValue: string) => handleChange('isVoter', selectedValue)}
          errorMessage={errors.isVoter}
          orientation="horizontal"
          spacing="sm"
          mode={mode}
        >
          {VOTER_STATUS_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              style="button"
              buttonProps={{
                variant: 'neutral-outline',
                size: 'lg'
              }}
            />
          ))}
        </ControlFieldSet>
        
        <ControlFieldSet
          type="radio"
          label="Resident Voter?"
          labelSize="sm"
          radioName="isResidentVoter"
          radioValue={value.isResidentVoter || 'no'}
          onRadioChange={(selectedValue: string) => handleChange('isResidentVoter', selectedValue)}
          errorMessage={errors.isResidentVoter}
          orientation="horizontal"
          spacing="sm"
          mode={mode}
        >
          {VOTER_STATUS_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              style="button"
              buttonProps={{
                variant: 'neutral-outline',
                size: 'lg'
              }}
            />
          ))}
        </ControlFieldSet>

        <InputField
          label="Last Voted Year"
          labelSize="sm"
          errorMessage={errors.lastVotedDate}
          mode={mode}
          inputProps={{
            type: "number",
            value: value.lastVotedDate,
            onChange: (e) => handleChange('lastVotedDate', e.target.value),
            placeholder: "2024",
            min: "1900",
            max: new Date().getFullYear().toString(),
            disabled: value.isVoter !== 'yes' && value.isResidentVoter !== 'yes',
            error: errors.lastVotedDate
          }}
        />
      </div>
    </div>
  );
}

export default VotingInformation;