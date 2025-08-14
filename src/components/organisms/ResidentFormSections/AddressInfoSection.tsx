/**
 * Address Information Section for Resident Forms
 * Handles address details including household, street, subdivision, and ZIP code
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';

interface AddressInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

/**
 * Address Information Form Section
 *
 * @description Renders address information fields including household code, street, subdivision, and ZIP
 * @param props - Component props
 * @returns JSX element for address information section
 *
 * @example
 * ```typescript
 * <AddressInfoSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function AddressInfoSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: AddressInfoSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  return (
    <FormSection
      title="Address Information"
      description="Detailed address and location information"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Household Code"
          errorMessage={errors.household_code}
          helperText="The household this resident belongs to"
        >
          <FormInput
            name="household_code"
            value={formData.household_code || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.household_code}
            placeholder="e.g., 042114014-2025-000001"
          />
        </FormField>

        <FormField label="ZIP Code" errorMessage={errors.zip_code} helperText="Postal ZIP code">
          <FormInput
            name="zip_code"
            value={formData.zip_code || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.zip_code}
            placeholder="e.g., 1234"
            maxLength={10}
          />
        </FormField>

        <FormField
          label="Street ID"
          errorMessage={errors.street_id}
          helperText="Internal street identifier (UUID)"
        >
          <FormInput
            name="street_id"
            value={formData.street_id || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.street_id}
            placeholder="Street UUID"
          />
        </FormField>

        <FormField
          label="Subdivision ID"
          errorMessage={errors.subdivision_id}
          helperText="Internal subdivision identifier (UUID)"
        >
          <FormInput
            name="subdivision_id"
            value={formData.subdivision_id || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.subdivision_id}
            placeholder="Subdivision UUID"
          />
        </FormField>
      </div>

      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
          Address Information Note
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Street ID and Subdivision ID are internal system identifiers. The household code links
          this resident to their household record. These fields are typically populated
          automatically by the system but can be manually adjusted if needed.
        </p>
      </div>
    </FormSection>
  );
}
