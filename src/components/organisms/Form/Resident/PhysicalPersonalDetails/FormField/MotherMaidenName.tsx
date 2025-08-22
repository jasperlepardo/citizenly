import React from 'react';
import { InputField } from '@/components/molecules';

export interface MotherMaidenNameData {
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;
}

export interface MotherMaidenNameProps {
  value: MotherMaidenNameData;
  onChange: (value: MotherMaidenNameData) => void;
  errors: Record<string, string>;
  className?: string;
}

export function MotherMaidenName({ 
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Mother's Maiden Name</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Complete maiden name of mother for identification purposes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        <InputField
          label="First Name"
          labelSize="sm"
          errorMessage={errors.motherMaidenFirstName}
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
          inputProps={{
            value: value.motherMaidenLastName,
            onChange: (e) => handleChange('motherMaidenLastName', e.target.value),
            placeholder: "Mother's maiden last name",
            error: errors.motherMaidenLastName
          }}
        />
      </div>
    </div>
  );
}

export default MotherMaidenName;