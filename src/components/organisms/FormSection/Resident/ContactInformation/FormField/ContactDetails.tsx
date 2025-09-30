import React, { useCallback } from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { createFieldChangeHandler } from '@/services/app/forms/formHandlers';
import type { FormMode } from '@/types/app/ui/forms';
import type { ContactDetailsFormData } from '@/types/domain/residents/forms';

export interface ContactDetailsProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: ContactDetailsFormData;
  onChange: (value: ContactDetailsFormData) => void;
  errors: Record<string, string>;
  className?: string;
  // Loading states
  loading?: boolean;
  loadingStates?: {
    email?: boolean;
    telephone_number?: boolean;
    mobile_number?: boolean;
  };
}

export function ContactDetails({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
  loading = false,
  loadingStates = {},
}: ContactDetailsProps) {
  // Use consolidated component field handler - eliminates 8 lines of duplicate code
  const handleChange = useCallback(
    createFieldChangeHandler<ContactDetailsFormData>(value, onChange),
    [value, onChange]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Contact Details</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Email and phone contact information.
        </p>
      </div>

      <div className={mode === 'view' ? 'space-y-4' : 'grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4'}>
        <InputField
          label="Email Address"
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.email}
          mode={mode}
          loading={loading || loadingStates?.email}
          inputProps={{
            name: 'email',
            type: 'email',
            value: value.email || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value),
            placeholder: 'Enter email address',
            error: errors.email,
          }}
        />

        <InputField
          label="Phone Number"
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.telephone_number}
          mode={mode}
          loading={loading || loadingStates?.telephone_number}
          inputProps={{
            name: 'telephone_number',
            type: 'tel',
            value: value.telephone_number || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('telephone_number', e.target.value),
            placeholder: 'Enter phone number',
            error: errors.telephone_number,
          }}
        />

        <InputField
          label="Mobile Number"
          labelSize="sm"
          orientation={mode === 'view' ? 'horizontal' : 'vertical'}
          errorMessage={errors.mobile_number}
          mode={mode}
          loading={loading || loadingStates?.mobile_number}
          inputProps={{
            name: 'mobile_number',
            type: 'tel',
            value: value.mobile_number || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('mobile_number', e.target.value),
            placeholder: 'Enter mobile number',
            error: errors.mobile_number,
          }}
        />
      </div>
    </div>
  );
}

export default ContactDetails;
