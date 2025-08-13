/**
 * Household Creation Hook
 * 
 * @description Custom hook for managing household creation workflow including
 * form validation, PSGC-compliant code generation, and address resolution.
 * Handles the complete household registration process with proper error handling.
 * 
 * @example
 * ```typescript
 * function CreateHouseholdForm() {
 *   const {
 *     formData,
 *     errors,
 *     isSubmitting,
 *     handleInputChange,
 *     createHousehold
 *   } = useHouseholdCreation();
 * 
 *   const handleSubmit = async () => {
 *     const householdCode = await createHousehold();
 *     if (householdCode) {
 *       router.push(`/households/${householdCode}`);
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={formData.house_number}
 *         onChange={(e) => handleInputChange('house_number', e.target.value)}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logger, logError } from '@/lib/secure-logger';

/**
 * Form data structure for household creation
 */
interface HouseholdFormData {
  /** House/building number */
  house_number: string;
  /** Selected street ID */
  street_id: string;
  /** Optional subdivision ID */
  subdivision_id: string;
}

/**
 * Address hierarchy information for display purposes
 */
interface AddressDisplayInfo {
  /** Region name */
  region: string;
  /** Province name */
  province: string;
  /** City/Municipality name with type */
  cityMunicipality: string;
  /** Barangay name */
  barangay: string;
}

/**
 * Return type for useHouseholdCreation hook
 */
interface UseHouseholdCreationReturn {
  /** Current form data state */
  formData: HouseholdFormData;
  /** Field-specific validation errors */
  errors: Partial<Record<keyof HouseholdFormData, string>>;
  /** Whether form submission is in progress */
  isSubmitting: boolean;
  /** Resolved address information for display */
  addressDisplayInfo: AddressDisplayInfo;
  /** Handler for form field changes */
  handleInputChange: (field: keyof HouseholdFormData, value: string) => void;
  /** Validates the current form state */
  validateForm: () => boolean;
  /** Creates the household and returns the generated code */
  createHousehold: () => Promise<string | null>;
  /** Resets form to initial state */
  resetForm: () => void;
}

/**
 * Custom hook for household creation workflow
 * 
 * @description Manages the complete household creation process including:
 * - Form state management with validation
 * - PSGC-compliant household code generation
 * - Address hierarchy resolution and display
 * - Database integration with proper error handling
 * 
 * @returns {UseHouseholdCreationReturn} Object containing form state and handlers
 * 
 * @example
 * ```typescript
 * const {
 *   formData,
 *   errors,
 *   isSubmitting,
 *   addressDisplayInfo,
 *   handleInputChange,
 *   validateForm,
 *   createHousehold,
 *   resetForm
 * } = useHouseholdCreation();
 * 
 * // Handle form submission
 * const handleSubmit = async (e: FormEvent) => {
 *   e.preventDefault();
 *   if (validateForm()) {
 *     const householdCode = await createHousehold();
 *     if (householdCode) {
 *       // Success - redirect or show success message
 *       console.log('Household created:', householdCode);
 *     }
 *   }
 * };
 * ```
 */
export function useHouseholdCreation(): UseHouseholdCreationReturn {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState<HouseholdFormData>({
    house_number: '',
    street_id: '',
    subdivision_id: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof HouseholdFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressDisplayInfo, setAddressDisplayInfo] = useState<AddressDisplayInfo>({
    region: 'Loading...',
    province: 'Loading...',
    cityMunicipality: 'Loading...',
    barangay: 'Loading...',
  });

  /**
   * Handles form field changes and clears related errors
   * 
   * @param field - The field being updated
   * @param value - The new field value
   */
  const handleInputChange = useCallback((field: keyof HouseholdFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * Validates the current form state
   * 
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof HouseholdFormData, string>> = {};

    if (!formData.street_id.trim()) {
      newErrors.street_id = 'Street is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Generates a PSGC-compliant household code
   * 
   * @description Creates a unique household identifier following the format:
   * RRPPMMBBB-SSSS-TTTT-HHHH where:
   * - RRPPMMBBB: 9-digit barangay code
   * - SSSS: Street/Sitio code (0000 for now)
   * - TTTT: Type code (0001 for household)
   * - HHHH: Sequential household number
   * 
   * @returns {Promise<string>} Generated household code
   * 
   * @example
   * ```typescript
   * // For barangay 137404001, this might generate:
   * // "137404001-0000-0001-0042"
   * const code = await generateHouseholdCode();
   * ```
   */
  const generateHouseholdCode = useCallback(async (): Promise<string> => {
    const barangayCode = userProfile?.barangay_code || '000000000';

    // Get next household sequence number for this barangay
    const { count } = await supabase
      .from('households')
      .select('*', { count: 'exact', head: true })
      .eq('barangay_code', barangayCode);

    const nextSequence = (count || 0) + 1;

    // Format: RRPPMMBBB-SSSS-TTTT-HHHH
    return `${barangayCode}-0000-0001-${nextSequence.toString().padStart(4, '0')}`;
  }, [userProfile?.barangay_code]);

  /**
   * Derives higher-level geographic codes from barangay code
   * 
   * @description Extracts region, province, and city/municipality codes
   * from the 9-digit PSGC barangay code following the format:
   * RRPPMMBBB (Region-Province-City/Municipality-Barangay)
   * 
   * @param barangayCode - 9-digit PSGC barangay code
   * @returns Geographic code hierarchy or null if invalid
   * 
   * @example
   * ```typescript
   * const codes = deriveGeographicCodes('137404001');
   * // Returns: {
   * //   region_code: '13',
   * //   province_code: '1374',
   * //   city_municipality_code: '137404'
   * // }
   * ```
   */
  const deriveGeographicCodes = useCallback((barangayCode: string) => {
    if (barangayCode.length !== 9) return null;

    const regionCode = barangayCode.substring(0, 2);
    const provinceCode = barangayCode.substring(0, 4);
    const cityMunicipalityCode = barangayCode.substring(0, 6);

    return {
      region_code: regionCode,
      province_code: provinceCode,
      city_municipality_code: cityMunicipalityCode,
    };
  }, []);

  /**
   * Loads and resolves complete address hierarchy for display
   * 
   * @description Performs sequential database queries to build complete
   * address information from barangay code up to region level.
   * Uses fallback values if any part of the hierarchy is missing.
   * 
   * @param barangayCode - 9-digit PSGC barangay code
   * 
   * @example
   * ```typescript
   * await loadAddressDisplayInfo('137404001');
   * // Updates addressDisplayInfo state with:
   * // {
   * //   region: "NATIONAL CAPITAL REGION (NCR)",
   * //   province: "METRO MANILA",
   * //   cityMunicipality: "QUEZON CITY (City)",
   * //   barangay: "BARANGAY BAGONG LIPUNAN NG CRAME"
   * // }
   * ```
   */
  const loadAddressDisplayInfo = useCallback(async (barangayCode: string) => {
    try {
      logger.debug('Loading address display info', { barangayCode });

      const addressInfo: AddressDisplayInfo = {
        region: 'Region information not available',
        province: 'Province information not available',
        cityMunicipality: 'City/Municipality information not available',
        barangay: `Barangay ${barangayCode}`,
      };

      // Sequential queries for better reliability
      try {
        const { data: barangayData } = await supabase
          .from('psgc_barangays')
          .select('name, city_municipality_code')
          .eq('code', barangayCode)
          .single();

        if (barangayData) {
          addressInfo.barangay = barangayData.name;

          const { data: cityData } = await supabase
            .from('psgc_cities_municipalities')
            .select('name, type, province_code')
            .eq('code', barangayData.city_municipality_code)
            .single();

          if (cityData) {
            addressInfo.cityMunicipality = `${cityData.name} (${cityData.type})`;

            const { data: provinceData } = await supabase
              .from('psgc_provinces')
              .select('name, region_code')
              .eq('code', cityData.province_code)
              .single();

            if (provinceData) {
              addressInfo.province = provinceData.name;

              const { data: regionData } = await supabase
                .from('psgc_regions')
                .select('name')
                .eq('code', provinceData.region_code)
                .single();

              if (regionData) {
                addressInfo.region = regionData.name;
              }
            }
          }
        }
      } catch (error) {
        logger.warn('Error loading PSGC data', { error });
      }

      setAddressDisplayInfo(addressInfo);
    } catch (error) {
      logger.warn('Address info loading failed', { error });
      setAddressDisplayInfo({
        region: 'Region information not available',
        province: 'Province information not available',
        cityMunicipality: 'City/Municipality information not available',
        barangay: `Barangay ${barangayCode}`,
      });
    }
  }, []);

  /**
   * Creates a new household in the database
   * 
   * @description Validates form data, generates PSGC-compliant household code,
   * derives geographic codes, and inserts the household record.
   * Handles all error cases and provides detailed logging.
   * 
   * @returns {Promise<string | null>} Generated household code on success, null on failure
   * 
   * @throws {Error} Database insertion errors
   * 
   * @example
   * ```typescript
   * const handleSubmit = async () => {
   *   if (validateForm()) {
   *     const householdCode = await createHousehold();
   *     if (householdCode) {
   *       // Success - redirect to household detail page
   *       router.push(`/households/${householdCode}`);
   *     } else {
   *       // Error occurred - check errors state for details
   *       console.error('Failed to create household');
   *     }
   *   }
   * };
   * ```
   */
  const createHousehold = useCallback(async (): Promise<string | null> => {
    if (!validateForm()) {
      return null;
    }

    if (!userProfile?.barangay_code) {
      setErrors({ street_id: 'Unable to create household: No barangay assignment found' });
      return null;
    }

    setIsSubmitting(true);

    try {
      logger.info('Creating household', { barangayCode: userProfile.barangay_code });

      const actualBarangayCode = userProfile.barangay_code;
      const actualDerivedCodes = deriveGeographicCodes(actualBarangayCode);
      const householdCode = await generateHouseholdCode();

      // Create household record with proper schema fields
      const householdData = {
        code: householdCode,
        house_number: formData.house_number.trim() || '1',
        street_id: formData.street_id,
        subdivision_id: formData.subdivision_id || null,
        barangay_code: actualBarangayCode,
        city_municipality_code: actualDerivedCodes?.city_municipality_code,
        province_code: actualDerivedCodes?.province_code,
        region_code: actualDerivedCodes?.region_code,
        created_by: userProfile.id,
      };

      const { data, error } = await supabase
        .from('households')
        .insert([householdData])
        .select('code')
        .single();

      if (error) {
        logger.error('Error creating household', { error });
        setErrors({ street_id: `Failed to create household: ${error.message}` });
        return null;
      }

      logger.info('Household created successfully', { householdCode: data.code });
      return data.code;
    } catch (error) {
      logError(error as Error, 'HOUSEHOLD_CREATION_ERROR');
      setErrors({ street_id: 'An unexpected error occurred. Please try again.' });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, userProfile, validateForm, deriveGeographicCodes, generateHouseholdCode]);

  /**
   * Resets the form to its initial state
   * 
   * @description Clears all form data and validation errors.
   * Useful for "Cancel" buttons or after successful submission.
   */
  const resetForm = useCallback(() => {
    setFormData({
      house_number: '',
      street_id: '',
      subdivision_id: '',
    });
    setErrors({});
  }, []);

  // Load address display info when userProfile changes
  useCallback(() => {
    if (userProfile?.barangay_code) {
      loadAddressDisplayInfo(userProfile.barangay_code);
    }
  }, [userProfile?.barangay_code, loadAddressDisplayInfo]);

  return {
    formData,
    errors,
    isSubmitting,
    addressDisplayInfo,
    handleInputChange,
    validateForm,
    createHousehold,
    resetForm,
  };
}