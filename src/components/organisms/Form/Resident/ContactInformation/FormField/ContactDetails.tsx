import React from 'react';
import type { FormMode } from '@/types';
import { InputField } from '@/components';

export interface ContactDetailsData {
  email: string;
  telephone_number: string;
  mobile_number: string;
}

export interface ContactDetailsProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: ContactDetailsData;
  onChange: (value: ContactDetailsData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function ContactDetails({ 
  mode = 'create',
  value, 
  onChange, 
  errors,
  className = '' 
}: ContactDetailsProps) {
  
  const handleChange = (field: keyof ContactDetailsData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Contact Details</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Email and phone contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <InputField
          label="Email Address"
          labelSize="sm"
          errorMessage={errors.email}
          mode={mode}
          inputProps={{
            type: "email",
            value: value.email,
            onChange: (e) => handleChange('email', e.target.value),
            placeholder: "Enter email address",
            error: errors.email
          }}
        />
        
        <InputField
          label="Phone Number"
          labelSize="sm"
          errorMessage={errors.telephone_number}
          mode={mode}
          inputProps={{
            type: "tel",
            value: value.telephone_number,
            onChange: (e) => handleChange('telephone_number', e.target.value),
            placeholder: "Enter phone number",
            error: errors.telephone_number
          }}
        />
        
        <InputField
          label="Mobile Number"
          labelSize="sm"
          errorMessage={errors.mobile_number}
          mode={mode}
          inputProps={{
            type: "tel",
            value: value.mobile_number,
            onChange: (e) => handleChange('mobile_number', e.target.value),
            placeholder: "Enter mobile number",
            error: errors.mobile_number
          }}
        />
      </div>
    </div>
  );
}

export default ContactDetails;