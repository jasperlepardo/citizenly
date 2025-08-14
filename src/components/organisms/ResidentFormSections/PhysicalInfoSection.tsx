/**
 * Physical Information Section for Resident Forms
 * Handles physical characteristics like height, weight, blood type, complexion
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';
import { BLOOD_TYPE_OPTIONS } from '@/lib/constants/resident-enums';

interface PhysicalInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

/**
 * Physical Information Form Section
 *
 * @description Renders physical characteristics fields including height, weight, blood type, and complexion
 * @param props - Component props
 * @returns JSX element for physical information section
 *
 * @example
 * ```typescript
 * <PhysicalInfoSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function PhysicalInfoSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: PhysicalInfoSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      updateField(name as keyof ResidentEditFormData, value ? Number(value) : (undefined as any));
    } else {
      updateField(name as keyof ResidentEditFormData, value);
    }
  };

  return (
    <FormSection
      title="Physical Information"
      description="Physical characteristics and health information"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Blood Type" errorMessage={errors.blood_type}>
          <select
            name="blood_type"
            value={formData.blood_type || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-surface min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Blood Type</option>
            {BLOOD_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Complexion" errorMessage={errors.complexion}>
          <FormInput
            name="complexion"
            value={formData.complexion || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.complexion}
            placeholder="e.g., Fair, Medium, Dark"
          />
        </FormField>

        <FormField
          label="Height (cm)"
          errorMessage={errors.height}
          helperText="Height in centimeters"
        >
          <FormInput
            type="number"
            name="height"
            value={formData.height || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.height}
            min="50"
            max="300"
            step="0.1"
            placeholder="e.g., 170.5"
          />
        </FormField>

        <FormField
          label="Weight (kg)"
          errorMessage={errors.weight}
          helperText="Weight in kilograms"
        >
          <FormInput
            type="number"
            name="weight"
            value={formData.weight || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.weight}
            min="1"
            max="500"
            step="0.1"
            placeholder="e.g., 65.5"
          />
        </FormField>
      </div>
    </FormSection>
  );
}
