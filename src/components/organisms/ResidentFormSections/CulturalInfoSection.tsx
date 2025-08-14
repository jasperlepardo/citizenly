/**
 * Cultural Information Section for Resident Forms
 * Handles cultural details like religion and ethnicity
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';
import { RELIGION_OPTIONS, ETHNICITY_OPTIONS } from '@/lib/constants/resident-enums';

interface CulturalInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

/**
 * Cultural Information Form Section
 *
 * @description Renders cultural information fields including religion and ethnicity
 * @param props - Component props
 * @returns JSX element for cultural information section
 *
 * @example
 * ```typescript
 * <CulturalInfoSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function CulturalInfoSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: CulturalInfoSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  return (
    <FormSection title="Cultural Information" description="Religious and ethnic background">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Religion" errorMessage={errors.religion}>
          <select
            name="religion"
            value={formData.religion || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Religion</option>
            {RELIGION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Ethnicity" errorMessage={errors.ethnicity}>
          <select
            name="ethnicity"
            value={formData.ethnicity || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Ethnicity</option>
            {ETHNICITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Conditional field for other religion */}
      {formData.religion === 'others' && (
        <div className="mt-4">
          <FormField label="Please Specify Religion" errorMessage={errors.religion_others_specify}>
            <FormInput
              name="religion_others_specify"
              value={formData.religion_others_specify || ''}
              onChange={handleInputChange}
              disabled={disabled}
              error={errors.religion_others_specify}
              placeholder="Please specify"
            />
          </FormField>
        </div>
      )}
    </FormSection>
  );
}
