import React from 'react';

import { InputField } from '@/components';
import type { FormMode } from '@/types';

export interface PhilSysCardFieldProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  loading?: boolean;
}

export function PhilSysCardField({
  mode = 'create',
  value,
  onChange,
  error,
  required = false,
  className = '',
  loading = false,
}: Readonly<PhilSysCardFieldProps>) {
  return (
    <div className={className}>
      <InputField
        mode={mode}
        label="PhilSys Card Number"
        required={required}
        labelSize="sm"
        orientation={mode === 'view' ? 'horizontal' : 'vertical'}
        errorMessage={error}
        loading={loading}
        inputProps={{
          value: value,
          onChange: e => onChange(e.target.value),
          placeholder: 'XXXX-XXXX-XXXX',
          error: error,
        }}
      />
    </div>
  );
}

export default PhilSysCardField;
