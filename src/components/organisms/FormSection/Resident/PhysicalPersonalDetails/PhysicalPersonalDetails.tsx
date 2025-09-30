import React from 'react';


import { MotherMaidenName } from './FormField/MotherMaidenName';
import { PhysicalCharacteristics } from './FormField/PhysicalCharacteristics';
import { VotingInformation } from './FormField/VotingInformation';

import type { FormMode } from '@/types/app/ui/forms';
import type {
  MotherMaidenNameFormData,
  PhysicalCharacteristicsFormData,
  VotingInformationFormData,
} from '@/types/domain/residents/forms';

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
  // Individual field loading states
  loadingStates?: {
    blood_type?: boolean;
    complexion?: boolean;
    height?: boolean;
    weight?: boolean;
    citizenship?: boolean;
    ethnicity?: boolean;
    religion?: boolean;
    is_voter?: boolean;
    is_resident_voter?: boolean;
    last_voted_date?: boolean;
    mother_maiden_first?: boolean;
    mother_maiden_middle?: boolean;
    mother_maiden_last?: boolean;
  };
}

export function PhysicalPersonalDetailsForm({
  mode = 'create',
  formData,
  onChange,
  errors,
  loadingStates = {},
}: Readonly<PhysicalPersonalDetailsFormProps>) {
  // Map form data to PhysicalCharacteristics component props
  const physicalCharacteristicsValue: PhysicalCharacteristicsFormData = {
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
  const votingInfoValue: VotingInformationFormData = {
    is_voter: formData.is_voter ? 'yes' : 'no',
    is_resident_voter: formData.is_resident_voter ? 'yes' : 'no',
    last_voted_date: formData.last_voted_date || '',
  };

  // Map form data to MotherMaidenName component props
  const motherMaidenNameValue: MotherMaidenNameFormData = {
    mother_maiden_first_name: formData.mother_maiden_first || '',
    mother_maiden_middle_name: formData.mother_maiden_middle || '',
    mother_maiden_last_name: formData.mother_maiden_last || '',
  };

  // Handle changes from PhysicalCharacteristics component
  const handlePhysicalCharacteristicsChange = (value: PhysicalCharacteristicsFormData) => {
    console.log('🔍 PhysicalPersonalDetails: handlePhysicalCharacteristicsChange called with', value);
    
    // Special debug for ethnicity
    if (value.ethnicity) {
      console.log('🎯 PhysicalPersonalDetails: ETHNICITY CHANGE DETECTED:', value.ethnicity);
      if (value.ethnicity === 'badjao') {
        console.log('🎯 PhysicalPersonalDetails: BADJAO FORWARDING TO RESIDENT FORM!');
      }
    }
    
    // Batch all changes together to prevent race conditions
    const batchedUpdates: Record<string, string> = {};
    
    Object.entries(value).forEach(([field, fieldValue]) => {
      console.log('🔍 PhysicalPersonalDetails: batching field', { field, fieldValue });
      batchedUpdates[field] = fieldValue as string;
    });
    
    // Send as a single batch update to prevent race conditions
    console.log('🎯 PhysicalPersonalDetails: Sending batched update:', batchedUpdates);
    
    // Use a special batch key to signal ResidentForm to process all fields atomically
    onChange('__physical_characteristics_batch__' as any, batchedUpdates as any);
  };

  // Handle changes from VotingInformation component
  const handleVotingInfoChange = (value: VotingInformationFormData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      if (field === 'is_voter' || field === 'is_resident_voter') {
        onChange(field as keyof typeof value, fieldValue === 'yes');
      } else {
        onChange(field as string, fieldValue as string | number | boolean | null);
      }
    });
  };

  // Handle changes from MotherMaidenName component
  const handleMotherMaidenNameChange = (value: MotherMaidenNameFormData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-xs dark:border-gray-600 dark:bg-gray-800">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Physical & Personal Details
          </h2>
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
            loadingStates={{
              blood_type: loadingStates?.blood_type,
              complexion: loadingStates?.complexion,
              height: loadingStates?.height,
              weight: loadingStates?.weight,
              citizenship: loadingStates?.citizenship,
              ethnicity: loadingStates?.ethnicity,
              religion: loadingStates?.religion,
            }}
          />

          {/* Voting Information */}
          <VotingInformation
            value={votingInfoValue}
            onChange={handleVotingInfoChange}
            errors={errors}
            mode={mode}
            loadingStates={{
              is_voter: loadingStates?.is_voter,
              is_resident_voter: loadingStates?.is_resident_voter,
              last_voted_date: loadingStates?.last_voted_date,
            }}
          />

          {/* Mother's Maiden Name */}
          <MotherMaidenName
            value={motherMaidenNameValue}
            onChange={handleMotherMaidenNameChange}
            errors={errors}
            mode={mode}
            loadingStates={{
              mother_maiden_first: loadingStates?.mother_maiden_first,
              mother_maiden_middle: loadingStates?.mother_maiden_middle,
              mother_maiden_last: loadingStates?.mother_maiden_last,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PhysicalPersonalDetailsForm;
