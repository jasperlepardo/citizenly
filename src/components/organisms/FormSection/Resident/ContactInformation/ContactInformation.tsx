import React, { useCallback } from 'react';


import type { FormMode } from '@/types/app/ui/forms';
import type {
  ContactDetailsFormData,
  HouseholdInformationFormData,
} from '@/types/domain/residents/forms';

import { ContactDetails } from './FormField/ContactDetails';
import { HouseholdInformation } from './FormField/HouseholdInformation';


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
  // Individual field loading states
  loadingStates?: {
    email?: boolean;
    telephone_number?: boolean;
    mobile_number?: boolean;
    household_code?: boolean;
    household_name?: boolean;
  };
}

export function ContactInformationForm({
  mode = 'create',
  formData,
  onChange,
  errors,
  onHouseholdSearch,
  householdOptions = [],
  householdLoading = false,
  loadingStates = {},
}: Readonly<ContactInformationFormProps>) {
  // Map form data to ContactDetails component props
  const contactDetailsValue: ContactDetailsFormData = {
    email: formData.email ?? '',
    telephone_number: formData.telephone_number ?? '',
    mobile_number: formData.mobile_number ?? '',
  };

  // Map form data to HouseholdInformation component props
  const householdInfoValue: HouseholdInformationFormData = {
    household_code: formData.household_code || '',
    household_name: formData.household_name || '',
  };

  // Handle changes from ContactDetails component
  const handleContactDetailsChange = useCallback(
    (value: ContactDetailsFormData) => {
      // Only update the fields that actually changed
      // Compare with current formData to determine what changed
      Object.entries(value).forEach(([field, fieldValue]) => {
        const currentValue = formData[field as keyof typeof formData];
        if (currentValue !== fieldValue) {
          onChange(field as string, fieldValue);
        }
      });
    },
    [onChange, formData]
  );

  // Handle changes from HouseholdInformation component
  const handleHouseholdInfoChange = useCallback(
    (value: HouseholdInformationFormData) => {
      // Call onChange with a special marker to indicate this is a household batch update
      onChange('__household_batch__', value as any);
    },
    [onChange]
  );

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
            loadingStates={{
              email: loadingStates?.email,
              telephone_number: loadingStates?.telephone_number,
              mobile_number: loadingStates?.mobile_number,
            }}
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
            loadingStates={{
              household_code: loadingStates?.household_code,
              household_name: loadingStates?.household_name,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ContactInformationForm;
