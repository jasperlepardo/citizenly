import React from 'react';
import HouseholdSelector from '@/components/organisms/HouseholdSelector/HouseholdSelector';
import { ContactInformationForm } from '@/components/organisms/Form';
import { StepComponentProps } from '../types';

export function ContactAddressStep({ formData, onChange, errors }: StepComponentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600 dark:text-gray-400">Section 2: Contact Details</h3>
        <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
          Provide contact information and household details.
        </p>
      </div>

      {/* Contact Information */}
      <ContactInformationForm
        formData={formData}
        onChange={onChange}
        errors={errors}
      />

      {/* Household Assignment */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Household Assignment</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select an existing household or create a new one for this resident.
        </p>
        <HouseholdSelector
          value={formData.householdCode || ''}
          onSelect={householdCode => onChange('householdCode', householdCode || '')}
          error={errors.householdCode}
          placeholder="Search households by head of family or address"
        />
      </div>
    </div>
  );
}
