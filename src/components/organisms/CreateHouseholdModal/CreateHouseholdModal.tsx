'use client';

import React, { useState, useEffect } from 'react';

import { useAuth } from '@/contexts';
// REMOVED: @/lib barrel import - replace with specific module;
import type { HouseholdModalFormData as HouseholdFormData } from '@/types/app/ui/components';

import { Button } from '../../atoms';
import AccessibleModal from '../../molecules/AccessibleModal';
import { SelectField } from '../../molecules/FieldSet/SelectField';

interface CreateHouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHouseholdCreated: (householdCode: string) => void;
}

interface RegionData {
  code: string;
  name: string;
}

interface ProvinceData {
  code: string;
  name: string;
  psgc_regions: RegionData;
}

interface CityMunicipalityData {
  code: string;
  name: string;
  type: string;
  psgc_provinces: ProvinceData;
}

interface BarangayData {
  code: string;
  name: string;
  psgc_cities_municipalities: CityMunicipalityData;
}

interface AddressHierarchy {
  barangay_code: string;
  barangay_name?: string;
  city_municipality_code: string | null;
  city_municipality_name?: string;
  city_municipality_type?: string;
  province_code: string | null;
  province_name?: string;
  region_code: string | null;
  region_name?: string;
}

export default function CreateHouseholdModal({
  isOpen,
  onClose,
  onHouseholdCreated,
}: CreateHouseholdModalProps) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState<HouseholdFormData>({
    house_number: '',
    street_id: '',
    subdivision_id: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof HouseholdFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof HouseholdFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HouseholdFormData, string>> = {};

    if (!formData.street_id.trim()) {
      newErrors.street_id = 'Street is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateHouseholdCode = async (): Promise<string> => {
    // Generate PSGC-compliant household code: RRPPMMBBB-SSSS-TTTT-HHHH
    const barangayCode = userProfile?.barangay_code || '000000000';

    // Get next household sequence number for this barangay
    const { count } = await supabase
      .from('households')
      .select('*', { count: 'exact', head: true })
      .eq('barangay_code', barangayCode);

    const nextSequence = (count || 0) + 1;

    // Format: RRPPMMBBB-SSSS-TTTT-HHHH
    // RRPPMMBBB = Full barangay code (9 digits)
    // SSSS = Subdivision (0000 = no subdivision)
    // TTTT = Street (0001 = default street)
    // HHHH = House sequence number
    return `${barangayCode}-0000-0001-${nextSequence.toString().padStart(4, '0')}`;
  };

  const deriveGeographicCodes = (barangayCode: string) => {
    // Extract geographic codes from barangay code
    // Format: RRPPCCBBB where RR=region, PP=province, CC=city/municipality, BBB=barangay
    if (barangayCode.length !== 9) return null;

    const regionCode = barangayCode.substring(0, 2); // Just the first 2 digits
    const provinceCode = barangayCode.substring(0, 4); // First 4 digits
    const cityMunicipalityCode = barangayCode.substring(0, 6); // First 6 digits

    return {
      region_code: regionCode,
      province_code: provinceCode,
      city_municipality_code: cityMunicipalityCode,
    };
  };

  const [addressDisplayInfo, setAddressDisplayInfo] = useState({
    region: 'Loading...',
    province: 'Loading...',
    cityMunicipality: 'Loading...',
    barangay: 'Loading...',
  });

  // Load address display info from database
  const loadAddressDisplayInfo = async (barangayCode: string) => {
    try {
      logger.debug('Loading address display info', { barangayCode });

      // Check if user is authenticated before making database queries
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        logger.debug('No active session, skipping address info load');
        setAddressDisplayInfo({
          region: 'Session required',
          province: 'Session required',
          cityMunicipality: 'Session required',
          barangay: 'Session required',
        });
        return;
      }

      // Validate barangay code before querying
      if (!barangayCode || barangayCode.trim() === '') {
        logger.warn('Empty barangay code provided', { barangayCode });
        setAddressDisplayInfo({
          region: 'Region information not available',
          province: 'Province information not available',
          cityMunicipality: 'City/Municipality information not available',
          barangay: 'Barangay information not available',
        });
        return;
      }

      // Use our API endpoint to get full address hierarchy (avoids complex nested query issues)
      logger.debug('Querying PSGC lookup API for barangay', { barangayCode });
      const response = await fetch(`/api/psgc/lookup?code=${encodeURIComponent(barangayCode)}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      const barangayData = result.data;
      const error = result.error;

      if (error) {
        logger.error('Error loading address display info', {
          error: error?.message || 'Unknown error',
          barangayCode,
          errorCode: error?.code || 'Unknown code',
          errorDetails: error?.details || 'No details',
          fullError: JSON.stringify(error),
        });
        setAddressDisplayInfo({
          region: 'Region information not available',
          province: 'Province information not available',
          cityMunicipality: 'City/Municipality information not available',
          barangay: `Barangay ${barangayCode}`,
        });
        return;
      }

      if (barangayData) {
        // API returns flattened structure
        setAddressDisplayInfo({
          region: barangayData.region_name || 'Region information not available',
          province: barangayData.province_name || 'Province information not available',
          cityMunicipality: barangayData.city_type
            ? `${barangayData.city_name} (${barangayData.city_type})`
            : barangayData.city_name || 'City/Municipality information not available',
          barangay: barangayData.name || barangayData.barangay_name || `Barangay ${barangayCode}`,
        });
        logger.debug('Loaded address display info from database');
      }
    } catch (error) {
      logger.error('Exception in loadAddressDisplayInfo', {
        error: error instanceof Error ? error.message : 'Unknown error',
        barangayCode,
        errorType: typeof error,
        fullError: JSON.stringify(error),
      });
      logError(error as Error, 'ADDRESS_INFO_LOAD_ERROR');
      setAddressDisplayInfo({
        region: 'Region information not available',
        province: 'Province information not available',
        cityMunicipality: 'City/Municipality information not available',
        barangay: `Barangay ${barangayCode}`,
      });
    }
  };

  // Load address info when userProfile changes
  useEffect(() => {
    // Early exit if modal is not open to prevent unnecessary operations
    if (!isOpen) {
      return;
    }

    // Only attempt to load address info if user is properly authenticated and has profile
    if (userProfile?.barangay_code && userProfile.id) {
      loadAddressDisplayInfo(userProfile.barangay_code);
    } else {
      logger.debug('No barangay code or user ID in profile', {
        hasBarangayCode: !!userProfile?.barangay_code,
        hasUserId: !!userProfile?.id,
        isModalOpen: isOpen,
        userProfile,
      });
      // Set fallback info when no barangay code is available
      setAddressDisplayInfo({
        region: 'Authentication required',
        province: 'Authentication required',
        cityMunicipality: 'Authentication required',
        barangay: 'Authentication required',
      });
    }
  }, [userProfile?.barangay_code, userProfile?.id, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!userProfile?.barangay_code) {
      alert('Unable to create household: No barangay assignment found');
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info('Creating household', { barangayCode: userProfile.barangay_code });

      // Try to get address hierarchy info, fallback to direct table queries if view doesn't exist
      let addressInfo: AddressHierarchy | null = null;

      try {
        logger.debug('Attempting to query psgc_address_hierarchy view');
        const { data, error } = await supabase
          .from('psgc_address_hierarchy')
          .select('*')
          .eq('barangay_code', userProfile.barangay_code)
          .single();

        if (error) {
          logger.debug('View query error', { error });
        } else {
          logger.debug('View query successful', { hasData: !!data });
          addressInfo = data;
        }
      } catch (viewError) {
        logger.debug('Address hierarchy view not available, using direct queries', {
          error: viewError,
        });
      }

      // If view query failed, get address info from individual tables
      if (!addressInfo) {
        logger.debug('Using fallback query to get address info');
        try {
          // Use our API endpoint to get barangay info (avoids complex nested query issues)
          logger.debug('Using PSGC lookup API for fallback query');
          const response = await fetch(
            `/api/psgc/lookup?code=${encodeURIComponent(userProfile.barangay_code)}`
          );

          let barangayData = null;
          let barangayError = null;

          if (!response.ok) {
            barangayError = { message: `API request failed: ${response.status}` };
            logger.error('Error fetching barangay info', { error: barangayError });
            logger.debug('Fallback query failed, will use minimal data approach');
          } else {
            const result = await response.json();
            barangayData = result.data;
            barangayError = result.error;

            if (barangayError) {
              logger.error('Error fetching barangay info', { error: barangayError });
              logger.debug('Fallback query failed, will use minimal data approach');
            }
          }

          if (barangayData && !barangayError) {
            logger.debug('Fallback query successful', { hasData: !!barangayData });

            // Map the flattened API response data to expected format
            addressInfo = {
              barangay_code: barangayData.code || barangayData.barangay_code,
              barangay_name: barangayData.name || barangayData.barangay_name,
              city_municipality_code: barangayData.city_code,
              city_municipality_name: barangayData.city_name,
              city_municipality_type: barangayData.city_type,
              province_code: barangayData.province_code,
              province_name: barangayData.province_name,
              region_code: barangayData.region_code,
              region_name: barangayData.region_name,
            };
          }
        } catch (fallbackError) {
          logError(fallbackError as Error, 'FALLBACK_ADDRESS_QUERY_ERROR');
        }
      }

      // If both queries failed, use minimal data approach
      if (!addressInfo) {
        logger.debug('Creating household with minimal data - no PSGC lookup needed');

        // Final fallback - derive geographic codes from barangay code
        const derivedCodes = deriveGeographicCodes(userProfile.barangay_code);
        addressInfo = {
          barangay_code: userProfile.barangay_code,
          region_code: derivedCodes?.region_code || null,
          province_code: derivedCodes?.province_code || null,
          city_municipality_code: derivedCodes?.city_municipality_code || null,
        };
        logger.debug('Using minimal fallback data', { addressInfo });
      }

      logger.debug('Final address info', { addressInfo });

      // Debug: Check current user and auth state
      const {
        data: { user },
      } = await supabase.auth.getUser();
      logger.debug('Authentication state', {
        userId: user?.id,
        profileId: userProfile.id,
        barangayCode: userProfile.barangay_code,
        authMatch: user?.id === userProfile.id,
      });

      // Test RLS policy by checking if user can query their own profile
      const { data: testProfile, error: testProfileError } = await supabase
        .from('auth_user_profiles')
        .select('id, barangay_code, is_active, role_id')
        .eq('id', user?.id)
        .single();

      logger.debug('User profile data', { hasProfile: !!testProfile, error: testProfileError });

      // Check if user has proper role
      if (testProfile?.role_id) {
        const { data: roleData, error: roleError } = await supabase
          .from('auth_roles')
          .select('id, name')
          .eq('id', testProfile.role_id)
          .single();

        logger.debug('User role data', { hasRole: !!roleData, error: roleError });
      }

      // Fix: If user is not active, make them active
      if (testProfile && testProfile.is_active !== true) {
        logger.info('User is not active, updating profile to active status');
        const { error: updateError } = await supabase
          .from('auth_user_profiles')
          .update({ is_active: true })
          .eq('id', user?.id);

        if (updateError) {
          logger.error('Failed to activate user', { error: updateError });
        } else {
          logger.info('User successfully activated');
        }
      }

      // Use the actual user's barangay_code from the real profile data
      const actualBarangayCode = testProfile?.barangay_code || userProfile.barangay_code;

      // Derive geographic codes for the user's actual barangay
      const actualDerivedCodes = deriveGeographicCodes(actualBarangayCode);
      logger.debug('Derived geographic codes', { codes: actualDerivedCodes });

      // Use the selected street and subdivision IDs directly
      const streetId = formData.street_id;
      const subdivisionId = formData.subdivision_id || null;

      // Generate PSGC-compliant household code
      const householdCode = await generateHouseholdCode();

      // Create household record with proper schema fields
      const householdData = {
        code: householdCode,
        house_number: formData.house_number.trim() || '1', // Default to '1' if empty since it's required
        street_id: streetId, // Required UUID reference
        subdivision_id: subdivisionId, // Optional UUID reference
        barangay_code: actualBarangayCode,
        city_municipality_code: actualDerivedCodes?.city_municipality_code,
        province_code: actualDerivedCodes?.province_code,
        region_code: actualDerivedCodes?.region_code,
        created_by: userProfile.id,
      };

      logger.info('Creating household with data', { householdCode: householdData.code });

      const { data, error } = await supabase
        .from('households')
        .insert([householdData])
        .select('code, barangay_code, house_number')
        .single();

      if (error) {
        logger.error('Error creating household', { error });
        alert(`Failed to create household: ${error.message}`);
        return;
      }

      logger.info('Household created successfully', { householdCode: data.code });
      onHouseholdCreated(data.code);
      onClose();

      // Reset form
      setFormData({
        house_number: '',
        street_id: '',
        subdivision_id: '',
      });
      setErrors({});
    } catch (error) {
      logError(error as Error, 'HOUSEHOLD_CREATION_ERROR');
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form when closing
      setFormData({
        house_number: '',
        street_id: '',
        subdivision_id: '',
      });
      setErrors({});
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Household"
      description="Create a new household for this resident in your assigned barangay"
      size="md"
      closeOnEscape={!isSubmitting}
      closeOnBackdropClick={!isSubmitting}
      showCloseButton={!isSubmitting}
      footer={
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            variant="neutral"
            size="regular"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="household-form"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="regular"
            fullWidth
          >
            Create Household
          </Button>
        </div>
      }
    >
      {/* Address Info Display */}
      <div className="-m-4 mb-6 border-b border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-green-600">📍</span>
          <div>
            <h5 className="mb-2 font-medium text-green-800">Household Location</h5>
            <div className="space-y-1 text-sm text-green-700">
              <div>
                <strong>Region:</strong> {addressDisplayInfo.region}
              </div>
              <div>
                <strong>Province:</strong> {addressDisplayInfo.province}
              </div>
              <div>
                <strong>City/Municipality:</strong> {addressDisplayInfo.cityMunicipality}
              </div>
              <div>
                <strong>Barangay:</strong> {addressDisplayInfo.barangay}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Code: {userProfile?.barangay_code}
              </div>
              <div className="mt-2 text-xs text-green-600">
                All household geographic details are auto-populated from your barangay assignment.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form id="household-form" onSubmit={handleSubmit} className="space-y-4">
        {/* House Number */}
        <div>
          <label
            htmlFor="house-number"
            className="font-montserrat mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            House/Block/Lot Number
          </label>
          <input
            id="house-number"
            type="text"
            value={formData.house_number}
            onChange={e => handleInputChange('house_number', e.target.value)}
            placeholder="e.g., Blk 1 Lot 5, #123"
            className="font-montserrat w-full rounded-sm border border-gray-300 px-3 py-2 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            disabled={isSubmitting}
          />
        </div>

        {/* Subdivision */}
        <SelectField
          label="Subdivision/Zone/Sitio/Purok"
          selectProps={{
            placeholder: '🏘️ Select subdivision or create new',
            options: [
              { value: '', label: 'None' },
              { value: 'zone1', label: 'Zone 1' },
              { value: 'zone2', label: 'Zone 2' },
              { value: 'purok1', label: 'Purok 1' },
              { value: 'purok2', label: 'Purok 2' },
            ],
            value: formData.subdivision_id,
            onSelect: option => handleInputChange('subdivision_id', option?.value || ''),
            error: errors.subdivision_id,
          }}
          errorMessage={errors.subdivision_id}
        />

        {/* Street Name */}
        <SelectField
          label="Street Name *"
          required
          selectProps={{
            placeholder: '🛣️ Select street or create new',
            options: [
              { value: 'main_st', label: 'Main Street' },
              { value: 'market_st', label: 'Market Street' },
              { value: 'rizal_st', label: 'Rizal Street' },
              { value: 'national_rd', label: 'National Road' },
            ],
            value: formData.street_id,
            onSelect: option => handleInputChange('street_id', option?.value || ''),
            error: errors.street_id,
          }}
          errorMessage={errors.street_id}
        />

        {/* Info Note */}
        <div className="rounded border border-blue-200 bg-blue-50 p-4">
          <p className="font-montserrat text-sm text-gray-800 dark:text-gray-200">
            <strong>Note:</strong> This household will be created in your assigned barangay. You can
            assign a resident as the household head after creating the household.
          </p>
        </div>
      </form>
    </AccessibleModal>
  );
}
