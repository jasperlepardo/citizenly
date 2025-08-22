/**
 * Sectoral Information Section for Resident Forms
 * Handles sectoral classifications and group memberships
 */

import React from 'react';
import { FormSection } from '@/components/molecules';
import { ResidentEditFormData } from '@/lib/validation/resident-schema';

interface SectoralInfoSectionProps {
  formData: Partial<ResidentEditFormData>;
  errors: Record<string, string>;
  updateField: <K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => void;
  disabled?: boolean;
}

/**
 * Sectoral Information Form Section
 *
 * @description Renders sectoral classification fields
 * @param props - Component props
 * @returns JSX element for sectoral information section
 *
 * @example
 * ```typescript
 * <SectoralInfoSection
 *   formData={formData}
 *   errors={errors}
 *   updateField={updateField}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export default function SectoralInfoSection({
  formData,
  errors,
  updateField,
  disabled = false,
}: SectoralInfoSectionProps) {
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
      title="Section 4: Sectoral Information"
      description="Sectoral classifications and group memberships"
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please indicate if the resident belongs to any of the following sectoral groups. Most classifications are automatically determined based on age, employment status, and education data.
        </p>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Labor Force / Employed */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_labor_force"
              name="is_labor_force"
              checked={(formData as any).is_labor_force || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_labor_force" className="text-gray-600 dark:text-gray-400">
              Labor Force / Employed
            </label>
          </div>

          {/* Unemployed */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_unemployed"
              name="is_unemployed"
              checked={(formData as any).is_unemployed || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_unemployed" className="text-gray-600 dark:text-gray-400">
              Unemployed
            </label>
          </div>

          {/* Overseas Filipino Worker */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_overseas_filipino_worker"
              name="is_overseas_filipino_worker"
              checked={(formData as any).is_overseas_filipino_worker || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_overseas_filipino_worker" className="text-gray-600 dark:text-gray-400">
              Overseas Filipino Worker
            </label>
          </div>

          {/* Persons with Disability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_person_with_disability"
              name="is_person_with_disability"
              checked={(formData as any).is_person_with_disability || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_person_with_disability" className="text-gray-600 dark:text-gray-400">
              Persons with Disability
            </label>
          </div>

          {/* Out of School Children */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_out_of_school_children"
              name="is_out_of_school_children"
              checked={(formData as any).is_out_of_school_children || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_out_of_school_children" className="text-gray-600 dark:text-gray-400">
              Out of School Children
            </label>
          </div>

          {/* Out of School Youth */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_out_of_school_youth"
              name="is_out_of_school_youth"
              checked={(formData as any).is_out_of_school_youth || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_out_of_school_youth" className="text-gray-600 dark:text-gray-400">
              Out of School Youth
            </label>
          </div>

          {/* Senior Citizen */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_senior_citizen"
              name="is_senior_citizen"
              checked={(formData as any).is_senior_citizen || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_senior_citizen" className="text-gray-600 dark:text-gray-400">
              Senior Citizen
            </label>
          </div>

          {/* Solo Parent */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_solo_parent"
              name="is_solo_parent"
              checked={(formData as any).is_solo_parent || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_solo_parent" className="text-gray-600 dark:text-gray-400">
              Solo Parent
            </label>
          </div>

          {/* Indigenous People */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_indigenous_people"
              name="is_indigenous_people"
              checked={(formData as any).is_indigenous_people || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_indigenous_people" className="text-gray-600 dark:text-gray-400">
              Indigenous People
            </label>
          </div>

          {/* Migrant */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_migrant"
              name="is_migrant"
              checked={(formData as any).is_migrant || false}
              onChange={handleInputChange}
              disabled={disabled}
              className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label htmlFor="is_migrant" className="text-gray-600 dark:text-gray-400">
              Migrant
            </label>
          </div>
        </div>

        {/* Registered Senior Citizen - conditional */}
        {(formData as any).is_senior_citizen && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_registered_senior_citizen"
                name="is_registered_senior_citizen"
                checked={(formData as any).is_registered_senior_citizen || false}
                onChange={handleInputChange}
                disabled={disabled}
                className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-gray-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <label htmlFor="is_registered_senior_citizen" className="text-gray-600 dark:text-gray-400">
                Please specify if registered SC: Y/N
              </label>
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
}
