import React, { useEffect } from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import { useGeographicData } from '@/hooks/api/useGeographicData';
import { HouseholdFormData } from '@/types/app/ui/forms';

export interface AddressDetailsProps {
  formData: HouseholdFormData;
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors?: Record<string, string>;
  mode?: 'create' | 'view' | 'edit';
  className?: string;
}

/**
 * Address Details Form Fields Component
 *
 * Handles the physical address information for households including:
 * - House number
 * - Street selection
 * - Subdivision (optional)
 * - ZIP code
 */
export function AddressDetails({
  formData,
  onChange,
  errors,
  mode = 'edit',
  className = '',
}: AddressDetailsProps) {
  const isReadOnly = mode === 'view';

  const { streets, subdivisions, loading, loadSubdivisions, loadStreets } = useGeographicData();

  const handleFieldChange = (field: string) => (value: string | number | boolean | null) => {
    onChange(field, value);

    // Handle cascading selections
    if (field === 'subdivision_id') {
      // Clear street selection when subdivision changes
      onChange('street_id', '');

      if (value && formData.barangay_code) {
        // Load streets filtered by subdivision
        loadStreets(formData.barangay_code, value as string);
      } else if (formData.barangay_code) {
        // Load all streets in barangay if no subdivision selected
        loadStreets(formData.barangay_code);
      }
    }
  };

  // Load initial data based on form values
  useEffect(() => {
    if (formData.barangay_code) {
      // Load subdivisions for the barangay
      loadSubdivisions(formData.barangay_code);

      // Load streets (filtered by subdivision if selected)
      if (formData.subdivision_id) {
        loadStreets(formData.barangay_code, formData.subdivision_id);
      } else {
        loadStreets(formData.barangay_code);
      }
    }
  }, [formData.barangay_code, formData.subdivision_id, loadSubdivisions, loadStreets]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* House Number */}
        <InputField
          label="House Number"
          required
          helperText={mode === 'view' ? undefined : "Enter the house number or unit identifier"}
          errorMessage={errors?.house_number}
          inputProps={{
            name: 'house_number',
            type: 'text',
            value: formData.house_number || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange('house_number')(e.target.value),
            readOnly: isReadOnly,
            placeholder: 'e.g., 123, 45-A, Blk 2 Lot 3',
          }}
        />

        {/* ZIP Code */}
        <InputField
          label="ZIP Code"
          helperText={mode === 'view' ? undefined : "4-digit postal code"}
          errorMessage={errors?.zip_code}
          inputProps={{
            name: 'zip_code',
            type: 'text',
            value: formData.zip_code || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              handleFieldChange('zip_code')(e.target.value),
            readOnly: isReadOnly,
            placeholder: 'e.g., 1234',
            maxLength: 4,
          }}
        />
      </div>

      {/* Subdivision (Optional) */}
      <SelectField
        label="Subdivision (Optional)"
        helperText={mode === 'view' ? undefined : "Choose subdivision if the household is located within one"}
        errorMessage={errors?.subdivision_id}
        selectProps={{
          name: 'subdivision_id',
          value: formData.subdivision_id || '',
          onSelect: option => handleFieldChange('subdivision_id')(option?.value || ''),
          placeholder: 'Select subdivision if applicable...',
          disabled: isReadOnly || !formData.barangay_code,
          loading: loading.subdivisions,
          options: [{ value: '', label: 'No subdivision' }, ...subdivisions],
        }}
      />

      {/* Street Selection */}
      <SelectField
        label="Street"
        required
        helperText={mode === 'view' ? undefined : "Choose the street where the household is located"}
        errorMessage={errors?.street_id}
        selectProps={{
          name: 'street_id',
          value: formData.street_id || '',
          onSelect: option => handleFieldChange('street_id')(option?.value || ''),
          placeholder: 'Select street...',
          disabled: isReadOnly || !formData.barangay_code,
          loading: loading.streets,
          options: [{ value: '', label: 'Select street...' }, ...streets],
        }}
      />
    </div>
  );
}
