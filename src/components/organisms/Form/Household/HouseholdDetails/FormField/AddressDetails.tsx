import React, { useEffect } from 'react';
import { InputField, SelectField } from '@/components/molecules/FieldSet';
import { HouseholdDetailsData } from '../../types';
import { useGeographicData } from '@/hooks/api/useGeographicData';

export interface AddressDetailsProps {
  formData: HouseholdDetailsData;
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
  
  const {
    streets,
    subdivisions,
    loading,
    loadSubdivisions,
    loadStreets,
  } = useGeographicData();

  const handleFieldChange = (field: string) => (value: string | number | boolean | null) => {
    onChange(field, value);
    
    // Handle cascading selections
    if (field === 'subdivisionId') {
      // Clear street selection when subdivision changes
      onChange('streetId', '');
      
      if (value && formData.barangayCode) {
        // Load streets filtered by subdivision
        loadStreets(formData.barangayCode, value as string);
      } else if (formData.barangayCode) {
        // Load all streets in barangay if no subdivision selected
        loadStreets(formData.barangayCode);
      }
    }
  };

  // Load initial data based on form values
  useEffect(() => {
    if (formData.barangayCode) {
      // Load subdivisions for the barangay
      loadSubdivisions(formData.barangayCode);
      
      // Load streets (filtered by subdivision if selected)
      if (formData.subdivisionId) {
        loadStreets(formData.barangayCode, formData.subdivisionId);
      } else {
        loadStreets(formData.barangayCode);
      }
    }
  }, [formData.barangayCode, formData.subdivisionId, loadSubdivisions, loadStreets]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* House Number */}
        <InputField
          label="House Number"
          required
          helperText="Enter the house number or unit identifier"
          errorMessage={errors?.houseNumber}
          inputProps={{
            name: "houseNumber",
            type: "text",
            value: formData.houseNumber || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('houseNumber')(e.target.value),
            readOnly: isReadOnly,
            placeholder: "e.g., 123, 45-A, Blk 2 Lot 3"
          }}
        />

        {/* ZIP Code */}
        <InputField
          label="ZIP Code"
          helperText="4-digit postal code"
          errorMessage={errors?.zipCode}
          inputProps={{
            name: "zipCode",
            type: "text",
            value: formData.zipCode || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('zipCode')(e.target.value),
            readOnly: isReadOnly,
            placeholder: "e.g., 1234",
            maxLength: 4
          }}
        />
      </div>

      {/* Subdivision (Optional) */}
      <SelectField
        label="Subdivision (Optional)"
        helperText="Choose subdivision if the household is located within one"
        errorMessage={errors?.subdivisionId}
        selectProps={{
          name: "subdivisionId",
          value: formData.subdivisionId || '',
          onSelect: (option) => handleFieldChange('subdivisionId')(option?.value || ''),
          placeholder: "Select subdivision if applicable...",
          disabled: isReadOnly || !formData.barangayCode,
          loading: loading.subdivisions,
          options: [
            { value: '', label: 'No subdivision' },
            ...subdivisions
          ]
        }}
      />

      {/* Street Selection */}
      <SelectField
        label="Street"
        required
        helperText="Choose the street where the household is located"
        errorMessage={errors?.streetId}
        selectProps={{
          name: "streetId",
          value: formData.streetId || '',
          onSelect: (option) => handleFieldChange('streetId')(option?.value || ''),
          placeholder: "Select street...",
          disabled: isReadOnly || !formData.barangayCode,
          loading: loading.streets,
          options: [
            { value: '', label: 'Select street...' },
            ...streets
          ]
        }}
      />
    </div>
  );
}