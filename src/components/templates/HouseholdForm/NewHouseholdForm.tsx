'use client';

import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components';
import {
  LocationAndDemographicsForm,
  HouseholdDetailsForm,
} from '@/components/organisms/Form/Household';
import { useAuth } from '@/contexts';
import { useUserBarangay } from '@/hooks/utilities';
import { supabase, logger, logError } from '@/lib';
import { useCSRFToken } from '@/lib/auth/csrf';
import { geographicService } from '@/services/geographic.service';

// Import our new Form/Household components

// Import molecules and atoms

export interface HouseholdFormData {
  // Location and Demographics
  houseNumber: string;
  streetId: string;
  subdivisionId: string;
  barangayCode: string;
  cityMunicipalityCode: string;
  provinceCode: string;
  regionCode: string;
  noOfFamilies: number;
  noOfHouseholdMembers: number;
  noOfMigrants: number;

  // Household Details
  householdType: string;
  tenureStatus: string;
  tenureOthersSpecify: string;
  householdUnit: string;
  householdName: string;
  monthlyIncome: number;
  householdHeadId: string;
  householdHeadPosition: string;

  // Auto-generated/derived fields
  code?: string;
  address?: string;
  zipCode?: string;
  incomeClass?: string;
  isActive?: boolean;
}

export type HouseholdFormMode = 'create' | 'view' | 'edit';

interface HouseholdFormProps {
  mode?: HouseholdFormMode;
  onSubmit?: (data: HouseholdFormData) => Promise<void>;
  onCancel?: () => void;
  onModeChange?: (mode: HouseholdFormMode) => void;
  initialData?: Partial<HouseholdFormData>;
  householdId?: string;
  // View mode options for displaying labels
  viewModeOptions?: {
    addressLabels?: any;
    householdTypeLabels?: any;
    householdHeadLabel?: string;
  };
}

export default function HouseholdForm({
  mode = 'create',
  onSubmit,
  onCancel: _onCancel,
  onModeChange,
  initialData,
  householdId,
  viewModeOptions,
}: HouseholdFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken: getCSRFToken } = useCSRFToken();
  const { user, userProfile, session } = useAuth();

  const [errors, setErrors] = useState<Partial<Record<keyof HouseholdFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Production-ready auto-fill state management
  const [autoFillAttempted, setAutoFillAttempted] = useState(false);
  const [autoFillStatus, setAutoFillStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>(
    'idle'
  );

  // Test function to manually trigger auto-fill with sample data
  const testAutoFill = () => {
    console.log('🧪 TEST AUTO-FILL triggered');
    console.log('🧪 Current form data codes:', {
      regionCode: formData.regionCode,
      provinceCode: formData.provinceCode,
      cityCode: formData.cityMunicipalityCode,
      barangayCode: formData.barangayCode,
    });
    console.log('🧪 Available options:', {
      regions: regionOptions.length,
      provinces: provinceOptions.length,
      cities: cityOptions.length,
      barangays: barangayOptions.length,
    });
    console.log('🧪 Cities loading state:', citiesLoading);
    console.log('🧪 Should load cities:', shouldLoadCities);

    if (regionOptions.length === 0) {
      alert(
        '❌ No regions loaded. Please wait for the page to load completely or check your connection.'
      );
      return;
    }

    // Find region 04 (CALABARZON)
    const testRegion = regionOptions.find((r: any) => r.value === '04');
    if (!testRegion) {
      console.log(
        '❌ Region 04 not found. Available regions:',
        regionOptions.map((r: any) => `${r.value}:${r.label}`).slice(0, 5)
      );
      alert('❌ Region 04 (CALABARZON) not found in options');
      return;
    }

    console.log('✅ Found region 04:', testRegion);
    console.log('🧪 Setting form data...');

    setFormData(prev => ({
      ...prev,
      regionCode: '04', // CALABARZON
      provinceCode: '0421', // Cavite
      cityMunicipalityCode: '042114', // Dasmariñas
      barangayCode: '042114014', // Sample barangay
    }));

    setAutoFillStatus('success');
    console.log('✅ Test auto-fill completed');
    alert('✅ Test auto-fill completed! Check the form fields.');
  };

  const [formData, setFormData] = useState<HouseholdFormData>({
    // Location and Demographics
    houseNumber: '',
    streetId: '',
    subdivisionId: '',
    barangayCode: '',
    cityMunicipalityCode: '',
    provinceCode: '',
    regionCode: '',
    noOfFamilies: 1,
    noOfHouseholdMembers: 0,
    noOfMigrants: 0,

    // Household Details
    householdType: '',
    tenureStatus: '',
    tenureOthersSpecify: '',
    householdUnit: '',
    householdName: '',
    monthlyIncome: 0,
    householdHeadId: '',
    householdHeadPosition: '',

    // Merge initial data if provided
    ...initialData,
  });

  // User's assigned barangay address (auto-populated)
  const { address: userAddress, loading: loadingAddress } = useUserBarangay();

  // Load location options using React Query directly - always load regions
  const { data: regionOptions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ['addresses', 'regions'],
    queryFn: async () => {
      return await geographicService.getRegions();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load provinces when we have a region (either from form data or user selection)
  const shouldLoadProvinces = formData.regionCode || userAddress?.region_code;

  const { data: provinceOptions = [], isLoading: provincesLoading } = useQuery({
    queryKey: [
      'addresses',
      'provinces',
      shouldLoadProvinces ? formData.regionCode || userAddress?.region_code : '',
    ],
    queryFn: async () => {
      const regionCode = formData.regionCode || userAddress?.region_code;
      if (!regionCode) return [];
      return await geographicService.getProvincesByRegion(regionCode);
    },
    enabled: !!shouldLoadProvinces,
    staleTime: 10 * 60 * 1000,
  });

  // Load cities when we have a province
  const shouldLoadCities = formData.provinceCode || userAddress?.province_code;

  const { data: cityOptions = [], isLoading: citiesLoading } = useQuery({
    queryKey: [
      'addresses',
      'cities',
      shouldLoadCities ? formData.provinceCode || userAddress?.province_code : '',
    ],
    queryFn: async () => {
      const provinceCode = formData.provinceCode || userAddress?.province_code;
      if (!provinceCode) return [];
      const cityOptions = await geographicService.getCitiesByProvince(provinceCode);
      console.log('🏙️ Cities loaded:', cityOptions.length, 'cities for province:', provinceCode);
      return cityOptions;
    },
    enabled: !!shouldLoadCities,
    staleTime: 10 * 60 * 1000,
  });

  // Load barangays when we have a city
  const shouldLoadBarangays = formData.cityMunicipalityCode || userAddress?.city_municipality_code;

  const { data: barangayOptions = [], isLoading: barangaysLoading } = useQuery({
    queryKey: [
      'addresses',
      'barangays',
      shouldLoadBarangays
        ? formData.cityMunicipalityCode || userAddress?.city_municipality_code
        : '',
    ],
    queryFn: async () => {
      const cityCode = formData.cityMunicipalityCode || userAddress?.city_municipality_code;
      if (!cityCode) return [];
      return await geographicService.getBarangaysByCity(cityCode);
    },
    enabled: !!shouldLoadBarangays,
    staleTime: 10 * 60 * 1000,
  });

  // Enhanced auto-fill with multiple strategies and better debugging
  useEffect(() => {
    const performAutoFill = async () => {
      console.log('🔄 Auto-fill check started');

      // Only attempt once per form session (unless it was unsuccessful)
      if (autoFillAttempted && formData.regionCode && formData.barangayCode) {
        console.log('⏭️ Auto-fill already completed successfully, skipping');
        return;
      }

      // Skip if form already has location data
      if (
        formData.regionCode ||
        formData.provinceCode ||
        formData.cityMunicipalityCode ||
        formData.barangayCode
      ) {
        console.log('⏭️ Form already has location data, skipping auto-fill');
        setAutoFillAttempted(true);
        return;
      }

      // Wait for regions to be available
      if (regionsLoading || regionOptions.length === 0) {
        console.log('⏳ Waiting for regions to load...', {
          regionsLoading,
          regionCount: regionOptions.length,
        });
        return;
      }

      // Mark as attempted to prevent multiple calls
      setAutoFillAttempted(true);
      setAutoFillStatus('loading');
      setIsAutoFilling(true);
      console.log('🚀 Starting auto-fill process...');

      try {
        let addressData = null;

        // Strategy 1: Use userAddress from context (preferred)
        if (userAddress?.region_code) {
          console.log('✅ Using userAddress from context');
          addressData = userAddress;
        }
        // Strategy 1B: Fetch from API if authenticated but no userAddress
        else if (user && userProfile?.barangay_code) {
          console.log('🌐 Fetching address data from API for barangay:', userProfile.barangay_code);

          try {
            const result = await geographicService.getGeographicHierarchy(
              userProfile.barangay_code
            );
            addressData = result;
            console.log('✅ Address data retrieved successfully');
          } catch (error) {
            console.error('❌ API fetch failed:', error);
          }
        } else {
          console.warn('🚫 Auto-fill failed: No authenticated user data available');
          setAutoFillStatus('failed');
          return;
        }

        // Apply auto-fill if we have valid address data
        if (addressData && 'region_code' in addressData && addressData.region_code) {
          console.log('🔍 Validating and applying address data...');

          // Validate the region exists in our options
          const regionExists = regionOptions.some((r: any) => r.value === addressData.region_code);

          if (regionExists) {
            console.log('✅ Auto-filling location fields...');

            // Step 1: Set region and trigger province loading
            handleRegionChange(addressData.region_code);

            // Step 2: Wait for provinces to load, then set province and trigger city loading
            setTimeout(() => {
              if ('province_code' in addressData && addressData.province_code) {
                handleProvinceChange(addressData.province_code);

                // Step 3: Wait for cities to load, then set city and trigger barangay loading
                setTimeout(() => {
                  let cityCode: string | undefined;
                  if (
                    'city_municipality_code' in addressData &&
                    typeof addressData.city_municipality_code === 'string' &&
                    addressData.city_municipality_code
                  ) {
                    cityCode = addressData.city_municipality_code;
                  } else if (
                    'city_code' in addressData &&
                    typeof addressData.city_code === 'string' &&
                    addressData.city_code
                  ) {
                    cityCode = addressData.city_code;
                  }

                  if (cityCode) {
                    handleCityChange(cityCode);

                    // Step 4: Wait for barangays to load, then set barangay
                    setTimeout(() => {
                      if ('barangay_code' in addressData && addressData.barangay_code) {
                        handleBarangayChange(addressData.barangay_code);
                      }
                    }, 300);
                  }
                }, 300);
              }
            }, 300);

            setAutoFillStatus('success');
            console.log('✅ Auto-fill completed successfully!');
          } else {
            console.warn('⚠️ Region validation failed - region not found in options');
            setAutoFillStatus('failed');
          }
        } else {
          console.warn('⚠️ No valid address data available');
          setAutoFillStatus('failed');
        }
      } catch (error) {
        console.error('❌ Auto-fill error:', error);
        setAutoFillStatus('failed');
      } finally {
        setIsAutoFilling(false);
      }
    };

    performAutoFill();
  }, [
    user,
    userProfile?.barangay_code,
    userAddress,
    regionsLoading,
    regionOptions,
    autoFillAttempted,
    formData.regionCode,
    formData.provinceCode,
    formData.cityMunicipalityCode,
    formData.barangayCode,
  ]);

  // Household code will be generated by the database
  // The generate_hierarchical_household_id() function creates codes in format: RRPPMMBBB-SSSS-TTTT-HHHH
  // Example: "137404001-0001-0002-0123" based on PSGC barangay code and address components

  const handleInputChange = (field: string, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof HouseholdFormData]) {
      setErrors(prev => ({
        ...prev,
        [field as keyof HouseholdFormData]: undefined,
      }));
    }
  };

  // Location change handlers for cascade and auto-fill
  const handleRegionChange = (regionCode: string) => {
    setFormData(prev => ({
      ...prev,
      regionCode,
      provinceCode: '',
      cityMunicipalityCode: '',
      barangayCode: '',
      subdivisionId: '',
      streetId: '',
    }));
  };

  const handleProvinceChange = (provinceCode: string) => {
    setFormData(prev => ({
      ...prev,
      provinceCode,
      cityMunicipalityCode: '',
      barangayCode: '',
      subdivisionId: '',
      streetId: '',
    }));
  };

  const handleCityChange = (cityCode: string) => {
    setFormData(prev => ({
      ...prev,
      cityMunicipalityCode: cityCode,
      barangayCode: '',
      subdivisionId: '',
      streetId: '',
    }));
  };

  const handleBarangayChange = (barangayCode: string) => {
    setFormData(prev => ({
      ...prev,
      barangayCode,
      subdivisionId: '',
      streetId: '',
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HouseholdFormData, string>> = {};

    try {
      // Location and Demographics validation
      if (!formData.houseNumber?.trim()) newErrors.houseNumber = 'House number is required';
      if (!formData.streetId?.trim()) newErrors.streetId = 'Street name is required';
      if (!formData.barangayCode) newErrors.barangayCode = 'Barangay is required';
      if (!formData.cityMunicipalityCode)
        newErrors.cityMunicipalityCode = 'City/Municipality is required';
      if (!formData.provinceCode) newErrors.provinceCode = 'Province is required';
      if (!formData.regionCode) newErrors.regionCode = 'Region is required';
      if (formData.noOfFamilies < 1)
        newErrors.noOfFamilies = 'Number of families must be at least 1';
      if (formData.noOfHouseholdMembers < 0)
        newErrors.noOfHouseholdMembers = 'Number of household members cannot be negative';

      // Household Details validation
      if (!formData.householdType) newErrors.householdType = 'Household type is required';
      if (!formData.tenureStatus) newErrors.tenureStatus = 'Tenure status is required';
      if (formData.tenureStatus === 'others' && !formData.tenureOthersSpecify?.trim()) {
        newErrors.tenureOthersSpecify = 'Please specify tenure status';
      }
      if (!formData.householdUnit) newErrors.householdUnit = 'Household unit is required';
      if (!formData.householdName?.trim()) newErrors.householdName = 'Household name is required';
      if (!formData.householdHeadPosition)
        newErrors.householdHeadPosition = 'Head position is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      logError(error as Error, 'VALIDATION_ERROR');
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Find the first error field and scroll to it
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const action = mode === 'create' ? 'Creating' : 'Updating';
      logger.info(`${action} household`, {
        householdName: formData.householdName,
        barangayCode: formData.barangayCode,
        householdId,
      });

      let household;

      if (mode === 'create') {
        // Create household in database (code will be auto-generated by database function)
        const { data, error } = await supabase
          .from('households')
          .insert({
            name: formData.householdName,
            house_number: formData.houseNumber,
            street_id: formData.streetId || null,
            subdivision_id: formData.subdivisionId || null,
            barangay_code: formData.barangayCode,
            city_municipality_code: formData.cityMunicipalityCode,
            province_code: formData.provinceCode,
            region_code: formData.regionCode,
            no_of_families: formData.noOfFamilies,
            no_of_household_members: formData.noOfHouseholdMembers,
            no_of_migrants: formData.noOfMigrants,
            household_type: formData.householdType,
            tenure_status: formData.tenureStatus,
            tenure_others_specify: formData.tenureOthersSpecify || null,
            household_unit: formData.householdUnit,
            monthly_income: formData.monthlyIncome || null,
            household_head_id: formData.householdHeadId || null,
            household_head_position: formData.householdHeadPosition,
          })
          .select()
          .single();

        if (error) throw error;
        household = data;
      } else {
        // Update existing household
        if (!householdId) throw new Error('Household ID is required for updates');

        const { data, error } = await supabase
          .from('households')
          .update({
            name: formData.householdName,
            house_number: formData.houseNumber,
            street_id: formData.streetId || null,
            subdivision_id: formData.subdivisionId || null,
            barangay_code: formData.barangayCode,
            city_municipality_code: formData.cityMunicipalityCode,
            province_code: formData.provinceCode,
            region_code: formData.regionCode,
            no_of_families: formData.noOfFamilies,
            no_of_household_members: formData.noOfHouseholdMembers,
            no_of_migrants: formData.noOfMigrants,
            household_type: formData.householdType,
            tenure_status: formData.tenureStatus,
            tenure_others_specify: formData.tenureOthersSpecify || null,
            household_unit: formData.householdUnit,
            monthly_income: formData.monthlyIncome || null,
            household_head_id: formData.householdHeadId || null,
            household_head_position: formData.householdHeadPosition,
            updated_at: new Date().toISOString(),
          })
          .eq('id', householdId)
          .select()
          .single();

        if (error) throw error;
        household = data;
      }

      logger.info(`Household ${mode === 'create' ? 'created' : 'updated'} successfully`, {
        id: household.id,
        code: household.code,
      });

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['households'] });

      if (onSubmit) {
        await onSubmit(formData);
      } else if (mode === 'create') {
        router.push(`/households/${household.id}`);
      } else {
        // Switch to view mode after successful edit
        onModeChange?.('view');
      }
    } catch (error) {
      logError(error as Error, `HOUSEHOLD_${mode.toUpperCase()}_ERROR`);
      setErrors({
        code: `Failed to ${mode === 'create' ? 'create' : 'update'} household. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (_onCancel) {
      _onCancel();
    } else {
      router.push('/households');
    }
  };

  if (loadingAddress || (isAutoFilling && autoFillStatus === 'loading')) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 size-8 animate-spin rounded-full border-b-2 border-zinc-950"></div>
          <p className="text-sm text-zinc-600">
            {loadingAddress ? 'Loading address information...' : 'Auto-filling location fields...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
              {mode === 'create'
                ? 'Create New Household'
                : mode === 'edit'
                  ? 'Edit Household'
                  : 'Household Details'}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {mode === 'create'
                ? 'Fill in all required information to register a new household in the barangay.'
                : mode === 'edit'
                  ? 'Update the household information as needed.'
                  : 'View the household information and details.'}
            </p>
          </div>
          {mode !== 'create' && onModeChange && (
            <div className="flex gap-2">
              {mode === 'view' && (
                <Button variant="primary" onClick={() => onModeChange('edit')}>
                  Edit Household
                </Button>
              )}
              {mode === 'edit' && (
                <Button variant="secondary-outline" onClick={() => onModeChange('view')}>
                  Cancel Edit
                </Button>
              )}
            </div>
          )}
        </div>

        {autoFillStatus === 'failed' && (
          <div className="mt-4 rounded-lg bg-yellow-50 p-4 ring-1 ring-yellow-900/10 dark:bg-yellow-400/10 dark:ring-yellow-400/20">
            <div className="flex">
              <div className="shrink-0">
                <svg className="size-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Auto-fill Not Available
                </h4>
                <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Please manually select the location information.{' '}
                    {!user
                      ? 'Sign in for automatic population.'
                      : 'Location data could not be loaded automatically.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Section 1: Location & Demographics */}
        <LocationAndDemographicsForm
          mode={mode}
          formData={formData}
          onChange={handleInputChange}
          errors={errors}
          regionOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.regionCode
                ? [
                    {
                      value: formData.regionCode,
                      label: viewModeOptions.addressLabels.regionLabel || formData.regionCode,
                    },
                  ]
                : []
              : regionOptions
          }
          provinceOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.provinceCode
                ? [
                    {
                      value: formData.provinceCode,
                      label: viewModeOptions.addressLabels.provinceLabel || formData.provinceCode,
                    },
                  ]
                : []
              : provinceOptions
          }
          cityOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.cityMunicipalityCode
                ? [
                    {
                      value: formData.cityMunicipalityCode,
                      label:
                        viewModeOptions.addressLabels.cityLabel || formData.cityMunicipalityCode,
                    },
                  ]
                : []
              : cityOptions
          }
          barangayOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.barangayCode
                ? [
                    {
                      value: formData.barangayCode,
                      label: viewModeOptions.addressLabels.barangayLabel || formData.barangayCode,
                    },
                  ]
                : []
              : barangayOptions
          }
          regionsLoading={regionsLoading}
          provincesLoading={provincesLoading}
          citiesLoading={citiesLoading}
          barangaysLoading={barangaysLoading}
          onRegionChange={handleRegionChange}
          onProvinceChange={handleProvinceChange}
          onCityChange={handleCityChange}
          onBarangayChange={handleBarangayChange}
        />

        {/* Section 2: Household Details */}
        <HouseholdDetailsForm
          mode={mode}
          formData={formData}
          onChange={handleInputChange}
          errors={errors}
          // Head of family options would be populated from residents
          householdHeadOptions={
            mode === 'view' && viewModeOptions?.householdHeadLabel
              ? formData.householdHeadId
                ? [{ value: formData.householdHeadId, label: viewModeOptions.householdHeadLabel }]
                : []
              : []
          }
          householdHeadsLoading={false}
        />

        {/* Form Actions */}
        {mode !== 'view' && (
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button variant="secondary-outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating Household...'
                  : 'Saving Changes...'
                : mode === 'create'
                  ? 'Create Household'
                  : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
