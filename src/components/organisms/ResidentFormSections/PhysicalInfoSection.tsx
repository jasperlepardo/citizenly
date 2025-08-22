/**
 * Physical Information Section for Resident Forms
 * Handles physical characteristics like height, weight, blood type, complexion
 */

import React from 'react';
import { FieldSet, FormSection } from '@/components/molecules';
import { Input } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';
import { BLOOD_TYPE_OPTIONS, RELIGION_OPTIONS, ETHNICITY_OPTIONS, CITIZENSHIP_OPTIONS } from '@/lib/constants/resident-enums';

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

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateField(name as keyof ResidentEditFormData, checked as any);
    } else if (type === 'number') {
      updateField(name as keyof ResidentEditFormData, value ? Number(value) : (undefined as any));
    } else {
      updateField(name as keyof ResidentEditFormData, value);
    }
  };

  return (
    <FormSection
      title="Section 3: Physical & Personal Details"
      description="Physical characteristics, voting information, and personal details"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Physical Characteristics */}
        <FieldSet label="Blood Type" errorMessage={errors.blood_type}>
          <select
            name="blood_type"
            value={formData.blood_type || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-white dark:bg-gray-800 min-h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Blood Type</option>
            {BLOOD_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldSet>

        <FieldSet label="Complexion" errorMessage={errors.complexion}>
          <Input
            name="complexion"
            value={formData.complexion || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.complexion}
            placeholder="e.g., Fair, Medium, Dark"
          />
        </FieldSet>

        <FieldSet
          label="Height (cm)"
          errorMessage={errors.height}
          helperText="Height in centimeters"
        >
          <Input
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
        </FieldSet>

        <FieldSet
          label="Weight (kg)"
          errorMessage={errors.weight}
          helperText="Weight in kilograms"
        >
          <Input
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
        </FieldSet>

        {/* Identity Information */}
        <FieldSet label="Citizenship" errorMessage={errors.citizenship}>
          <select
            name="citizenship"
            value={formData.citizenship || 'filipino'}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-white dark:bg-gray-800 min-h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            {CITIZENSHIP_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldSet>

        <FieldSet label="Ethnicity" errorMessage={errors.ethnicity}>
          <select
            name="ethnicity"
            value={formData.ethnicity || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-white dark:bg-gray-800 min-h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Ethnicity</option>
            {ETHNICITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldSet>

        <FieldSet label="Religion" errorMessage={errors.religion}>
          <select
            name="religion"
            value={formData.religion || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="bg-white dark:bg-gray-800 min-h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Religion</option>
            {RELIGION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldSet>
      </div>

      {/* Religion Others Specify */}
      {formData.religion === 'others' && (
        <div className="mt-4">
          <FieldSet label="Please Specify Religion" errorMessage={errors.religion_others_specify}>
            <Input
              name="religion_others_specify"
              value={formData.religion_others_specify || ''}
              onChange={handleInputChange}
              disabled={disabled}
              error={errors.religion_others_specify}
              placeholder="Please specify"
            />
          </FieldSet>
        </div>
      )}

      {/* Voting Information */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Voting Information</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_voter"
              name="is_voter"
              checked={formData.is_voter || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_voter" className="text-gray-600 dark:text-gray-400">
              Is Voter
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_resident_voter"
              name="is_resident_voter"
              checked={formData.is_resident_voter || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_resident_voter" className="text-gray-600 dark:text-gray-400">
              Resident Voter (Y/N)
            </label>
          </div>
        </div>

        {/* Show last voted year if they are a registered voter */}
        {formData.is_voter && (
          <div className="mt-4">
            <FieldSet
              label="Last Voted Year"
              errorMessage={errors.last_voted_date}
              helperText="Year of last participation in an election"
            >
              <Input
                type="number"
                name="last_voted_date"
                value={formData.last_voted_date || ''}
                onChange={handleInputChange}
                disabled={disabled}
                error={errors.last_voted_date}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="2024"
              />
            </FieldSet>
          </div>
        )}
      </div>

      {/* Mother's Maiden Name */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Mother's Maiden Name</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FieldSet
            label="First Name"
            errorMessage={errors.mother_maiden_first}
          >
            <Input
              name="mother_maiden_first"
              value={formData.mother_maiden_first || ''}
              onChange={handleInputChange}
              disabled={disabled}
              error={errors.mother_maiden_first}
              placeholder="First name"
            />
          </FieldSet>

          <FieldSet
            label="Middle Name"
            errorMessage={errors.mother_maiden_middle}
          >
            <Input
              name="mother_maiden_middle"
              value={formData.mother_maiden_middle || ''}
              onChange={handleInputChange}
              disabled={disabled}
              error={errors.mother_maiden_middle}
              placeholder="Middle name (optional)"
            />
          </FieldSet>

          <FieldSet label="Last Name" errorMessage={errors.mother_maiden_last}>
            <Input
              name="mother_maiden_last"
              value={formData.mother_maiden_last || ''}
              onChange={handleInputChange}
              disabled={disabled}
              error={errors.mother_maiden_last}
              placeholder="Last name"
            />
          </FieldSet>
        </div>
      </div>
    </FormSection>
  );
}
