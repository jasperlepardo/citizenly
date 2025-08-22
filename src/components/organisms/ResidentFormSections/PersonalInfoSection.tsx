/**
 * Personal Information Section for Resident Forms
 * Handles basic personal details like name, birthdate, sex, civil status
 */

import React from 'react';
import { InputField, SelectField, FormSection } from '@/components/molecules';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';
import {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
} from '@/lib/constants/resident-enums';

interface PersonalInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
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
  disabled = false,
}: PersonalInfoSectionProps) {
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

  const handleSelectChange = (fieldName: keyof ResidentEditFormData) => (option: any) => {
    updateField(fieldName, option?.value || '');
  };

  return (
    <FormSection title="Section 1: Personal Information" description="Basic personal details, birth information, and educational/employment background">
      {/* PhilSys Card Number */}
      <div className="mb-6">
        <InputField
          label="PhilSys Card Number"
          errorMessage={errors.philsys_card_number}
          inputProps={{
            name: "philsys_card_number",
            value: formData.philsys_card_number || '',
            onChange: handleInputChange,
            disabled: disabled,
            error: errors.philsys_card_number,
            placeholder: "Enter PhilSys Card Number"
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField
          label="First Name"
          required
          errorMessage={errors.first_name}
          inputProps={{
            name: "first_name",
            value: formData.first_name || '',
            onChange: handleInputChange,
            disabled: disabled,
            error: errors.first_name,
            required: true,
            placeholder: "Enter first name"
          }}
        />

        <InputField
          label="Middle Name"
          errorMessage={errors.middle_name}
          inputProps={{
            name: "middle_name",
            value: formData.middle_name || '',
            onChange: handleInputChange,
            disabled: disabled,
            error: errors.middle_name,
            placeholder: "Enter middle name (optional)"
          }}
        />

        <InputField
          label="Last Name"
          required
          errorMessage={errors.last_name}
          inputProps={{
            name: "last_name",
            value: formData.last_name || '',
            onChange: handleInputChange,
            disabled: disabled,
            error: errors.last_name,
            required: true,
            placeholder: "Enter last name"
          }}
        />

        <InputField
          label="Extension Name"
          errorMessage={errors.extension_name}
          inputProps={{
            name: "extension_name",
            value: formData.extension_name || '',
            onChange: handleInputChange,
            disabled: disabled,
            error: errors.extension_name,
            placeholder: "Jr., Sr., III, etc."
          }}
        />

        <InputField
          label="Date of Birth"
          required
          errorMessage={errors.birthdate}
          inputProps={{
            type: "date",
            name: "birthdate",
            value: formData.birthdate || '',
            onChange: handleInputChange,
            disabled: disabled,
            error: errors.birthdate,
            required: true
          }}
        />

        <SelectField
          label="Sex"
          required
          errorMessage={errors.sex}
          selectProps={{
            placeholder: "Select sex...",
            options: SEX_OPTIONS as any,
            value: formData.sex || '',
            disabled: disabled,
            error: errors.sex,
            onSelect: handleSelectChange('sex')
          }}
        />

        <SelectField
          label="Civil Status"
          required
          errorMessage={errors.civil_status}
          selectProps={{
            placeholder: "Select civil status...",
            options: CIVIL_STATUS_OPTIONS as any,
            value: formData.civil_status || '',
            disabled: disabled,
            error: errors.civil_status,
            onSelect: handleSelectChange('civil_status')
          }}
        />

        <SelectField
          label="Citizenship"
          errorMessage={errors.citizenship}
          selectProps={{
            placeholder: "Select citizenship...",
            options: CITIZENSHIP_OPTIONS as any,
            value: formData.citizenship || 'filipino',
            disabled: disabled,
            error: errors.citizenship,
            onSelect: handleSelectChange('citizenship')
          }}
        />

        {/* Education & Employment Fields */}
        <SelectField
          label="Highest Educational Attainment"
          errorMessage={errors.education_attainment}
          selectProps={{
            placeholder: "Select education level...",
            options: EDUCATION_LEVEL_OPTIONS as any,
            value: formData.education_attainment || '',
            disabled: disabled,
            error: errors.education_attainment,
            onSelect: handleSelectChange('education_attainment')
          }}
        />

        <SelectField
          label="Employment Status"
          errorMessage={errors.employment_status}
          selectProps={{
            placeholder: "Select employment status...",
            options: EMPLOYMENT_STATUS_OPTIONS as any,
            value: formData.employment_status || '',
            disabled: disabled,
            error: errors.employment_status,
            onSelect: handleSelectChange('employment_status')
          }}
        />

        <InputField
          label="Occupation Name"
          errorMessage={errors.occupation_title}
          inputProps={{
            name: "occupation_title",
            value: formData.occupation_title || '',
            onChange: handleInputChange,
            disabled: disabled,
            error: errors.occupation_title,
            placeholder: "e.g., Teacher, Engineer, etc."
          }}
        />
      </div>

      {/* Graduate Status */}
      <div className="mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_graduate"
            name="is_graduate"
            checked={formData.is_graduate || false}
            onChange={handleInputChange}
            disabled={disabled}
            className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          />
          <label htmlFor="is_graduate" className="text-gray-600 dark:text-gray-400">
            Graduate (Y/N)
          </label>
        </div>
      </div>

      {/* Conditional field for other civil status */}
      {(formData.civil_status as string) === 'others' && (
        <div className="mt-4">
          <InputField
            label="Please Specify Civil Status"
            errorMessage={errors.civil_status_others_specify}
            inputProps={{
              name: "civil_status_others_specify",
              value: formData.civil_status_others_specify || '',
              onChange: handleInputChange,
              disabled: disabled,
              error: errors.civil_status_others_specify,
              placeholder: "Please specify"
            }}
          />
        </div>
      )}
    </FormSection>
  );
}
