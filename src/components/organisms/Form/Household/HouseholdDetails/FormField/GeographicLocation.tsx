import React, { useEffect } from 'react';
import { SelectField } from '@/components/molecules/FieldSet';
import { HouseholdDetailsData } from '../../types';
import { useGeographicData } from '@/hooks/api/useGeographicData';

export interface GeographicLocationProps {
  formData: HouseholdDetailsData;
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors?: Record<string, string>;
  mode?: 'create' | 'view' | 'edit';
  className?: string;
}

/**
 * Geographic Location Form Fields Component
 * 
 * Handles the administrative geographic hierarchy for households:
 * - Region
 * - Province
 * - City/Municipality
 * - Barangay
 */
export function GeographicLocation({
  formData,
  onChange,
  errors,
  mode = 'edit',
  className = '',
}: GeographicLocationProps) {
  const isReadOnly = mode === 'view';
  
  const {
    regions,
    provinces,
    cities,
    barangays,
    loading,
    error,
    loadProvinces,
    loadCities,
    loadBarangays,
    loadIndependentCities,
  } = useGeographicData();

  const handleFieldChange = (field: string) => (value: string | number | boolean | null) => {
    onChange(field, value);
    
    // Handle cascading selections
    if (field === 'regionCode') {
      // Clear dependent fields
      onChange('provinceCode', '');
      onChange('cityMunicipalityCode', '');
      onChange('barangayCode', '');
      
      if (value) {
        // Load provinces or independent cities based on region
        // NCR (code: '13') has independent cities, not provinces
        if (value === '13') {
          loadIndependentCities(value as string);
        } else {
          loadProvinces(value as string);
        }
      }
    } else if (field === 'provinceCode') {
      // Clear dependent fields
      onChange('cityMunicipalityCode', '');
      onChange('barangayCode', '');
      
      if (value) {
        loadCities(value as string);
      }
    } else if (field === 'cityMunicipalityCode') {
      // Clear dependent fields
      onChange('barangayCode', '');
      
      if (value) {
        loadBarangays(value as string);
      }
    }
  };

  // Load initial data based on existing form values
  useEffect(() => {
    if (formData.regionCode) {
      if (formData.regionCode === '13') {
        loadIndependentCities(formData.regionCode);
      } else {
        loadProvinces(formData.regionCode);
      }
      
      if (formData.provinceCode) {
        loadCities(formData.provinceCode);
        
        if (formData.cityMunicipalityCode) {
          loadBarangays(formData.cityMunicipalityCode);
        }
      } else if (formData.cityMunicipalityCode && formData.regionCode === '13') {
        // For NCR, load barangays directly from city
        loadBarangays(formData.cityMunicipalityCode);
      }
    }
  }, [formData.regionCode, formData.provinceCode, formData.cityMunicipalityCode, loadProvinces, loadCities, loadBarangays, loadIndependentCities]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Region */}
        <SelectField
          label="Region"
          required
          helperText="Choose the administrative region"
          errorMessage={errors?.regionCode}
          selectProps={{
            name: "regionCode",
            value: formData.regionCode || '',
            onSelect: (option) => handleFieldChange('regionCode')(option?.value || ''),
            placeholder: "Select region...",
            disabled: isReadOnly,
            loading: loading.regions,
            options: [
              { value: '', label: 'Select region...' },
              ...regions
            ]
          }}
        />

        {/* Province */}
        <SelectField
          label="Province"
          helperText="Choose the province (if applicable)"
          errorMessage={errors?.provinceCode}
          selectProps={{
            name: "provinceCode",
            value: formData.provinceCode || '',
            onSelect: (option) => handleFieldChange('provinceCode')(option?.value || ''),
            placeholder: "Select province...",
            disabled: isReadOnly || !formData.regionCode || formData.regionCode === '13',
            loading: loading.provinces,
            options: [
              { value: '', label: formData.regionCode === '13' ? 'N/A (Independent Cities)' : 'Select province...' },
              ...provinces
            ]
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* City/Municipality */}
        <SelectField
          label="City/Municipality"
          required
          helperText="Choose the city or municipality"
          errorMessage={errors?.cityMunicipalityCode}
          selectProps={{
            name: "cityMunicipalityCode",
            value: formData.cityMunicipalityCode || '',
            onSelect: (option) => handleFieldChange('cityMunicipalityCode')(option?.value || ''),
            placeholder: "Select city/municipality...",
            disabled: isReadOnly || !formData.regionCode || (!formData.provinceCode && formData.regionCode !== '13'),
            loading: loading.cities,
            options: [
              { value: '', label: 'Select city/municipality...' },
              ...cities
            ]
          }}
        />

        {/* Barangay */}
        <SelectField
          label="Barangay"
          required
          helperText="Choose the barangay"
          errorMessage={errors?.barangayCode}
          selectProps={{
            name: "barangayCode",
            value: formData.barangayCode || '',
            onSelect: (option) => handleFieldChange('barangayCode')(option?.value || ''),
            placeholder: "Select barangay...",
            disabled: isReadOnly || !formData.cityMunicipalityCode,
            loading: loading.barangays,
            options: [
              { value: '', label: 'Select barangay...' },
              ...barangays
            ]
          }}
        />
      </div>

      {/* Helper Text for Geographic Hierarchy */}
      <div className="bg-info/5 border border-info/20 rounded-md p-3">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1.5">Geographic Hierarchy Information:</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select the geographic location from the highest level (Region) down to the specific Barangay. 
            Each selection will filter the options for the next level.
          </p>
        </div>
      </div>
    </div>
  );
}