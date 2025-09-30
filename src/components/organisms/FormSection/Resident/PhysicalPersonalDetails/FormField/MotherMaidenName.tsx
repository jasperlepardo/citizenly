import React from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import type { FormMode } from '@/types/app/ui/forms';
import type { MotherMaidenNameFormData } from '@/types/domain/residents/forms';

export interface MotherMaidenNameProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: MotherMaidenNameFormData;
  onChange: (value: MotherMaidenNameFormData) => void;
  errors: Record<string, string>;
  className?: string;
  // Individual field loading states
  loadingStates?: {
    mother_maiden_first?: boolean;
    mother_maiden_middle?: boolean;
    mother_maiden_last?: boolean;
  };
}

export function MotherMaidenName({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
  loadingStates = {},
}: Readonly<MotherMaidenNameProps>) {
  const handleChange = (field: keyof MotherMaidenNameFormData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Helper function to format full maiden name
  const formatFullMaidenName = () => {
    const parts = [
      value.mother_maiden_first_name?.trim(),
      value.mother_maiden_middle_name?.trim(),
      value.mother_maiden_last_name?.trim(),
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '—';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Mother's Maiden Name
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Complete maiden name of mother for identification purposes.
        </p>
      </div>

      <div className={mode === 'view' ? 'space-y-4' : 'grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4'}>
        {mode === 'view' ? (
          <InputField
            label="Mother's Full Maiden Name"
            labelSize="sm"
            orientation="horizontal"
            mode={mode}
            loading={loadingStates?.mother_maiden_first || loadingStates?.mother_maiden_middle || loadingStates?.mother_maiden_last}
            inputProps={{
              value: formatFullMaidenName(),
              readOnly: true,
            }}
          />
        ) : (
          <>
            <InputField
              label="First Name"
              labelSize="sm"
              errorMessage={errors.mother_maiden_first}
              mode={mode}
              loading={loadingStates?.mother_maiden_first}
              inputProps={{
                value: value.mother_maiden_first_name || '',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('mother_maiden_first_name', e.target.value),
                placeholder: "Mother's maiden first name",
                error: errors.mother_maiden_first,
              }}
            />

            <InputField
              label="Middle Name"
              labelSize="sm"
              errorMessage={errors.mother_maiden_middle}
              mode={mode}
              loading={loadingStates?.mother_maiden_middle}
              inputProps={{
                value: value.mother_maiden_middle_name || '',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('mother_maiden_middle_name', e.target.value),
                placeholder: "Mother's maiden middle name",
                error: errors.mother_maiden_middle,
              }}
            />

            <InputField
              label="Last Name"
              labelSize="sm"
              errorMessage={errors.mother_maiden_last}
              mode={mode}
              loading={loadingStates?.mother_maiden_last}
              inputProps={{
                value: value.mother_maiden_last_name || '',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('mother_maiden_last_name', e.target.value),
                placeholder: "Mother's maiden last name",
                error: errors.mother_maiden_last,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default MotherMaidenName;
