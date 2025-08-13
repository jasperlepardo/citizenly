/**
 * Personal Information Section for Resident Forms
 * Handles basic personal details like name, birthdate, sex, civil status
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';
import {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
} from '@/lib/constants/resident-enums';

interface PersonalInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(field: K, value: ResidentEditFormData[K]) => void;
  disabled?: boolean;
}

/**
 * Personal Information Form Section
 * 
 * @description Renders personal information fields including name, birthdate, sex, and civil status
 * @param props - Component props
 * @returns JSX element for personal information section
 * 
 * @example
 * ```typescript
 * <PersonalInfoSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function PersonalInfoSection({
  formData,
  errors,
  updateField,
  disabled = false
}: PersonalInfoSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof ResidentEditFormData, value);
  };

  return (
    <FormSection 
      title="Personal Information" 
      description="Basic personal details"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="First Name" required errorMessage={errors.first_name}>
          <FormInput
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.first_name}
            required
            placeholder="Enter first name"
          />
        </FormField>
        
        <FormField label="Middle Name" errorMessage={errors.middle_name}>
          <FormInput
            name="middle_name"
            value={formData.middle_name || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.middle_name}
            placeholder="Enter middle name (optional)"
          />
        </FormField>
        
        <FormField label="Last Name" required errorMessage={errors.last_name}>
          <FormInput
            name="last_name"
            value={formData.last_name || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.last_name}
            required
            placeholder="Enter last name"
          />
        </FormField>
        
        <FormField label="Extension Name" errorMessage={errors.extension_name}>
          <FormInput
            name="extension_name"
            value={formData.extension_name || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.extension_name}
            placeholder="Jr., Sr., III, etc."
          />
        </FormField>
        
        <FormField label="Date of Birth" required errorMessage={errors.birthdate}>
          <FormInput
            type="date"
            name="birthdate"
            value={formData.birthdate || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.birthdate}
            required
          />
        </FormField>
        
        <FormField label="Sex" required errorMessage={errors.sex}>
          <select
            name="sex"
            value={formData.sex || ''}
            onChange={handleInputChange}
            disabled={disabled}
            required
            className="w-full min-h-10 px-3 py-2 border border-default rounded-md bg-surface text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Sex</option>
            {SEX_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Civil Status" required errorMessage={errors.civil_status}>
          <select
            name="civil_status"
            value={formData.civil_status || ''}
            onChange={handleInputChange}
            disabled={disabled}
            required
            className="w-full min-h-10 px-3 py-2 border border-default rounded-md bg-surface text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Civil Status</option>
            {CIVIL_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Citizenship" errorMessage={errors.citizenship}>
          <select
            name="citizenship"
            value={formData.citizenship || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full min-h-10 px-3 py-2 border border-default rounded-md bg-surface text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Citizenship</option>
            {CITIZENSHIP_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Conditional field for other civil status */}
      {formData.civil_status === 'others' && (
        <div className="mt-4">
          <FormField label="Please Specify Civil Status" errorMessage={errors.civil_status_others_specify}>
            <FormInput
              name="civil_status_others_specify"
              value={formData.civil_status_others_specify || ''}
              onChange={handleInputChange}
              disabled={disabled}
              error={errors.civil_status_others_specify}
              placeholder="Please specify"
            />
          </FormField>
        </div>
      )}
    </FormSection>
  );
}