/**
 * Education & Employment Section for Resident Forms
 * Handles education and employment details
 */

import React from 'react';
import { FormField, FormSection } from '@/components/molecules';
import { FormInput } from '@/components/atoms';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';
import {
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
} from '@/lib/constants/resident-enums';

interface EducationEmploymentSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(field: K, value: ResidentEditFormData[K]) => void;
  disabled?: boolean;
}

/**
 * Education & Employment Form Section
 * 
 * @description Renders education and employment fields
 * @param props - Component props
 * @returns JSX element for education and employment section
 * 
 * @example
 * ```typescript
 * <EducationEmploymentSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function EducationEmploymentSection({
  formData,
  errors,
  updateField,
  disabled = false
}: EducationEmploymentSectionProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateField(name as keyof ResidentEditFormData, checked as any);
    } else if (type === 'number') {
      updateField(name as keyof ResidentEditFormData, value ? Number(value) : undefined as any);
    } else {
      updateField(name as keyof ResidentEditFormData, value);
    }
  };

  return (
    <FormSection 
      title="Education & Employment" 
      description="Educational background and current employment status"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Education Attainment" errorMessage={errors.education_attainment}>
          <select
            name="education_attainment"
            value={formData.education_attainment || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full min-h-10 px-3 py-2 border border-default rounded-md bg-surface text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Education Level</option>
            {EDUCATION_LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Employment Status" errorMessage={errors.employment_status}>
          <select
            name="employment_status"
            value={formData.employment_status || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full min-h-10 px-3 py-2 border border-default rounded-md bg-surface text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
          >
            <option value="">Select Employment Status</option>
            {EMPLOYMENT_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Occupation Title" errorMessage={errors.occupation_title}>
          <FormInput
            name="occupation_title"
            value={formData.occupation_title || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.occupation_title}
            placeholder="e.g., Teacher, Engineer, etc."
          />
        </FormField>
        
        <FormField label="Employment Code" errorMessage={errors.employment_code}>
          <FormInput
            name="employment_code"
            value={formData.employment_code || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.employment_code}
            placeholder="Official employment code"
          />
        </FormField>
        
        <FormField label="Employment Name" errorMessage={errors.employment_name}>
          <FormInput
            name="employment_name"
            value={formData.employment_name || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.employment_name}
            placeholder="Full employment name/title"
          />
        </FormField>
        
        <FormField label="PSOC Code" errorMessage={errors.psoc_code}>
          <FormInput
            name="psoc_code"
            value={formData.psoc_code || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.psoc_code}
            placeholder="Philippine Standard Occupational Classification"
          />
        </FormField>
        
        <FormField label="PSOC Level" errorMessage={errors.psoc_level}>
          <FormInput
            type="number"
            name="psoc_level"
            value={formData.psoc_level || ''}
            onChange={handleInputChange}
            disabled={disabled}
            error={errors.psoc_level}
            min="1"
            max="9"
            placeholder="1-9"
          />
        </FormField>
      </div>

      {/* Education Graduate Status */}
      <div className="mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_graduate"
            name="is_graduate"
            checked={formData.is_graduate || false}
            onChange={handleInputChange}
            disabled={disabled}
            className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="is_graduate" className="text-primary">
            Graduate of current education level
          </label>
        </div>
      </div>
    </FormSection>
  );
}