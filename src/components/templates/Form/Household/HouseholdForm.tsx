'use client';

import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components';
import {
  LocationAndDemographicsForm,
  HouseholdDetailsForm,
} from '@/components/organisms/FormSection/Household';
import { useAuth } from '@/contexts';
import { useUserBarangay } from '@/hooks/utilities';
// REMOVED: @/lib barrel import - replace with specific module;
import { container } from '@/services/container';
import { logError } from '@/utils/shared/errorUtils';
import { supabase } from '@/lib/data/supabase';

// Import our new Form/Household components

// Import molecules and atoms

import { HouseholdFormData } from '@/types/app/ui/forms';

export type { HouseholdFormData };
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
    household_typeLabels?: any;
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
  const { user, userProfile } = useAuth();

  const [errors, setErrors] = useState<Partial<Record<keyof HouseholdFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Production-ready auto-fill state management
  const [autoFillAttempted, setAutoFillAttempted] = useState(false);
  const [autoFillStatus, setAutoFillStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>(
    'idle'
  );


  const [formData, setFormData] = useState<HouseholdFormData>(() => ({
    // Required fields with defaults
    code: '',
    barangay_code: '',
    city_municipality_code: '',
    region_code: '',
    house_number: '',
    street_id: '',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),

    // Location and Demographics
    subdivision_id: null,
    province_code: null,
    zip_code: null,
    no_of_families: 1,
    no_of_household_members: 0,
    no_of_migrants: 0,

    // Household Details
    name: null,
    address: null,
    household_type: null,
    tenure_status: null,
    tenure_others_specify: null,
    household_unit: null,
    monthly_income: null,
    income_class: null,
    household_head_id: null,
    household_head_position: null,
    created_by: null,
    updated_by: null,

    // Merge initial data if provided
    ...initialData,
  }));

  // User's assigned barangay address (auto-populated)
  const { address: userAddress, loading: loadingAddress } = useUserBarangay();

  // Load location options using React Query directly - always load regions
  const { data: regionOptions = [], isLoading: regionsLoading } = useQuery({
    queryKey: ['addresses', 'regions'],
    queryFn: async () => {
      const result = await container.getGeographicService().getRegions();
      return result.success 
        ? (result.data || []).map(region => ({ value: region.code, label: region.name }))
        : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Load provinces when we have a region (either from form data or user selection)
  const shouldLoadProvinces = formData.region_code || userAddress?.region_code;

  const { data: provinceOptions = [], isLoading: provincesLoading } = useQuery({
    queryKey: [
      'addresses',
      'provinces',
      shouldLoadProvinces ? formData.region_code || userAddress?.region_code : '',
    ],
    queryFn: async () => {
      const region_code = formData.region_code || userAddress?.region_code;
      if (!region_code) return [];
      const result = await container.getGeographicService().getProvinces(region_code);
      return result.success 
        ? (result.data || []).map(province => ({ value: province.code, label: province.name }))
        : [];
    },
    enabled: !!shouldLoadProvinces,
    staleTime: 10 * 60 * 1000,
  });

  // Load cities when we have a province
  const shouldLoadCities = formData.province_code || userAddress?.province_code;

  const { data: cityOptions = [], isLoading: citiesLoading } = useQuery({
    queryKey: [
      'addresses',
      'cities',
      shouldLoadCities ? formData.province_code || userAddress?.province_code : '',
    ],
    queryFn: async () => {
      const province_code = formData.province_code || userAddress?.province_code;
      if (!province_code) return [];
      const result = await container.getGeographicService().getCities(province_code);
      const cityOptions = result.success 
        ? (result.data || []).map(city => ({ value: city.code, label: city.name }))
        : [];
      console.log('🏙️ Cities loaded:', cityOptions.length, 'cities for province:', province_code);
      return cityOptions;
    },
    enabled: !!shouldLoadCities,
    staleTime: 10 * 60 * 1000,
  });

  // Load barangays when we have a city
  const shouldLoadBarangays =
    formData.city_municipality_code || userAddress?.city_municipality_code;

  const { data: barangayOptions = [], isLoading: barangaysLoading } = useQuery({
    queryKey: [
      'addresses',
      'barangays',
      shouldLoadBarangays
        ? formData.city_municipality_code || userAddress?.city_municipality_code
        : '',
    ],
    queryFn: async () => {
      const cityCode = formData.city_municipality_code || userAddress?.city_municipality_code;
      if (!cityCode) return [];
      const result = await container.getGeographicService().getBarangays(cityCode);
      return result.success 
        ? (result.data || []).map(barangay => ({ value: barangay.code, label: barangay.name }))
        : [];
    },
    enabled: !!shouldLoadBarangays,
    staleTime: 10 * 60 * 1000,
  });

  // Enhanced auto-fill with multiple strategies and better debugging
  useEffect(() => {
    const performAutoFill = async () => {
      console.log('🔄 Auto-fill check started');

      // Only attempt once per form session (unless it was unsuccessful)
      if (autoFillAttempted && formData.region_code && formData.barangay_code) {
        console.log('⏭️ Auto-fill already completed successfully, skipping');
        return;
      }

      // Skip if form already has location data
      if (
        formData.region_code ||
        formData.province_code ||
        formData.city_municipality_code ||
        formData.barangay_code
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
            const result = await container.getGeographicService().buildCompleteAddress({
              barangayCode: userProfile.barangay_code
            });
            addressData = result.success ? result.data : null;
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
    formData.region_code,
    formData.province_code,
    formData.city_municipality_code,
    formData.barangay_code,
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
  const handleRegionChange = (region_code: string) => {
    setFormData(prev => ({
      ...prev,
      region_code,
      province_code: '',
      city_municipality_code: '',
      barangay_code: '',
      subdivision_id: '',
      street_id: '',
    }));
  };

  const handleProvinceChange = (province_code: string) => {
    setFormData(prev => ({
      ...prev,
      province_code,
      city_municipality_code: '',
      barangay_code: '',
      subdivision_id: '',
      street_id: '',
    }));
  };

  const handleCityChange = (cityCode: string) => {
    setFormData(prev => ({
      ...prev,
      city_municipality_code: cityCode,
      barangay_code: '',
      subdivision_id: '',
      street_id: '',
    }));
  };

  const handleBarangayChange = (barangay_code: string) => {
    setFormData(prev => ({
      ...prev,
      barangay_code,
      subdivision_id: '',
      street_id: '',
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HouseholdFormData, string>> = {};

    try {
      // Location and Demographics validation
      if (!formData.house_number?.trim()) newErrors.house_number = 'House number is required';
      if (!formData.street_id?.trim()) newErrors.street_id = 'Street name is required';
      if (!formData.barangay_code) newErrors.barangay_code = 'Barangay is required';
      if (!formData.city_municipality_code)
        newErrors.city_municipality_code = 'City/Municipality is required';
      if (!formData.province_code) newErrors.province_code = 'Province is required';
      if (!formData.region_code) newErrors.region_code = 'Region is required';
      if ((formData.no_of_families ?? 0) < 1)
        newErrors.no_of_families = 'Number of families must be at least 1';
      if ((formData.no_of_household_members ?? 0) < 0)
        newErrors.no_of_household_members = 'Number of household members cannot be negative';

      // Household Details validation
      if (!formData.household_type) newErrors.household_type = 'Household type is required';
      if (!formData.tenure_status) newErrors.tenure_status = 'Tenure status is required';
      if (formData.tenure_status === 'others' && !formData.tenure_others_specify?.trim()) {
        newErrors.tenure_others_specify = 'Please specify tenure status';
      }
      if (!formData.household_unit) newErrors.household_unit = 'Household unit is required';
      if (!formData.name?.trim()) newErrors.name = 'Household name is required';
      if (!formData.household_head_position)
        newErrors.household_head_position = 'Head position is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      logError(error as Error, { operation: 'VALIDATION_ERROR' });
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
      console.log(`${action} household`, {
        name: formData.name,
        barangay_code: formData.barangay_code,
        householdId,
      });

      let household;

      if (mode === 'create') {
        // Create household in database (code will be auto-generated by database function)
        const { data, error } = await supabase
          .from('households')
          .insert({
            name: formData.name,
            house_number: formData.house_number,
            street_id: formData.street_id || null,
            subdivision_id: formData.subdivision_id || null,
            barangay_code: formData.barangay_code,
            city_municipality_code: formData.city_municipality_code,
            province_code: formData.province_code,
            region_code: formData.region_code,
            no_of_families: formData.no_of_families,
            no_of_household_members: formData.no_of_household_members,
            no_of_migrants: formData.no_of_migrants,
            household_type: formData.household_type,
            tenure_status: formData.tenure_status,
            tenure_others_specify: formData.tenure_others_specify || null,
            household_unit: formData.household_unit,
            monthly_income: formData.monthly_income || null,
            household_head_id: formData.household_head_id || null,
            household_head_position: formData.household_head_position,
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
            name: formData.name,
            house_number: formData.house_number,
            street_id: formData.street_id || null,
            subdivision_id: formData.subdivision_id || null,
            barangay_code: formData.barangay_code,
            city_municipality_code: formData.city_municipality_code,
            province_code: formData.province_code,
            region_code: formData.region_code,
            no_of_families: formData.no_of_families,
            no_of_household_members: formData.no_of_household_members,
            no_of_migrants: formData.no_of_migrants,
            household_type: formData.household_type,
            tenure_status: formData.tenure_status,
            tenure_others_specify: formData.tenure_others_specify || null,
            household_unit: formData.household_unit,
            monthly_income: formData.monthly_income || null,
            household_head_id: formData.household_head_id || null,
            household_head_position: formData.household_head_position,
            updated_at: new Date().toISOString(),
          })
          .eq('id', householdId)
          .select()
          .single();

        if (error) throw error;
        household = data;
      }

      console.log(`Household ${mode === 'create' ? 'created' : 'updated'} successfully`, {
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
      logError(error as Error, { operation: `HOUSEHOLD_${mode.toUpperCase()}_ERROR` });
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
          formData={{
            // Map new snake_case to old camelCase for compatibility
            houseNumber: formData.house_number || '',
            streetId: formData.street_id || '',
            subdivisionId: formData.subdivision_id || '',
            barangayCode: formData.barangay_code || '',
            cityMunicipalityCode: formData.city_municipality_code || '',
            provinceCode: formData.province_code || '',
            regionCode: formData.region_code || '',
            noOfFamilies: formData.no_of_families || 1,
            noOfHouseholdMembers: formData.no_of_household_members || 0,
            noOfMigrants: formData.no_of_migrants || 0,
          }}
          onChange={handleInputChange}
          errors={errors}
          regionOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.region_code
                ? [
                    {
                      value: formData.region_code,
                      label: viewModeOptions.addressLabels.regionLabel || formData.region_code,
                    },
                  ]
                : []
              : regionOptions
          }
          provinceOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.province_code
                ? [
                    {
                      value: formData.province_code,
                      label: viewModeOptions.addressLabels.provinceLabel || formData.province_code,
                    },
                  ]
                : []
              : provinceOptions
          }
          cityOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.city_municipality_code
                ? [
                    {
                      value: formData.city_municipality_code,
                      label:
                        viewModeOptions.addressLabels.cityLabel || formData.city_municipality_code,
                    },
                  ]
                : []
              : cityOptions
          }
          barangayOptions={
            mode === 'view' && viewModeOptions?.addressLabels
              ? formData.barangay_code
                ? [
                    {
                      value: formData.barangay_code,
                      label: viewModeOptions.addressLabels.barangayLabel || formData.barangay_code,
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
          formData={{
            // Map new snake_case to old camelCase for compatibility
            householdType: formData.household_type || '',
            tenureStatus: formData.tenure_status || '',
            tenureOthersSpecify: formData.tenure_others_specify || '',
            householdUnit: formData.household_unit || '',
            householdName: formData.name || '',
            monthlyIncome: formData.monthly_income || 0,
            householdHeadId: formData.household_head_id || '',
            householdHeadPosition: formData.household_head_position || '',
          }}
          onChange={handleInputChange}
          errors={errors}
          // Head of family options would be populated from residents
          householdHeadOptions={
            mode === 'view' && viewModeOptions?.householdHeadLabel
              ? formData.household_head_id
                ? [{ value: formData.household_head_id, label: viewModeOptions.householdHeadLabel }]
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
