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
    blood_type?: string;
    complexion?: string;
    height?: string;
    weight?: string;
    citizenship?: string;
    ethnicity?: string;
    ethnicity_others_specify?: string;
    religion?: string;
    religion_others_specify?: string;
    // Voting Information
    is_voter?: boolean | null;
    is_resident_voter?: boolean | null;
    last_voted_date?: string;
    // Mother's Maiden Name
    mother_maiden_first?: string;
    mother_maiden_middle?: string;
    mother_maiden_last?: string;
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
    blood_type: formData.blood_type || '',
    complexion: formData.complexion || '',
    height: formData.height || '',
    weight: formData.weight || '',
    citizenship: formData.citizenship || '',
    ethnicity: formData.ethnicity || '',
    religion: formData.religion || '',
    religion_others_specify: formData.religion_others_specify || '',
  };

  // Map form data to VotingInformation component props
  const votingInfoValue: VotingInformationData = {
    is_voter: formData.is_voter ? 'yes' : 'no',
    is_resident_voter: formData.is_resident_voter ? 'yes' : 'no',
    last_voted_date: formData.last_voted_date || '',
  };

  // Map form data to MotherMaidenName component props
  const motherMaidenNameValue: MotherMaidenNameData = {
    mother_maiden_first: formData.mother_maiden_first || '',
    mother_maiden_middle: formData.mother_maiden_middle || '',
    mother_maiden_last: formData.mother_maiden_last || '',
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
      if (field === 'is_voter' || field === 'is_resident_voter') {
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