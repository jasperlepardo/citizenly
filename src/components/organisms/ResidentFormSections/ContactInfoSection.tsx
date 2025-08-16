/**
 * Contact Information Section for Resident Forms
 * Handles contact details like phone, email, and PhilSys number
 */

import React from 'react';
import { FieldSet, FormSection } from '@/components/molecules';
import { Input } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';

interface ContactInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

/**
 * Contact Information Form Section
 *
 * @description Renders contact information fields including mobile, email, telephone, and PhilSys
 * @param props - Component props
 * @returns JSX element for contact information section
 *
 * @example
 * ```typescript
 * <ContactInfoSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function ContactInfoSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: ContactInfoSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  return (
    <FormSection title="Section 2: Contact Details" description="Contact information and household details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldSet label="Email Address" errorMessage={errors.email}>
          <Input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.email}
            placeholder="example@email.com"
          />
        </FieldSet>

        <FieldSet
          label="Mobile Number"
          errorMessage={errors.mobile_number}
          helperText="Format: 09XX XXX XXXX"
        >
          <Input
            type="tel"
            name="mobile_number"
            value={formData.mobile_number || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.mobile_number}
            placeholder="09XX XXX XXXX"
            maxLength={11}
          />
        </FieldSet>

        <FieldSet label="Telephone Number" errorMessage={errors.telephone_number}>
          <Input
            type="tel"
            name="telephone_number"
            value={formData.telephone_number || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.telephone_number}
            placeholder="(02) 123-4567"
          />
        </FieldSet>

        <FieldSet label="Household Name" errorMessage={errors.household_code}>
          <Input
            name="household_code"
            value={formData.household_code || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.household_code}
            placeholder="Enter household name/code"
          />
        </FieldSet>
      </div>
    </FormSection>
  );
}
