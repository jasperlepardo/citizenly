import React from 'react';

import type { FormMode } from '@/types';

import { ContactDetails, ContactDetailsData } from './FormField/ContactDetails';
import { HouseholdInformation, HouseholdInformationData } from './FormField/HouseholdInformation';

export interface ContactInformationFormProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  formData: {
    email?: string;
    telephone_number?: string;
    mobile_number?: string;
    household_code?: string;
    household_name?: string;
  };
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
  // Household search functionality
  onHouseholdSearch?: (query: string) => Promise<any>;
  householdOptions?: any[];
  householdLoading?: boolean;
}

export function ContactInformationForm({
  mode = 'create',
  formData,
  onChange,
  errors,
  onHouseholdSearch,
  householdOptions = [],
  householdLoading = false,
}: ContactInformationFormProps) {
  // Map form data to ContactDetails component props
  const contactDetailsValue: ContactDetailsData = {
    email: formData.email || '',
    telephone_number: formData.telephone_number || '',
    mobile_number: formData.mobile_number || '',
  };

  // Map form data to HouseholdInformation component props
  const householdInfoValue: HouseholdInformationData = {
    household_code: formData.household_code || '',
    household_name: formData.household_name || '',
  };

  // Handle changes from ContactDetails component
  const handleContactDetailsChange = (value: ContactDetailsData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  // Handle changes from HouseholdInformation component
  const handleHouseholdInfoChange = (value: HouseholdInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-xs dark:border-gray-600 dark:bg-gray-800">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Contact Information
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Contact details and household assignment information.
          </p>
        </div>

        <div className="space-y-8">
          {/* Contact Details */}
          <ContactDetails
            value={contactDetailsValue}
            onChange={handleContactDetailsChange}
            errors={errors}
            mode={mode}
          />

          {/* Household Information */}
          <HouseholdInformation
            value={householdInfoValue}
            onChange={handleHouseholdInfoChange}
            errors={errors}
            onHouseholdSearch={onHouseholdSearch}
            householdOptions={householdOptions}
            householdLoading={householdLoading}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
}

export default ContactInformationForm;
