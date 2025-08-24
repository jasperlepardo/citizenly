import React from 'react';
import type { FormMode } from '@/types/forms';
import { InputField } from '@/components/molecules';

export interface MotherMaidenNameData {
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;
}

export interface MotherMaidenNameProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: MotherMaidenNameData;
  onChange: (value: MotherMaidenNameData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function MotherMaidenName({ 
  mode = 'create',
  value, 
  onChange, 
  errors,
  className = '' 
}: MotherMaidenNameProps) {
  
  const handleChange = (field: keyof MotherMaidenNameData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Helper function to format full maiden name
  const formatFullMaidenName = () => {
    const parts = [
      value.motherMaidenFirstName?.trim(),
      value.motherMaidenMiddleName?.trim(), 
      value.motherMaidenLastName?.trim()
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '—';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Mother's Maiden Name</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Complete maiden name of mother for identification purposes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {mode === 'view' ? (
          <div className="col-span-full">
            <InputField
              label="Mother's Full Maiden Name"
              labelSize="sm"
              mode={mode}
              inputProps={{
                value: formatFullMaidenName(),
                readOnly: true
              }}
            />
          </div>
        ) : (
          <>
            <InputField
              label="First Name"
              labelSize="sm"
              errorMessage={errors.motherMaidenFirstName}
              mode={mode}
              inputProps={{
                value: value.motherMaidenFirstName,
                onChange: (e) => handleChange('motherMaidenFirstName', e.target.value),
                placeholder: "Mother's maiden first name",
                error: errors.motherMaidenFirstName
              }}
            />
            
            <InputField
              label="Middle Name"
              labelSize="sm"
              errorMessage={errors.motherMaidenMiddleName}
              mode={mode}
              inputProps={{
                value: value.motherMaidenMiddleName,
                onChange: (e) => handleChange('motherMaidenMiddleName', e.target.value),
                placeholder: "Mother's maiden middle name",
                error: errors.motherMaidenMiddleName
              }}
            />
            
            <InputField
              label="Last Name"
              labelSize="sm"
              errorMessage={errors.motherMaidenLastName}
              mode={mode}
              inputProps={{
                value: value.motherMaidenLastName,
                onChange: (e) => handleChange('motherMaidenLastName', e.target.value),
                placeholder: "Mother's maiden last name",
                error: errors.motherMaidenLastName
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default MotherMaidenName;