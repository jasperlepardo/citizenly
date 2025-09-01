'use client';

import React, { useState, useCallback } from 'react';

import type { HouseholdFormData, FormMode } from '@/types/app/ui/forms';

import { HouseholdDetailsForm } from './HouseholdDetails';

export interface HouseholdFormProps {
  /** Initial form data */
  initialData?: Partial<HouseholdFormData>;
  /** Form mode - determines if fields are editable */
  mode?: FormMode;
  /** Called when form data changes */
  onDataChange?: (data: HouseholdFormData) => void;
  /** Called when form is submitted */
  onSubmit?: (data: HouseholdFormData) => void | Promise<void>;
  /** Validation errors */
  errors?: Record<string, string>;
  /** Loading state */
  isLoading?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Whether to show form actions */
  showActions?: boolean;
}

/**
 * Main Household Form Component
 *
 * Orchestrates all household form sections and manages form state.
 * Currently includes HouseholdDetails section with room for expansion.
 */
export function HouseholdForm({
  initialData = {},
  mode = 'edit',
  onDataChange,
  onSubmit,
  errors = {},
  isLoading = false,
  className = '',
  showActions = true,
}: Readonly<HouseholdFormProps>) {
  // Initialize form data with defaults
  const [formData, setFormData] = useState<HouseholdFormData>({
    // Default values for required fields
    code: '',
    house_number: '',
    street_id: '',
    barangay_code: '',
    city_municipality_code: '',
    region_code: '',
    // Default values for new households
    no_of_families: 1,
    no_of_household_members: 0,
    no_of_migrants: 0,
    // Merge with initial data
    ...initialData,
  });

  // Handle field changes
  const handleFieldChange = useCallback(
    (field: string, value: string | number | boolean | null) => {
      setFormData(prev => {
        const updated = {
          ...prev,
          [field]: value,
        };

        // Notify parent component of changes
        onDataChange?.(updated);

        return updated;
      });
    },
    [onDataChange]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (onSubmit) {
        await onSubmit(formData);
      }
    },
    [formData, onSubmit]
  );

  const isReadOnly = mode === 'view';
  const isCreating = mode === 'create';

  return (
    <form onSubmit={handleSubmit} className={`mx-auto max-w-4xl space-y-6 ${className}`}>
      {/* Form Header */}
      <div className="mb-4 text-center">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isCreating ? 'New Household Registration' : 'Household Information'}
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          {isCreating
            ? 'Register a new household in the barangay system.'
            : 'View and manage household information.'}
        </p>
      </div>

      {/* Household Details Section */}
      <div className="space-y-4">
        <HouseholdDetailsForm
          formData={{
            householdType: formData.household_type || '',
            tenureStatus: formData.tenure_status || '',
            tenureOthersSpecify: formData.tenure_others_specify || '',
            householdUnit: formData.household_unit || '',
            householdName: formData.householdName || '',
            monthlyIncome: formData.monthly_income || 0,
            householdHeadId: formData.household_head_id || '',
            householdHeadPosition: formData.household_head_position || '',
          }}
          onChange={handleFieldChange}
          errors={errors}
          mode={mode}
        />
      </div>

      {/* Future sections can be added here */}
      {/* Example:
      <div className="space-y-4">
        <HouseholdMembers 
          formData={formData}
          onChange={handleFieldChange}
          errors={errors}
          mode={mode}
        />
      </div>
      */}

      {/* Form Actions */}
      {showActions && !isReadOnly && (
        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <button
            type="button"
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {(() => {
              if (isLoading) return 'Saving...';
              if (isCreating) return 'Create Household';
              return 'Update Household';
            })()}
          </button>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-info/5 border-info/20 rounded-md border p-3">
          <summary className="text-info cursor-pointer font-medium">Debug: Form Data</summary>
          <pre className="mt-2 overflow-auto rounded bg-zinc-50 p-2 text-sm text-zinc-500 dark:bg-zinc-900/30 dark:text-zinc-400">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </details>
      )}
    </form>
  );
}
