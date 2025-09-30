import React from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { ControlField } from '@/components/molecules/FieldSet/ControlField/ControlField';
import { Radio } from '@/components/atoms/Field/Control/Radio/Radio';

import type { FormMode } from '@/types/app/ui/forms';
import type { VotingInformationFormData } from '@/types/domain/residents/forms';

/**
 * Props for the VotingInformation component
 * 
 * @description Handles voter registration status and voting history.
 * Uses string-based form values that get converted to boolean for API.
 */
export interface VotingInformationProps {
  /** 
   * Form mode - determines if fields are editable or read-only
   * @default 'create'
   */
  mode?: FormMode;
  
  /**
   * Current voting information data
   */
  value: VotingInformationFormData;
  
  /**
   * Callback when voting information changes
   * @param value - Updated voting information
   */
  onChange: (value: VotingInformationFormData) => void;
  
  /**
   * Validation errors by field name
   */
  errors: Record<string, string>;
  
  /**
   * Additional CSS classes
   */
  className?: string;

  // Individual field loading states
  loadingStates?: {
    is_voter?: boolean;
    is_resident_voter?: boolean;
    last_voted_date?: boolean;
  };
}

export function VotingInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
  loadingStates = {},
}: Readonly<VotingInformationProps>) {
  /**
   * Type-safe field change handler
   */
  const handleChange = (field: keyof VotingInformationFormData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Yes/No options for voter status
  const VOTER_STATUS_OPTIONS = [
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

      {/* All Fields in One Grid */}
      <div className={mode === 'view' ? 'space-y-4' : 'grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4'}>
        <ControlField
          label="Registered Voter?"
          labelSize="sm"
          errorMessage={errors.is_voter}
          orientation="horizontal"
          mode={mode}
          loading={loadingStates?.is_voter}
        >
          {VOTER_STATUS_OPTIONS.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              style="button"
              buttonProps={{
                variant: 'neutral-outline',
                size: 'lg',
              }}
            />
          ))}
        </ControlField>

        <ControlField
          label="Resident Voter?"
          labelSize="sm"
          errorMessage={errors.is_resident_voter}
          orientation="horizontal"
          mode={mode}
          loading={loadingStates?.is_resident_voter}
        >
          {VOTER_STATUS_OPTIONS.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              style="button"
              buttonProps={{
                variant: 'neutral-outline',
                size: 'lg',
              }}
            />
          ))}
        </ControlField>

        <InputField
          label="Last Voted Year"
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.last_voted_date}
          mode={mode}
          loading={loadingStates?.last_voted_date}
          inputProps={{
            type: 'number',
            value: value.last_voted_date || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('last_voted_date', e.target.value),
            placeholder: '2024',
            min: '1900',
            max: new Date().getFullYear().toString(),
            disabled: value.is_voter !== 'yes' && value.is_resident_voter !== 'yes',
          }}
        />
      </div>
    </div>
  );
}

export default VotingInformation;
