import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import type { SelectOption } from '@/utils/ui/selectUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useStreetsSearch } from '@/hooks/search/useStreetsSearch';
import { useSubdivisionsSearch } from '@/hooks/search/useSubdivisionsSearch';
import type { FormMode } from '@/types/app/ui/forms';
import type { AddressInformationFormData } from '@/types/domain/households/forms';

export interface AddressInformationProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  value: AddressInformationFormData;
  onChange: (value: AddressInformationFormData) => void;
  errors: Record<string, string>;
  className?: string;
  // Location options (streets and subdivisions will be fetched automatically)
  regionOptions?: Array<{ value: string; label: string }>;
  provinceOptions?: Array<{ value: string; label: string }>;
  cityOptions?: Array<{ value: string; label: string }>;
  barangayOptions?: Array<{ value: string; label: string }>;
  streetOptions?: Array<{ value: string; label: string }>;
  subdivisionOptions?: Array<{ value: string; label: string }>;
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
  streetOptions,
  subdivisionOptions,
  regionsLoading = false,
  provincesLoading = false,
  citiesLoading = false,
  barangaysLoading = false,
  onRegionChange,
  onProvinceChange,
  onCityChange,
  onBarangayChange,
}: AddressInformationProps) {
  // Get authentication context and query client
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // State for search terms
  const [streetSearchTerm, setStreetSearchTerm] = useState('');
  const [subdivisionSearchTerm, setSubdivisionSearchTerm] = useState('');

  // Fetch subdivisions based on selected barangay (only if not provided in view mode)
  const { subdivisions: fetchedSubdivisionOptions, loading: subdivisionsLoading } = useSubdivisionsSearch({
    barangayCode: value.barangayCode,
    search: subdivisionSearchTerm,
    enabled: !!value.barangayCode && mode !== 'view',
  });

  // Fetch streets based on selected barangay and subdivision (only if not provided in view mode)
  const { streets: fetchedStreetOptions, loading: streetsLoading } = useStreetsSearch({
    barangayCode: value.barangayCode,
    subdivisionId: value.subdivisionId,
    search: streetSearchTerm,
    enabled: !!value.barangayCode && mode !== 'view',
  });

  // Use provided options in view mode, otherwise use fetched options
  const finalSubdivisionOptions = subdivisionOptions || fetchedSubdivisionOptions;
  const finalStreetOptions = streetOptions || fetchedStreetOptions;

  // Handle creating new street
  const handleCreateNewStreet = async (streetName: string): Promise<SelectOption> => {
    try {
      if (!session?.access_token) {
        throw new Error('Authentication required to create new street');
      }

      const response = await fetch('/api/addresses/streets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: streetName,
          barangay_code: value.barangayCode,
          subdivision_id: value.subdivisionId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create street');
      }

      const result = await response.json();

      // Invalidate all streets queries for this barangay to ensure fresh data on next fetch
      queryClient.invalidateQueries({
        queryKey: ['streets', value.barangayCode],
        exact: false // This will invalidate all queries that start with ['streets', barangayCode]
      });

      return result.data;
    } catch (error) {
      console.error('Error creating new street:', error);
      throw error;
    }
  };

  // Handle creating new subdivision
  const handleCreateNewSubdivision = async (subdivisionName: string): Promise<SelectOption> => {
    try {
      if (!session?.access_token) {
        throw new Error('Authentication required to create new subdivision');
      }

      const response = await fetch('/api/addresses/subdivisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: subdivisionName,
          barangay_code: value.barangayCode,
          type: 'Subdivision', // Default type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subdivision');
      }

      const result = await response.json();

      // Invalidate all subdivisions queries for this barangay to ensure fresh data on next fetch
      queryClient.invalidateQueries({
        queryKey: ['subdivisions', value.barangayCode],
        exact: false // This will invalidate all queries that start with ['subdivisions', barangayCode]
      });

      return result.data;
    } catch (error) {
      console.error('Error creating new subdivision:', error);
      throw error;
    }
  };


  const handleChange = (field: keyof AddressInformationFormData, fieldValue: string) => {
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
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('houseNumber', e.target.value),
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
            options: finalStreetOptions,
            value: value.streetId,
            onSelect: (option: any) => {
              handleChange('streetId', option?.value || '');
            },
            placeholder: streetsLoading ? 'Loading streets...' : 'Select or type street name',
            loading: streetsLoading,
            disabled: !value.barangayCode && mode !== 'view',
            searchable: true, // Enable typing for "Add New Item" functionality
            allowCreate: mode !== 'view' && !!value.barangayCode,
            onCreateNew: handleCreateNewStreet,
            onSearch: setStreetSearchTerm, // Enable dynamic search
          }}
        />

        {/* Subdivision */}
        <SelectField
          label="Subdivision"
          labelSize="sm"
          errorMessage={errors.subdivisionId}
          mode={mode}
          selectProps={{
            options: finalSubdivisionOptions,
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
              : 'Select or type subdivision name (optional)',
            loading: subdivisionsLoading,
            disabled: !value.barangayCode && mode !== 'view',
            searchable: true, // Enable typing for "Add New Item" functionality
            allowCreate: mode !== 'view' && !!value.barangayCode,
            onCreateNew: handleCreateNewSubdivision,
            onSearch: setSubdivisionSearchTerm, // Enable dynamic search
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
