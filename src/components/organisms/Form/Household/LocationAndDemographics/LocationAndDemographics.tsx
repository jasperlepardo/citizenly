import React from 'react';
import { AddressInformation, AddressInformationData } from './FormField/AddressInformation';
import { DemographicsInformation, DemographicsInformationData } from './FormField/DemographicsInformation';
import type { FormMode } from '@/types/forms';

export interface LocationAndDemographicsFormProps {
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  formData: {
    // Address Information
    houseNumber: string;
    streetId: string;  // Changed from streetName to streetId
    subdivisionId: string;  // Changed from subdivisionName to subdivisionId
    barangayCode: string;
    cityMunicipalityCode: string;
    provinceCode: string;
    regionCode: string;
    // Demographics
    noOfFamilies: number;
    noOfHouseholdMembers: number;
    noOfMigrants: number;
  };
  onChange: (field: string, value: string | number | boolean | null) => void;
  errors: Record<string, string>;
  // Location options (streets and subdivisions handled automatically)
  regionOptions?: Array<{ value: string; label: string }>;
  provinceOptions?: Array<{ value: string; label: string }>;
  cityOptions?: Array<{ value: string; label: string }>;
  barangayOptions?: Array<{ value: string; label: string }>;
  // Loading states (streets and subdivisions handled automatically)
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

export function LocationAndDemographicsForm({ 
  mode = 'create',
  formData, 
  onChange, 
  errors,
  regionOptions,
  provinceOptions,
  cityOptions,
  barangayOptions,
  regionsLoading,
  provincesLoading,
  citiesLoading,
  barangaysLoading,
  onRegionChange,
  onProvinceChange,
  onCityChange,
  onBarangayChange
}: LocationAndDemographicsFormProps) {

  // Map form data to AddressInformation component props
  const addressInfoValue: AddressInformationData = {
    houseNumber: formData.houseNumber || '',
    streetId: formData.streetId || '',  // Updated field name
    subdivisionId: formData.subdivisionId || '',  // Updated field name
    barangayCode: formData.barangayCode || '',
    cityMunicipalityCode: formData.cityMunicipalityCode || '',
    provinceCode: formData.provinceCode || '',
    regionCode: formData.regionCode || '',
  };

  // Map form data to DemographicsInformation component props
  const demographicsValue: DemographicsInformationData = {
    noOfFamilies: formData.noOfFamilies || 1,
    noOfHouseholdMembers: formData.noOfHouseholdMembers || 0,
    noOfMigrants: formData.noOfMigrants || 0,
  };

  // Handle changes from AddressInformation component
  const handleAddressInfoChange = (value: AddressInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  // Handle changes from DemographicsInformation component
  const handleDemographicsChange = (value: DemographicsInformationData) => {
    Object.entries(value).forEach(([field, fieldValue]) => {
      onChange(field as keyof typeof value, fieldValue);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-xs p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Location & Demographics</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Household address information and demographic composition.
          </p>
        </div>

        <div className="space-y-8">
          {/* Address Information */}
          <AddressInformation
            mode={mode}
            value={addressInfoValue}
            onChange={handleAddressInfoChange}
            errors={errors}
            regionOptions={regionOptions}
            provinceOptions={provinceOptions}
            cityOptions={cityOptions}
            barangayOptions={barangayOptions}
            regionsLoading={regionsLoading}
            provincesLoading={provincesLoading}
            citiesLoading={citiesLoading}
            barangaysLoading={barangaysLoading}
            onRegionChange={onRegionChange}
            onProvinceChange={onProvinceChange}
            onCityChange={onCityChange}
            onBarangayChange={onBarangayChange}
          />

          {/* Demographics Information */}
          <DemographicsInformation
            mode={mode}
            value={demographicsValue}
            onChange={handleDemographicsChange}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}

export { LocationAndDemographicsForm as LocationDemographicsForm };