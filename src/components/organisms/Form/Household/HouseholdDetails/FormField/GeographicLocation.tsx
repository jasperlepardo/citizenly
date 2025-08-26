import React, { useEffect } from 'react';

import { SelectField } from '@/components/molecules/FieldSet';
import { useGeographicData } from '@/hooks/api/useGeographicData';

import { HouseholdDetailsData } from '../../types';

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
    if (field === 'region_code') {
      // Clear dependent fields
      onChange('province_code', '');
      onChange('city_municipality_code', '');
      onChange('barangay_code', '');
      
      if (value) {
        // Load provinces or independent cities based on region
        // NCR (code: '13') has independent cities, not provinces
        if (value === '13') {
          loadIndependentCities(value as string);
        } else {
          loadProvinces(value as string);
        }
      }
    } else if (field === 'province_code') {
      // Clear dependent fields
      onChange('city_municipality_code', '');
      onChange('barangay_code', '');
      
      if (value) {
        loadCities(value as string);
      }
    } else if (field === 'city_municipality_code') {
      // Clear dependent fields
      onChange('barangay_code', '');
      
      if (value) {
        loadBarangays(value as string);
      }
    }
  };

  // Load initial data based on existing form values
  useEffect(() => {
    if (formData.region_code) {
      if (formData.region_code === '13') {
        loadIndependentCities(formData.region_code);
      } else {
        loadProvinces(formData.region_code);
      }
      
      if (formData.province_code) {
        loadCities(formData.province_code);
        
        if (formData.city_municipality_code) {
          loadBarangays(formData.city_municipality_code);
        }
      } else if (formData.city_municipality_code && formData.region_code === '13') {
        // For NCR, load barangays directly from city
        loadBarangays(formData.city_municipality_code);
      }
    }
  }, [formData.region_code, formData.province_code, formData.city_municipality_code, loadProvinces, loadCities, loadBarangays, loadIndependentCities]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Region */}
        <SelectField
          label="Region"
          required
          helperText="Choose the administrative region"
          errorMessage={errors?.region_code}
          selectProps={{
            name: "region_code",
            value: formData.region_code || '',
            onSelect: (option) => handleFieldChange('region_code')(option?.value || ''),
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
          errorMessage={errors?.province_code}
          selectProps={{
            name: "province_code",
            value: formData.province_code || '',
            onSelect: (option) => handleFieldChange('province_code')(option?.value || ''),
            placeholder: "Select province...",
            disabled: isReadOnly || !formData.region_code || formData.region_code === '13',
            loading: loading.provinces,
            options: [
              { value: '', label: formData.region_code === '13' ? 'N/A (Independent Cities)' : 'Select province...' },
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
          errorMessage={errors?.city_municipality_code}
          selectProps={{
            name: "city_municipality_code",
            value: formData.city_municipality_code || '',
            onSelect: (option) => handleFieldChange('city_municipality_code')(option?.value || ''),
            placeholder: "Select city/municipality...",
            disabled: isReadOnly || !formData.region_code || (!formData.province_code && formData.region_code !== '13'),
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
          errorMessage={errors?.barangay_code}
          selectProps={{
            name: "barangay_code",
            value: formData.barangay_code || '',
            onSelect: (option) => handleFieldChange('barangay_code')(option?.value || ''),
            placeholder: "Select barangay...",
            disabled: isReadOnly || !formData.city_municipality_code,
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