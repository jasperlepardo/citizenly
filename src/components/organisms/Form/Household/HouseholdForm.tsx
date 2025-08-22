import React, { useState, useCallback } from 'react';
import { HouseholdDetails } from './HouseholdDetails';
import { ExtendedHouseholdFormData, FormMode } from './types';

export interface HouseholdFormProps {
  /** Initial form data */
  initialData?: Partial<ExtendedHouseholdFormData>;
  /** Form mode - determines if fields are editable */
  mode?: FormMode;
  /** Called when form data changes */
  onDataChange?: (data: ExtendedHouseholdFormData) => void;
  /** Called when form is submitted */
  onSubmit?: (data: ExtendedHouseholdFormData) => void | Promise<void>;
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
}: HouseholdFormProps) {
  // Initialize form data with defaults
  const [formData, setFormData] = useState<ExtendedHouseholdFormData>({
    // Default values for new households
    noOfFamilies: 1,
    noOfHouseholdMembers: 0,
    noOfMigrants: 0,
    code: '', // Provide default empty string for code
    // Merge with initial data
    ...initialData,
  });

  // Handle field changes
  const handleFieldChange = useCallback((field: string, value: string | number | boolean | null) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // Notify parent component of changes
      onDataChange?.(updated);
      
      return updated;
    });
  }, [onDataChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      await onSubmit(formData);
    }
  }, [formData, onSubmit]);

  const isReadOnly = mode === 'view';
  const isCreating = mode === 'create';

  return (
    <form onSubmit={handleSubmit} className={`max-w-16 mx-auto space-y-6 ${className}`}>
      {/* Form Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {isCreating ? 'New Household Registration' : 'Household Information'}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base">
          {isCreating 
            ? 'Register a new household in the barangay system.'
            : 'View and manage household information.'
          }
        </p>
      </div>

      {/* Household Details Section */}
      <div className="space-y-4">
        <HouseholdDetails
          formData={{
            houseNumber: formData.houseNumber,
            streetId: formData.streetId,
            subdivisionId: formData.subdivisionId,
            barangayCode: formData.barangayCode,
            cityMunicipalityCode: formData.cityMunicipalityCode,
            provinceCode: formData.provinceCode,
            regionCode: formData.regionCode,
            zipCode: formData.zipCode,
            noOfFamilies: formData.noOfFamilies,
            noOfHouseholdMembers: formData.noOfHouseholdMembers,
            noOfMigrants: formData.noOfMigrants,
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
        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-50 dark:bg-zinc-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-blue-600 dark:text-blue-400-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isCreating ? 'Create Household' : 'Update Household'}
          </button>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-info/5 border border-info/20 rounded-md p-3">
          <summary className="font-medium text-info cursor-pointer">Debug: Form Data</summary>
          <pre className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 p-2 bg-zinc-50 dark:bg-zinc-900/30 rounded overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </details>
      )}
    </form>
  );
}