/**
 * Mother's Maiden Name Section for Resident Forms
 * Handles mother's maiden name details for identification purposes
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';

interface MotherMaidenNameSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

/**
 * Mother's Maiden Name Form Section
 *
 * @description Renders mother's maiden name fields for identification purposes
 * @param props - Component props
 * @returns JSX element for mother's maiden name section
 *
 * @example
 * ```typescript
 * <MotherMaidenNameSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function MotherMaidenNameSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: MotherMaidenNameSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  return (
    <FormSection
      title="Mother&rsquo;s Maiden Name"
      description="Mother&rsquo;s full maiden name for identification purposes"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          label="Mother&rsquo;s Maiden First Name"
          errorMessage={errors.mother_maiden_first}
        >
          <FormInput
            name="mother_maiden_first"
            value={formData.mother_maiden_first || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.mother_maiden_first}
            placeholder="First name"
          />
        </FormField>

        <FormField
          label="Mother&rsquo;s Maiden Middle Name"
          errorMessage={errors.mother_maiden_middle}
        >
          <FormInput
            name="mother_maiden_middle"
            value={formData.mother_maiden_middle || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.mother_maiden_middle}
            placeholder="Middle name (optional)"
          />
        </FormField>

        <FormField label="Mother&rsquo;s Maiden Last Name" errorMessage={errors.mother_maiden_last}>
          <FormInput
            name="mother_maiden_last"
            value={formData.mother_maiden_last || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.mother_maiden_last}
            placeholder="Last name"
          />
        </FormField>
      </div>
    </FormSection>
  );
}
