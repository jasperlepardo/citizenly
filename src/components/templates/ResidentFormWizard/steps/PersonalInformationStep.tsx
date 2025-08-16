import React from 'react';
import { PersonalInformationForm } from '@/components/organisms/Form';
import { StepComponentProps } from '../types';

export function PersonalInformationStep({ formData, onChange, errors }: StepComponentProps) {

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600 dark:text-gray-400">Section 1: Personal Information</h3>
        <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
          Enter the resident's basic personal details, birth information, and educational/employment background.
        </p>
      </div>

      {/* Use the comprehensive PersonalInformation form component */}
      <PersonalInformationForm
        formData={formData}
        onChange={onChange}
        errors={errors}
      />
    </div>
  );
}
