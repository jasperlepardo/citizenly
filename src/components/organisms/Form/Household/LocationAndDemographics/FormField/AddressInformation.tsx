import React from 'react';

import { InputField, SelectField } from '@/components';
import { useStreetsSearch } from '@/hooks/search/useStreetsSearch';
import { useSubdivisionsSearch } from '@/hooks/search/useSubdivisionsSearch';
import type { FormMode } from '@/types';

export interface AddressInformationData {
  houseNumber: string;
  streetId: string; // Changed from streetName to streetId (UUID)
  subdivisionId: string; // Changed from subdivisionName to subdivisionId (UUID)
  barangayCode: string;
  cityMunicipalityCode: string;
  provinceCode: string;
  regionCode: string;
}

export interface AddressInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: AddressInformationData;
  onChange: (value: AddressInformationData) => void;
  errors: Record<string, string>;
  className?: string;
  // Location options (streets and subdivisions will be fetched automatically)
  regionOptions?: Array<{ value: string; label: string }>;
  provinceOptions?: Array<{ value: string; label: string }>;
  cityOptions?: Array<{ value: string; label: string }>;
  barangayOptions?: Array<{ value: string; label: string }>;
  // Loading states (streets and subdivisions will be handled automatically)
  regionsLoading?: boolean;
  provincesLoading?: boolean;
  citiesLoading?: boolean;
  barangaysLoading?: boolean;
  // Search handlers
  onRegionChange?: (regionCode: string) => void;
  onProvinceChange?: (provinceCode: string) => void;
  onCityChange?: (cityCode: string) => void;
  onBarangayChange?: (barangayCode: string) => void;
}

export function AddressInformation({
  mode = 'create',
  value,
  onChange,
  errors,
  className = '',
  regionOptions = [],
  provinceOptions = [],
  cityOptions = [],
  barangayOptions = [],
  regionsLoading = false,
  provincesLoading = false,
  citiesLoading = false,
  barangaysLoading = false,
  onRegionChange,
  onProvinceChange,
  onCityChange,
  onBarangayChange,
}: AddressInformationProps) {
  // Fetch subdivisions based on selected barangay
  const { subdivisions: subdivisionOptions, loading: subdivisionsLoading } = useSubdivisionsSearch({
    barangayCode: value.barangayCode,
    enabled: !!value.barangayCode,
  });

  // Fetch streets based on selected barangay and subdivision
  const { streets: streetOptions, loading: streetsLoading } = useStreetsSearch({
    barangayCode: value.barangayCode,
    subdivisionId: value.subdivisionId,
    enabled: !!value.barangayCode,
  });

  const handleChange = (field: keyof AddressInformationData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const handleRegionSelect = (option: any) => {
    const regionCode = option?.value || '';
    handleChange('regionCode', regionCode);
    if (onRegionChange) {
      onRegionChange(regionCode);
    }
  };

  const handleProvinceSelect = (option: any) => {
    const provinceCode = option?.value || '';
    handleChange('provinceCode', provinceCode);
    if (onProvinceChange) {
      onProvinceChange(provinceCode);
    }
  };

  const handleCitySelect = (option: any) => {
    const cityCode = option?.value || '';
    handleChange('cityMunicipalityCode', cityCode);
    if (onCityChange) {
      onCityChange(cityCode);
    }
  };

  const handleBarangaySelect = (option: any) => {
    const barangayCode = option?.value || '';
    handleChange('barangayCode', barangayCode);
    // Clear dependent fields when barangay changes
    if (barangayCode !== value.barangayCode) {
      handleChange('subdivisionId', '');
      handleChange('streetId', '');
    }
    if (onBarangayChange) {
      onBarangayChange(barangayCode);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Address Information
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Complete household address with geographic information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* House Number */}
        <InputField
          label="House Number"
          required
          labelSize="sm"
          errorMessage={errors.houseNumber}
          mode={mode}
          inputProps={{
            value: value.houseNumber,
            onChange: e => handleChange('houseNumber', e.target.value),
            placeholder: 'Enter house number',
            error: errors.houseNumber,
          }}
        />

        {/* Street Name */}
        <SelectField
          label="Street Name"
          required
          labelSize="sm"
          errorMessage={errors.streetId}
          mode={mode}
          selectProps={{
            options: streetOptions,
            value: value.streetId,
            onSelect: (option: any) => {
              handleChange('streetId', option?.value || '');
            },
            placeholder: streetsLoading ? 'Loading streets...' : 'Select street',
            loading: streetsLoading,
            disabled: !value.barangayCode,
          }}
        />

        {/* Subdivision */}
        <SelectField
          label="Subdivision"
          labelSize="sm"
          mode={mode}
          selectProps={{
            options: subdivisionOptions,
            value: value.subdivisionId,
            onSelect: (option: any) => {
              const newSubdivisionId = option?.value || '';
              handleChange('subdivisionId', newSubdivisionId);
              // Clear street when subdivision changes
              if (newSubdivisionId !== value.subdivisionId) {
                handleChange('streetId', '');
              }
            },
            placeholder: subdivisionsLoading
              ? 'Loading subdivisions...'
              : 'Select subdivision (optional)',
            loading: subdivisionsLoading,
            disabled: !value.barangayCode,
          }}
        />

        {/* Barangay */}
        <SelectField
          label="Barangay"
          required
          labelSize="sm"
          errorMessage={errors.barangayCode}
          mode={mode}
          selectProps={{
            options: barangayOptions,
            value: value.barangayCode,
            onSelect: handleBarangaySelect,
            placeholder: barangaysLoading ? 'Loading barangays...' : 'Select barangay',
            loading: barangaysLoading,
            disabled: !value.cityMunicipalityCode,
          }}
        />

        {/* City/Municipality */}
        <SelectField
          label="City/Municipality"
          required
          labelSize="sm"
          errorMessage={errors.cityMunicipalityCode}
          mode={mode}
          selectProps={{
            options: cityOptions,
            value: value.cityMunicipalityCode,
            onSelect: handleCitySelect,
            placeholder: citiesLoading ? 'Loading cities...' : 'Select city/municipality',
            loading: citiesLoading,
            disabled: !value.provinceCode,
          }}
        />

        {/* Province */}
        <SelectField
          label="Province"
          required
          labelSize="sm"
          errorMessage={errors.provinceCode}
          mode={mode}
          selectProps={{
            options: provinceOptions,
            value: value.provinceCode,
            onSelect: handleProvinceSelect,
            placeholder: provincesLoading ? 'Loading provinces...' : 'Select province',
            loading: provincesLoading,
            disabled: !value.regionCode,
          }}
        />

        {/* Region */}
        <SelectField
          label="Region"
          required
          labelSize="sm"
          errorMessage={errors.regionCode}
          mode={mode}
          selectProps={{
            options: regionOptions,
            value: value.regionCode,
            onSelect: handleRegionSelect,
            placeholder: regionsLoading ? 'Loading regions...' : 'Select region',
            loading: regionsLoading,
          }}
        />
      </div>
    </div>
  );
}

export default AddressInformation;
