import React from 'react';
import { InputField } from '@/components/molecules';

export interface PhilSysCardFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function PhilSysCardField({ 
  value, 
  onChange, 
  error, 
  required = false,
  className = '' 
}: PhilSysCardFieldProps) {
  return (
    <div className={className}>
      <InputField
        label="PhilSys Card Number"
        required={required}
        labelSize="sm"
        errorMessage={error}
        inputProps={{
          value: value,
          onChange: (e) => onChange(e.target.value),
          placeholder: "XXXX-XXXX-XXXX",
          error: error
        }}
      />
    </div>
  );
}

export default PhilSysCardField;