/**
 * Birth Place Information Section for Resident Forms
 * Handles birth place details including location name and code
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';

interface BirthPlaceSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

const BIRTH_PLACE_LEVEL_OPTIONS = [
  { value: 'region', label: 'Region' },
  { value: 'province', label: 'Province' },
  { value: 'city_municipality', label: 'City/Municipality' },
  { value: 'barangay', label: 'Barangay' },
];

/**
 * Birth Place Information Form Section
 *
 * @description Renders birth place information fields including name, code, and level
 * @param props - Component props
 * @returns JSX element for birth place information section
 *
 * @example
 * ```typescript
 * <BirthPlaceSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function BirthPlaceSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: BirthPlaceSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  return (
    <FormSection title="Birth Place Information" description="Location where the resident was born">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Birth Place Name"
          errorMessage={errors.birth_place_name}
          helperText="Full name of the place of birth"
        >
          <FormInput
            name="birth_place_name"
            value={formData.birth_place_name || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.birth_place_name}
            placeholder="e.g., Manila, Metro Manila"
          />
        </FormField>

        <FormField
          label="Birth Place Code"
          errorMessage={errors.birth_place_code}
          helperText="Official PSGC code if known"
        >
          <FormInput
            name="birth_place_code"
            value={formData.birth_place_code || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.birth_place_code}
            placeholder="e.g., 137404000"
          />
        </FormField>

        <FormField
          label="Birth Place Level"
          errorMessage={errors.birth_place_level}
          helperText="Administrative level of the place"
        >
          <select
            name="birth_place_level"
            value={formData.birth_place_level || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-surface border-default text-primary min-h-10 w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Level</option>
            {BIRTH_PLACE_LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </FormSection>
  );
}
