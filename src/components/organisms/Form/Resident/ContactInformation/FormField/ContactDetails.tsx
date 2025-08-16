import React from 'react';
import { InputField } from '@/components/molecules';

export interface ContactDetailsData {
  email: string;
  phoneNumber: string;
  mobileNumber: string;
}

export interface ContactDetailsProps {
  value: ContactDetailsData;
  onChange: (value: ContactDetailsData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function ContactDetails({ 
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <InputField
          label="Email Address"
          labelSize="sm"
          errorMessage={errors.email}
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
          errorMessage={errors.phoneNumber}
          inputProps={{
            type: "tel",
            value: value.phoneNumber,
            onChange: (e) => handleChange('phoneNumber', e.target.value),
            placeholder: "Enter phone number",
            error: errors.phoneNumber
          }}
        />
        
        <InputField
          label="Mobile Number"
          labelSize="sm"
          errorMessage={errors.mobileNumber}
          inputProps={{
            type: "tel",
            value: value.mobileNumber,
            onChange: (e) => handleChange('mobileNumber', e.target.value),
            placeholder: "Enter mobile number",
            error: errors.mobileNumber
          }}
        />
      </div>
    </div>
  );
}

export default ContactDetails;