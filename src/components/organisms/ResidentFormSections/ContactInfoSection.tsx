/**
 * Contact Information Section for Resident Forms
 * Handles contact details like phone, email, and PhilSys number
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';

interface ContactInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(field: K, value: ResidentEditFormData[K]) => void;
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
  disabled = false
}: ContactInfoSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  return (
    <FormSection 
      title="Contact Information" 
      description="Communication and identification details"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="Mobile Number" 
          errorMessage={errors.mobile_number}
          helperText="Format: 09XX XXX XXXX"
        >
          <FormInput
            type="tel"
            name="mobile_number"
            value={formData.mobile_number || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.mobile_number}
            placeholder="09XX XXX XXXX"
            maxLength={11}
          />
        </FormField>
        
        <FormField label="Email Address" errorMessage={errors.email}>
          <FormInput
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.email}
            placeholder="example@email.com"
          />
        </FormField>
        
        <FormField label="Telephone Number" errorMessage={errors.telephone_number}>
          <FormInput
            type="tel"
            name="telephone_number"
            value={formData.telephone_number || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.telephone_number}
            placeholder="(02) 123-4567"
          />
        </FormField>
        
        <FormField 
          label="PhilSys Card Number" 
          errorMessage={errors.philsys_card_number}
          helperText="Format: XXXX-XXXX-XXXX-XXXX"
        >
          <FormInput
            name="philsys_card_number"
            value={formData.philsys_card_number || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.philsys_card_number}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            maxLength={19}
          />
        </FormField>
      </div>
    </FormSection>
  );
}