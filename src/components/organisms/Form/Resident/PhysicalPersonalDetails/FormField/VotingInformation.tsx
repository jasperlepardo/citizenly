import React from 'react';
import { InputField, SelectField } from '@/components/molecules';

export interface VotingInformationData {
  isVoter: boolean | null;
  isResidentVoter: boolean | null;
  lastVotedDate: string;
}

export interface VotingInformationProps {
  value: VotingInformationData;
  onChange: (value: VotingInformationData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function VotingInformation({ 
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

  const yesNoOptions = [
    { value: '', label: 'Not specified' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Voting Information</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Voter registration and participation details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField
          label="Registered Voter?"
          labelSize="sm"
          errorMessage={errors.isVoter}
          selectProps={{
            placeholder: "Select status...",
            options: yesNoOptions,
            value: value.isVoter === true ? 'yes' : value.isVoter === false ? 'no' : '',
            onSelect: (option) => {
              const optionValue = option?.value;
              handleChange('isVoter', optionValue === 'yes' ? true : optionValue === 'no' ? false : null);
            }
          }}
        />
        
        <SelectField
          label="Resident Voter?"
          labelSize="sm"
          errorMessage={errors.isResidentVoter}
          selectProps={{
            placeholder: "Select status...",
            options: yesNoOptions,
            value: value.isResidentVoter === true ? 'yes' : value.isResidentVoter === false ? 'no' : '',
            onSelect: (option) => {
              const optionValue = option?.value;
              handleChange('isResidentVoter', optionValue === 'yes' ? true : optionValue === 'no' ? false : null);
            }
          }}
        />
      </div>

      {(value.isVoter === true || value.isResidentVoter === true) && (
        <InputField
          label="Last Voted Year"
          labelSize="sm"
          errorMessage={errors.lastVotedDate}
          inputProps={{
            type: "number",
            value: value.lastVotedDate,
            onChange: (e) => handleChange('lastVotedDate', e.target.value),
            placeholder: "2024",
            min: "1900",
            max: new Date().getFullYear().toString(),
            error: errors.lastVotedDate
          }}
        />
      )}
    </div>
  );
}

export default VotingInformation;