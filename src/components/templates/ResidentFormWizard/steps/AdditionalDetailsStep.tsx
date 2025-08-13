import React from 'react';
import { InputField, SelectField } from '@/components/molecules';
import { StepComponentProps } from '../types';
import { BLOOD_TYPE_OPTIONS, ETHNICITY_OPTIONS, RELIGION_OPTIONS } from '../constants/enums';

export function AdditionalDetailsStep({ formData, onChange, errors }: StepComponentProps) {
  // Add empty option for dropdowns
  const bloodTypeOptionsWithEmpty = [
    { value: '', label: 'Select blood type' },
    ...BLOOD_TYPE_OPTIONS
  ];

  const ethnicityOptionsWithEmpty = [
    { value: '', label: 'Select ethnicity' },
    ...ETHNICITY_OPTIONS
  ];

  const religionOptionsWithEmpty = [
    { value: '', label: 'Select religion' },
    ...RELIGION_OPTIONS
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-primary">Additional Details</h3>
        <p className="mt-1 text-sm/6 text-secondary">
          Provide additional identification and personal information.
        </p>
      </div>
      
      {/* Physical Characteristics */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Physical Characteristics</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SelectField 
            label="Blood Type"
            value={formData.bloodType}
            onChange={(value) => onChange('bloodType', value)}
            options={bloodTypeOptionsWithEmpty}
            error={errors.bloodType}
          />
          <InputField 
            label="Height (cm)"
            type="number"
            value={formData.height}
            onChange={(e) => onChange('height', e.target.value)}
            error={errors.height}
            placeholder="170"
          />
          <InputField 
            label="Weight (kg)"
            type="number"
            value={formData.weight}
            onChange={(e) => onChange('weight', e.target.value)}
            error={errors.weight}
            placeholder="65"
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SelectField 
            label="Ethnicity"
            value={formData.ethnicity}
            onChange={(value) => onChange('ethnicity', value)}
            options={ethnicityOptionsWithEmpty}
            error={errors.ethnicity}
          />
          <SelectField 
            label="Religion"
            value={formData.religion}
            onChange={(value) => onChange('religion', value)}
            options={religionOptionsWithEmpty}
            error={errors.religion}
          />
        </div>
        {formData.religion === 'others' && (
          <InputField 
            label="Please specify religion"
            value={formData.religionOthersSpecify}
            onChange={(e) => onChange('religionOthersSpecify', e.target.value)}
            error={errors.religionOthersSpecify}
            placeholder="Specify other religion"
          />
        )}
      </div>

      {/* Voting Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Voting Information</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SelectField 
            label="Registered Voter?"
            value={formData.isVoter === true ? 'yes' : formData.isVoter === false ? 'no' : ''}
            onChange={(value) => 
              onChange('isVoter', value === 'yes' ? true : value === 'no' ? false : null)
            }
            options={[
              { value: '', label: 'Not specified' },
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]}
            error={errors.isVoter}
          />
          <SelectField 
            label="Resident Voter?"
            value={formData.isResidentVoter === true ? 'yes' : formData.isResidentVoter === false ? 'no' : ''}
            onChange={(value) => 
              onChange('isResidentVoter', value === 'yes' ? true : value === 'no' ? false : null)
            }
            options={[
              { value: '', label: 'Not specified' },
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]}
            error={errors.isResidentVoter}
          />
        </div>
        {(formData.isVoter === true || formData.isResidentVoter === true) && (
          <InputField 
            label="Last Voted Date"
            type="date"
            value={formData.lastVotedDate}
            onChange={(e) => onChange('lastVotedDate', e.target.value)}
            error={errors.lastVotedDate}
          />
        )}
      </div>

      {/* Documentation */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Documentation</h4>
        <InputField 
          label="PhilSys Card Number"
          value={formData.philsysCardNumber}
          onChange={(e) => onChange('philsysCardNumber', e.target.value)}
          error={errors.philsysCardNumber}
          placeholder="XXXX-XXXX-XXXX"
          help="Enter PhilSys (National ID) card number if available"
        />
      </div>

      {/* Family Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Mother's Maiden Name</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <InputField 
            label="First Name"
            value={formData.motherMaidenFirstName}
            onChange={(e) => onChange('motherMaidenFirstName', e.target.value)}
            error={errors.motherMaidenFirstName}
            placeholder="Mother's maiden first name"
          />
          <InputField 
            label="Middle Name"
            value={formData.motherMaidenMiddleName}
            onChange={(e) => onChange('motherMaidenMiddleName', e.target.value)}
            error={errors.motherMaidenMiddleName}
            placeholder="Mother's maiden middle name"
          />
          <InputField 
            label="Last Name"
            value={formData.motherMaidenLastName}
            onChange={(e) => onChange('motherMaidenLastName', e.target.value)}
            error={errors.motherMaidenLastName}
            placeholder="Mother's maiden last name"
          />
        </div>
      </div>
    </div>
  );
}