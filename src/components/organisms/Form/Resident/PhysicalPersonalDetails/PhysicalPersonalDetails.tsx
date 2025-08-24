import React from 'react';
import type { FormMode } from '@/types';
import { PhysicalCharacteristics, PhysicalCharacteristicsData } from './FormField/PhysicalCharacteristics';
import { VotingInformation, VotingInformationData } from './FormField/VotingInformation';
import { MotherMaidenName, MotherMaidenNameData } from './FormField/MotherMaidenName';

export interface PhysicalPersonalDetailsFormProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  formData: {
    // Physical Characteristics
    bloodType?: string;
    complexion?: string;
    height?: string;
    weight?: string;
    citizenship?: string;
    ethnicity?: string;
    ethnicityOthersSpecify?: string;
    religion?: string;
    religionOthersSpecify?: string;
    // Voting Information
    isVoter?: boolean | null;
    isResidentVoter?: boolean | null;
    lastVotedDate?: string;
    // Mother's Maiden Name
    motherMaidenFirstName?: string;
    motherMaidenMiddleName?: string;
    motherMaidenLastName?: string;
  };
  onChange: (field: string | number | symbol, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
}

export function PhysicalPersonalDetailsForm({ 
  mode = 'create',
  formData, 
  onChange, 
  errors
}: PhysicalPersonalDetailsFormProps) {

  // Map form data to PhysicalCharacteristics component props
  const physicalCharacteristicsValue: PhysicalCharacteristicsData = {
    bloodType: formData.bloodType || '',
    complexion: formData.complexion || '',
    height: formData.height || '',
    weight: formData.weight || '',
    citizenship: formData.citizenship || '',
    ethnicity: formData.ethnicity || '',
    religion: formData.religion || '',
    religionOthersSpecify: formData.religionOthersSpecify || '',
  };

  // Map form data to VotingInformation component props
  const votingInfoValue: VotingInformationData = {
    isVoter: formData.isVoter ? 'yes' : 'no',
    isResidentVoter: formData.isResidentVoter ? 'yes' : 'no',
    lastVotedDate: formData.lastVotedDate || '',
  };

  // Map form data to MotherMaidenName component props
  const motherMaidenNameValue: MotherMaidenNameData = {
    motherMaidenFirstName: formData.motherMaidenFirstName || '',
    motherMaidenMiddleName: formData.motherMaidenMiddleName || '',
    motherMaidenLastName: formData.motherMaidenLastName || '',
  };

  // Handle changes from PhysicalCharacteristics component
  const handlePhysicalCharacteristicsChange = (value: PhysicalCharacteristicsData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  // Handle changes from VotingInformation component
  const handleVotingInfoChange = (value: VotingInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      if (field === 'isVoter' || field === 'isResidentVoter') {
        onChange(field as keyof typeof value, fieldValue === 'yes');
      } else {
        onChange(field as keyof typeof value, fieldValue);
      }
    });
  };

  // Handle changes from MotherMaidenName component
  const handleMotherMaidenNameChange = (value: MotherMaidenNameData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-xs p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Physical & Personal Details</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Physical characteristics, voting information, and personal details.
          </p>
        </div>

        <div className="space-y-8">
          {/* Physical Characteristics */}
          <PhysicalCharacteristics
            value={physicalCharacteristicsValue}
            onChange={handlePhysicalCharacteristicsChange}
            errors={errors}
            mode={mode}
          />

          {/* Voting Information */}
          <VotingInformation
            value={votingInfoValue}
            onChange={handleVotingInfoChange}
            errors={errors}
            mode={mode}
          />

          {/* Mother's Maiden Name */}
          <MotherMaidenName
            value={motherMaidenNameValue}
            onChange={handleMotherMaidenNameChange}
            errors={errors}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
}

export default PhysicalPersonalDetailsForm;