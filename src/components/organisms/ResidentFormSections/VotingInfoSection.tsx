/**
 * Voting Information Section for Resident Forms
 * Handles voting registration and history details
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';

interface VotingInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

/**
 * Voting Information Form Section
 *
 * @description Renders voting information fields including registration status and voting history
 * @param props - Component props
 * @returns JSX element for voting information section
 *
 * @example
 * ```typescript
 * <VotingInfoSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function VotingInfoSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: VotingInfoSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateField(name as keyof ResidentEditFormData, checked as any);
    } else {
      updateField(name as keyof ResidentEditFormData, value);
    }
  };

  return (
    <FormSection
      title="Voting Information"
      description="Voter registration status and voting history"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_voter"
            name="is_voter"
            checked={formData.is_voter || false}
            onChange={handleInputChange}
            disabled={disabled}
            className="mr-2 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          />
          <label htmlFor="is_voter" className="text-primary">
            Registered Voter
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
            className="mr-2 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          />
          <label htmlFor="is_resident_voter" className="text-primary">
            Resident Voter (votes in this barangay)
          </label>
        </div>
      </div>

      {/* Show last voted date if they are a registered voter */}
      {formData.is_voter && (
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Last Voted Date"
              errorMessage={errors.last_voted_date}
              helperText="Date of last participation in an election"
            >
              <FormInput
                type="date"
                name="last_voted_date"
                value={formData.last_voted_date || ''}
                onChange={handleInputChange}
                disabled={disabled}
                error={errors.last_voted_date}
              />
            </FormField>
          </div>
        </div>
      )}
    </FormSection>
  );
}
