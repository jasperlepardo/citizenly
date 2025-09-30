'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// SectoralBadges import removed - not currently used in this component
import { ResidentForm } from '@/components/templates/Form/Resident/ResidentForm';
import { useFieldLoading } from '@/hooks/utilities/useFieldLoading';
import { supabase } from '@/lib/data/supabase';
import { clientLogger, logError } from '@/lib/logging/client-logger';
// Remove unused enum imports - using types instead
import type { FormMode } from '@/types/app/ui/forms';
import type { ResidentWithRelations } from '@/types/domain/residents/core';
import type { SectoralInformation, ResidentFormData } from '@/types/domain/residents/forms';
import {
  CivilStatusEnum,
  CitizenshipEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  BloodTypeEnum,
  EthnicityEnum,
  ReligionEnum,
} from '@/types/infrastructure/database/database';
import { fetchWithAuth } from '@/utils/auth/sessionManagement';

// Tooltip component removed - not used in current implementation

export const dynamic = 'force-dynamic';

// Use consolidated ResidentWithRelations type instead of duplicate interface
type Resident = ResidentWithRelations;

function ResidentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const residentId = params.id as string;
  const [resident, setResident] = useState<Resident | null>(null);
  const [editedResident, setEditedResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('view');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Removed setCurrentFormData to prevent infinite re-render loops

  // Progressive loading states for different data sections
  const {
    loadingStates: sectionLoadingStates,
    setFieldLoading: setSectionLoading,
  } = useFieldLoading({
    basic_info: true,
    address_info: true,
    contact_info: true,
    education_info: true,
    employment_info: true,
    sectoral_info: true,
  });

  const loadAddressInfo = useCallback(async (residentData: Resident) => {
    setSectionLoading('address_info', true);
    try {
      const barangayCode = residentData.barangay_code;
      clientLogger.debug('Loading address information', { component: 'ResidentDetailsPage', action: 'load_address', data: { barangayCode } });

      const { data: addressViewData, error: viewError } = await supabase
        .from('psgc_address_hierarchy')
        .select('barangay_name, city_municipality_name, province_name, region_name, full_address')
        .eq('barangay_code', barangayCode)
        .single();

      if (addressViewData && !viewError) {
        (residentData as any).address_info = {
          barangay_name: addressViewData.barangay_name,
          city_municipality_name: addressViewData.city_municipality_name,
          province_name: addressViewData.province_name,
          region_name: addressViewData.region_name,
          full_address: addressViewData.full_address,
          barangay_code: barangayCode || '',
          city_municipality_code: '',
          region_code: '',
        };
        return;
      }

      await loadAddressFromIndividualTables(residentData);
    } catch (addressError) {
      clientLogger.warn('Address data lookup failed', { component: 'ResidentDetailsPage', action: 'address_lookup_failed', data: {
        error: addressError instanceof Error ? addressError.message : 'Unknown error',
      }});
    } finally {
      setSectionLoading('address_info', false);
    }
  }, [setSectionLoading]);

  const loadAddressFromIndividualTables = async (residentData: Resident) => {
    clientLogger.debug('Address view not available, trying individual table queries', { component: 'ResidentDetailsPage', action: 'fallback_address_query' });

    const barangayCode = residentData.barangay_code;
    const { data: barangayData, error: barangayError } = await supabase
      .from('psgc_barangays')
      .select('name, city_municipality_code')
      .eq('code', barangayCode)
      .single();

    if (!barangayData || barangayError) return;

    residentData.address_info = {
      barangay_name: barangayData.name,
      city_municipality_name: '',
      province_name: '',
      region_name: '',
      full_address: barangayData.name,
      barangay_code: barangayCode || '',
      city_municipality_code: barangayData.city_municipality_code,
      region_code: '',
    };

    const { data: cityData } = await supabase
      .from('psgc_cities_municipalities')
      .select('name, province_code, is_independent')
      .eq('code', barangayData.city_municipality_code)
      .single();

    if (!cityData || !residentData.address_info) return;

    residentData.address_info.city_municipality_name = cityData.name;
    residentData.address_info.full_address = `${barangayData.name}, ${cityData.name}`;

    if (cityData.is_independent || !cityData.province_code) return;

    const { data: provinceData } = await supabase
      .from('psgc_provinces')
      .select('name, region_code')
      .eq('code', cityData.province_code)
      .single();

    if (!provinceData || !residentData.address_info) return;

    residentData.address_info.province_name = provinceData.name;
    residentData.address_info.region_code = provinceData.region_code;

    const { data: regionData } = await supabase
      .from('psgc_regions')
      .select('name')
      .eq('code', provinceData.region_code)
      .single();

    if (regionData && residentData.address_info) {
      residentData.address_info.region_name = regionData.name;
    }
  };

  const loadOccupationInfo = async (residentData: Resident) => {
    console.log('🔍 Loading occupation info for resident:', residentData.id);
    console.log('🔍 Occupation code:', residentData.occupation_code);

    if (!residentData.occupation_code) {
      console.log('⚠️ No occupation code found for resident');
      return;
    }

    try {
      const { data: psocData, error } = await supabase
        .from('psoc_occupation_search')
        .select('occupation_code, occupation_title, level_type, occupation_description')
        .eq('occupation_code', residentData.occupation_code)
        .single();

      console.log('🔍 PSOC query result:', { psocData, error });

      if (psocData) {
        residentData.psoc_info = {
          title: psocData.occupation_title,
          level: psocData.level_type
        };
        console.log('✅ Occupation info loaded:', residentData.psoc_info);
      } else {
        console.log('⚠️ No PSOC data found for occupation code:', residentData.occupation_code);
      }
    } catch (psocError) {
      console.error('❌ PSOC data lookup failed:', psocError);
      clientLogger.warn('PSOC data lookup failed', { component: 'ResidentDetailsPage', action: 'psoc_lookup_failed', data: {
        error: psocError instanceof Error ? psocError.message : 'Unknown error',
      }});
    }
  };

  // Helper function: Query PSGC table by code
  const queryPSGCTable = async (table: string, code: string, level: string) => {
    const { data } = await supabase
      .from(table)
      .select('name, code')
      .eq('code', code)
      .single();

    return data ? { name: data.name, level } : null;
  };

  // Helper function: Get PSGC lookup configurations
  const getPSGCLookupConfig = (codeLength: number) => {
    const configs = [
      { table: 'psgc_barangays', level: 'barangay', minLength: 9 },
      { table: 'psgc_cities_municipalities', level: 'city_municipality', minLength: 6 },
      { table: 'psgc_provinces', level: 'province', minLength: 4 },
      { table: 'psgc_regions', level: 'region', minLength: 2 }
    ];

    return configs.filter(config => codeLength >= config.minLength);
  };

  // Helper function: Try multiple PSGC tables
  const tryPSGCLookup = async (code: string) => {
    const configs = getPSGCLookupConfig(code.length);

    for (const config of configs) {
      const result = await queryPSGCTable(config.table, code, config.level);
      if (result) return result;
    }

    return null;
  };

  const loadBirthPlaceInfo = async (residentData: Resident) => {
    if (!residentData.birth_place_code) {
      return;
    }

    try {
      const birthPlaceData = await tryPSGCLookup(residentData.birth_place_code);

      if (birthPlaceData) {
        // Birth place data found and ready for display
        clientLogger.info('Birth place data loaded successfully', {
          component: 'ResidentDetailsPage',
          action: 'birth_place_lookup_success',
          data: { level: birthPlaceData.level, name: birthPlaceData.name }
        });
      }
    } catch (birthPlaceError) {
      clientLogger.warn('Birth place data lookup failed', {
        component: 'ResidentDetailsPage',
        action: 'birth_place_lookup_failed',
        data: {
          error: birthPlaceError instanceof Error ? birthPlaceError.message : 'Unknown error',
          birth_place_code: residentData.birth_place_code
        }
      });
    }
  };

  const loadSectoralInfo = async (residentData: Resident) => {
    setSectionLoading('sectoral_info', true);
    try {
      const { data: sectoralData } = await supabase
        .from('resident_sectoral_info')
        .select('*')
        .eq('resident_id', residentData.id)
        .single();

      if (sectoralData) {
        residentData.sectoral_info = {
          resident_id: residentData.id,
          is_labor_force_employed: sectoralData.is_labor_force_employed || false,
          is_unemployed: sectoralData.is_unemployed || false,
          is_overseas_filipino_worker: sectoralData.is_overseas_filipino_worker || false,
          is_person_with_disability: sectoralData.is_person_with_disability || false,
          is_out_of_school_children: sectoralData.is_out_of_school_children || false,
          is_out_of_school_youth: sectoralData.is_out_of_school_youth || false,
          is_senior_citizen: sectoralData.is_senior_citizen || false,
          is_registered_senior_citizen: sectoralData.is_registered_senior_citizen || false,
          is_solo_parent: sectoralData.is_solo_parent || false,
          is_indigenous_people: sectoralData.is_indigenous_people || false,
          is_migrant: sectoralData.is_migrant || false
        };
      } else {
        // Default to all false if no sectoral info exists
        residentData.sectoral_info = {
          resident_id: residentData.id,
          is_labor_force_employed: false,
          is_unemployed: false,
          is_overseas_filipino_worker: false,
          is_person_with_disability: false,
          is_out_of_school_children: false,
          is_out_of_school_youth: false,
          is_senior_citizen: false,
          is_registered_senior_citizen: false,
          is_solo_parent: false,
          is_indigenous_people: false,
          is_migrant: false
        };
      }
    } catch (sectoralError) {
      clientLogger.warn('Sectoral data lookup failed', {
        component: 'ResidentDetailsPage',
        action: 'sectoral_lookup_failed',
        data: {
          error: sectoralError instanceof Error ? sectoralError.message : 'Unknown error',
          resident_id: residentData.id
        }
      });
    } finally {
      setSectionLoading('sectoral_info', false);
    }
  };

  const loadResidentDetails = useCallback(async () => {
    if (!residentId) return;

    try {
      setLoading(true);

      clientLogger.debug('Loading resident details', { component: 'ResidentDetailsPage', action: 'load_resident', data: { residentId } });

      const response = await fetchWithAuth(`/api/residents/${residentId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        clientLogger.error('API Error loading resident', { component: 'ResidentDetailsPage', action: 'load_error', data: errorData });
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      const { resident: residentData, household: householdData } = responseData.data;

      if (!residentData) {
        setError('No data returned for resident');
        return;
      }

      clientLogger.debug('Resident data loaded successfully via API', { component: 'ResidentDetailsPage', action: 'resident_loaded', data: { residentId: residentData.id } });

      if (householdData) {
        residentData.household = householdData;
      }

      await loadAddressInfo(residentData);
      await loadOccupationInfo(residentData);
      await loadBirthPlaceInfo(residentData);
      await loadSectoralInfo(residentData);

      // Initialize missing fields for comprehensive form
      const initializedResident = {
        ...residentData,
        telephone_number: residentData.telephone_number || '',
        philsys_card_number: residentData.philsys_card_number || '',
        workplace: residentData.workplace || '',
        height_cm: residentData.height_cm || undefined,
        weight_kg: residentData.weight_kg || undefined,
        complexion: residentData.complexion || '',
        mother_first_name: residentData.mother_first_name || '',
        mother_middle_name: residentData.mother_middle_name || '',
        mother_maiden_last_name: residentData.mother_maiden_last_name || '',
        migration_info: residentData.migration_info || {
          is_migrant: false,
          migration_type: null,
          previous_address: '',
          previous_country: '',
          migration_reason: null,
          migration_date: null,
          documentation_status: null,
          is_returning_resident: false,
        },
      };

      // Setting resident state with initialized data
      console.log('🔍 Setting resident data:', {
        first_name: initializedResident.first_name,
        last_name: initializedResident.last_name,
        id: initializedResident.id
      });
      setResident(initializedResident);
      setEditedResident(updateComputedFields({ ...initializedResident }));
    } catch (err) {
      logError(
        err instanceof Error ? err : new Error('Unknown error loading resident'),
        'RESIDENT_LOAD'
      );
      setError('Failed to load resident details');
    } finally {
      // Setting loading to false after data load attempt
      setLoading(false);
      setSectionLoading('basic_info', false);
      setSectionLoading('contact_info', false);
      setSectionLoading('education_info', false);
      setSectionLoading('employment_info', false);
    }
  }, [residentId, loadAddressInfo]);

  useEffect(() => {
    loadResidentDetails();
  }, [loadResidentDetails]);

  const updateComputedFields = (updatedResident: Resident) => {
    // Update employment-related flags based on employment_status
    const employmentStatus = updatedResident.employment_status;

    updatedResident.is_employed = ['employed', 'self_employed'].includes(employmentStatus || '');
    updatedResident.is_unemployed = employmentStatus === 'unemployed';

    // Update senior citizen flag based on birthdate
    if (updatedResident.birthdate) {
      const age = new Date().getFullYear() - new Date(updatedResident.birthdate).getFullYear();
      updatedResident.is_senior_citizen = age >= 60;
    }

    return updatedResident;
  };

  const transformToFormState = (resident: Resident): ResidentFormData => {
    // Transform resident data to form state format
    // Processing basic resident fields for form

    // Safely handle the resident object and extract nested information
    if (!resident) {
      console.error('transformToFormState called with undefined resident');
      throw new Error('Resident data is required for transformation');
    }

    // Extract sectoral information from the nested object if it exists
    const residentWithNested = resident as Resident & {
      sectoral_info?: SectoralInformation;
      resident_sectoral_info?: SectoralInformation[];
      migrant_info?: Record<string, unknown>;
      resident_migrant_info?: Record<string, unknown>[];
      birth_place_info?: { name?: string; level?: string };
    };
    
    // Safely extract sectoral and migrant info with proper null checking
    const sectoralInfo = residentWithNested?.sectoral_info || 
                        (residentWithNested?.resident_sectoral_info && residentWithNested.resident_sectoral_info[0]) || 
                        null;
    const migrantInfo = residentWithNested?.migrant_info || 
                       (residentWithNested?.resident_migrant_info && residentWithNested.resident_migrant_info[0]) || 
                       null;

    const formState = {
      // Personal Information
      first_name: resident.first_name || '',
      middle_name: resident.middle_name || '',
      last_name: resident.last_name || '',
      extension_name: resident.extension_name || '',
      sex: resident.sex || '',
      civil_status: resident.civil_status as CivilStatusEnum,
      civil_status_others_specify: '', // Not in current Resident type
      citizenship: (resident.citizenship as CitizenshipEnum) || '',
      birthdate: resident.birthdate || '',
      birth_place_name: (resident as any).birth_place_info?.name || '',
      birth_place_code: resident.birth_place_code || '',
      birth_place_level: ((resident as any).birth_place_info?.level || '') as '' | 'region' | 'province' | 'city_municipality' | 'barangay',
      philsys_card_number: resident.philsys_card_number || '',
      philsys_last4: resident.philsys_last4 || '',
      education_attainment: (resident.education_attainment as EducationLevelEnum) || '',
      is_graduate: resident.is_graduate || false,
      employment_status: (resident.employment_status as EmploymentStatusEnum) || '',
      employment_code: '', // Not in current Resident type
      employment_name: '', // Not in current Resident type
      occupation_code: resident.occupation_code || '',
      psoc_level: (resident as any).psoc_info?.level || 0,
      occupation_title: (resident as any).psoc_info?.title || '',

      // Contact Information
      email: resident.email || '',
      telephone_number: resident.telephone_number || '',
      mobile_number: resident.mobile_number || '',
      household_code: resident.household_code || '',

      // Address hierarchy codes (inherited from ResidentRecord)
      region_code: resident.region_code || '',
      province_code: resident.province_code || '',
      city_municipality_code: resident.city_municipality_code || '',
      barangay_code: resident.barangay_code || '',

      // Physical Personal Details
      blood_type: (resident.blood_type as BloodTypeEnum) || '',
      complexion: resident.complexion || '',
      height: resident.height ? String(resident.height) : '',
      weight: resident.weight ? String(resident.weight) : '',
      ethnicity: (resident.ethnicity as EthnicityEnum) || '',
      religion: (resident.religion as ReligionEnum) || '',
      religion_others_specify: '', // Not in current Resident type
      is_voter: resident.is_voter ?? null,
      is_resident_voter: resident.is_resident_voter ?? null,
      last_voted_date: '', // Not in current Resident type
      mother_maiden_first: resident.mother_maiden_first || '',
      mother_maiden_middle: resident.mother_maiden_middle || '',
      mother_maiden_last: resident.mother_maiden_last || '',

      // Sectoral Information (use sectoral_info if available, otherwise defaults)
      is_labor_force_employed: sectoralInfo?.is_labor_force_employed ?? false,
      is_unemployed: sectoralInfo?.is_unemployed ?? false,
      is_overseas_filipino_worker: sectoralInfo?.is_overseas_filipino_worker ?? false,
      is_person_with_disability: sectoralInfo?.is_person_with_disability ?? false,
      is_out_of_school_children: sectoralInfo?.is_out_of_school_children ?? false,
      is_out_of_school_youth: sectoralInfo?.is_out_of_school_youth ?? false,
      is_senior_citizen: sectoralInfo?.is_senior_citizen ?? false,
      is_registered_senior_citizen: sectoralInfo?.is_registered_senior_citizen ?? false,
      is_solo_parent: sectoralInfo?.is_solo_parent ?? false,
      is_indigenous_people: sectoralInfo?.is_indigenous_people ?? false,
      is_migrant: sectoralInfo?.is_migrant ?? false,

      // Migration Information (use migrant_info if available, otherwise defaults)
      previous_barangay_code: (migrantInfo?.previous_barangay_code as string) || '',
      previous_city_municipality_code:
        (migrantInfo?.previous_city_municipality_code as string) || '',
      previous_province_code: (migrantInfo?.previous_province_code as string) || '',
      previous_region_code: (migrantInfo?.previous_region_code as string) || '',
      length_of_stay_previous_months: (migrantInfo?.length_of_stay_previous_months as number) || 0,
      reason_for_leaving: (migrantInfo?.reason_for_leaving as string) || '',
      date_of_transfer: (migrantInfo?.date_of_transfer as string) || '',
      reason_for_transferring: (migrantInfo?.reason_for_transferring as string) || '',
      duration_of_stay_current_months:
        (migrantInfo?.duration_of_stay_current_months as number) || 0,
      is_intending_to_return: (migrantInfo?.is_intending_to_return as boolean) ?? false,
    };

    // Returning transformed form state
    // Final form state includes migration status
    return formState;
  };

  // Handle resident deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetchWithAuth(`/api/residents/${residentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete resident');
      }

      const result = await response.json();

      toast.success(`Resident ${result.deletedResident?.name || ''} deleted successfully`);

      // Redirect to residents list after successful deletion
      router.push('/residents');
    } catch (err) {
      const error = err as Error;
      logError(error, 'RESIDENT_DELETE');
      clientLogger.error('Failed to delete resident', { component: 'ResidentDetailsPage', action: 'delete_failed', data: { error: error.message } });
      toast.error(error.message || 'Failed to delete resident');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Helper function: Build update payload from form data
  const buildUpdatePayload = (formData: ResidentFormData, sectoralData?: any) => {
    return {
      // Main resident fields
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      extension_name: formData.extension_name,
      birthdate: formData.birthdate,
      birth_place_code: formData.birth_place_code,
      sex: formData.sex,
      civil_status: formData.civil_status || null,
      civil_status_others_specify: formData.civil_status_others_specify,
      citizenship: formData.citizenship || null,
      education_attainment: formData.education_attainment || null,
      is_graduate: formData.is_graduate,
      employment_status: formData.employment_status || null,
      occupation_code: formData.occupation_code,
      email: formData.email,
      mobile_number: formData.mobile_number,
      telephone_number: formData.telephone_number,
      household_code: formData.household_code,
      height: formData.height && !isNaN(Number(formData.height)) ? Number(formData.height) : null,
      weight: formData.weight && !isNaN(Number(formData.weight)) ? Number(formData.weight) : null,
      complexion: formData.complexion,
      blood_type: formData.blood_type || null,
      ethnicity: formData.ethnicity || null,
      religion: formData.religion || null,
      religion_others_specify: formData.religion_others_specify,
      is_voter: formData.is_voter,
      is_resident_voter: formData.is_resident_voter,
      last_voted_date: formData.last_voted_date && formData.last_voted_date.trim() !== '' ? formData.last_voted_date : null,
      mother_maiden_first: formData.mother_maiden_first,
      mother_maiden_middle: formData.mother_maiden_middle,
      mother_maiden_last: formData.mother_maiden_last,
      sectoral_info: sectoralData || {
        is_labor_force_employed: false,
        is_unemployed: false,
        is_overseas_filipino_worker: false,
        is_person_with_disability: false,
        is_out_of_school_children: false,
        is_out_of_school_youth: false,
        is_senior_citizen: false,
        is_registered_senior_citizen: false,
        is_solo_parent: false,
        is_indigenous_people: false,
        is_migrant: false,
      }
    };
  };

  // Helper function: Handle API response errors
  const handleApiError = async (response: Response) => {
    const errorText = await response.text().catch(() => '');
    let errorData = {};

    try {
      errorData = errorText ? JSON.parse(errorText) : {};
    } catch (parseError) {
      clientLogger.warn('Failed to parse error response JSON', {
        component: 'ResidentDetailsPage',
        action: 'error_response_parse_failed',
        data: {
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          errorText: errorText || 'No error text available'
        }
      });
      errorData = { error: errorText || 'Failed to parse error response' };
    }

    // Handle validation errors specially
    if ((errorData as any).error?.code === 'VALIDATION_ERROR' && (errorData as any).error.details?.validationErrors) {
      const validationErrors = (errorData as any).error.details.validationErrors;
      const errorMessages = validationErrors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const errorMessage = (errorData as any).error?.message || (errorData as any).error || (errorData as any).message || `HTTP ${response.status}: ${response.statusText}`;
    console.log('🔥 API ERROR DEBUG:', { status: response.status, errorData, url: `/api/residents/${residentId}` });
    throw new Error(errorMessage);
  };

  // Helper function: Handle successful update
  const handleUpdateSuccess = async () => {
    console.log('✅ Resident update API call successful');
    setFormMode('view');
    toast.success('Resident updated successfully!');
    await loadResidentDetails();
  };

  // Helper function: Handle update errors
  const handleUpdateError = (err: unknown) => {
    const error = err as Error;
    const errorMessage = error.message || 'Unknown error';
    const errorDetails = {
      message: errorMessage,
      stack: error.stack,
      residentId,
      timestamp: new Date().toISOString()
    };

    console.log('🔥 UPDATE ERROR DEBUG:', JSON.stringify(errorDetails, null, 2));
    logError(errorMessage, 'RESIDENT_FORM_UPDATE');
    clientLogger.error('Failed to update resident', {
      component: 'ResidentDetailsPage',
      action: 'update_failed',
      data: errorDetails
    });
    toast.error(`Failed to update resident: ${errorMessage}`);
  };

  // Handle form submission
  const handleFormSubmit = async (formData: ResidentFormData) => {
    try {
      const updatePayload = buildUpdatePayload(formData);

      clientLogger.debug('Making PUT request', {
        component: 'ResidentDetailsPage',
        action: 'update_request',
        data: {
          url: `/api/residents/${residentId}`,
          method: 'PUT',
          payloadKeys: Object.keys(updatePayload),
        }
      });

      const response = await fetchWithAuth(`/api/residents/${residentId}`, {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        await handleApiError(response);
        return;
      }

      await handleUpdateSuccess();
    } catch (err) {
      handleUpdateError(err);
    }
  };

  // Removed unused renderEditableField function


  if (error) {
    // Rendering error state - no resident data available
    return (
      <div>
        <div className="p-6">
          <div className="mx-auto max-w-md text-center">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-red-600">
                <svg
                  className="mx-auto size-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
                Resident Not Found
              </h1>
              <p className="font-montserrat mb-4 text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
              <Link
                href="/residents"
                className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Back to Residents
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendering main resident content

  return (
    <div className="min-h-screen" style={{ minHeight: '100vh' }}>
      <div className="p-6" style={{ padding: '24px' }}>
        {/* Page Header */}
        <div
          className="mb-6 flex items-center justify-between"
          style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            className="flex items-center gap-4"
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <Link
              href="/residents"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <svg
                className="mr-2 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ marginRight: '8px', width: '16px', height: '16px' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Residents
            </Link>
            <div>
              <h1
                className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}
              >
                {resident ? `${resident.first_name} ${resident.last_name}` : (
                  <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                )}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                Resident Details
              </p>
              {/* Sectoral Information Tags */}
              {resident?.sectoral_info && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resident.sectoral_info.is_labor_force_employed && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      Labor Force Employed
                    </span>
                  )}
                  {resident.sectoral_info.is_unemployed && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      Unemployed
                    </span>
                  )}
                  {resident.sectoral_info.is_overseas_filipino_worker && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      OFW
                    </span>
                  )}
                  {resident.sectoral_info.is_person_with_disability && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      PWD
                    </span>
                  )}
                  {resident.sectoral_info.is_out_of_school_children && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      Out of School Children
                    </span>
                  )}
                  {resident.sectoral_info.is_out_of_school_youth && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      Out of School Youth
                    </span>
                  )}
                  {resident.sectoral_info.is_senior_citizen && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Senior Citizen
                    </span>
                  )}
                  {resident.sectoral_info.is_registered_senior_citizen && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Registered Senior Citizen
                    </span>
                  )}
                  {resident.sectoral_info.is_solo_parent && (
                    <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800 dark:bg-pink-900/20 dark:text-pink-400">
                      Solo Parent
                    </span>
                  )}
                  {resident.sectoral_info.is_indigenous_people && (
                    <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">
                      Indigenous People
                    </span>
                  )}
                  {resident.sectoral_info.is_migrant && (
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                      Migrant
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - ResidentForm Template */}
          <div className="lg:col-span-2">
            {/* ResidentForm Template */}
            {(() => {
              // Always provide formData for form structure, but use loading states for individual fields
              const formData = resident ? transformToFormState(editedResident || resident) : {};
              // Show form with loading states when data is not available or still loading
              const initialLoadingStates = (loading || !resident) ? {
                basic_info: true,
                address_info: true,
                birth_place_info: true,
                sectoral_info: true,
                employment_info: true,
                education_info: true,
                contact_info: true,
              } : sectionLoadingStates;

              console.log('🔍 Resident Form Loading States:', {
                loading,
                resident: !!resident,
                basic_info: initialLoadingStates.basic_info,
                initialLoadingStates
              });

              return (
                <ResidentForm
                  mode={formMode}
                  initialData={formData}
                  onSubmit={handleFormSubmit}
                  onModeChange={undefined} // Hide FormHeader edit button
                  // onChange={setCurrentFormData} // Removed to prevent infinite re-render loops
                  hidePhysicalDetails={false} // Explicitly set to ensure consistency with create form
                  hideSectoralInfo={false} // Explicitly set to ensure consistency with create form
                  loading={false} // Form data is loaded, but sections may still be loading
                  sectionLoadingStates={initialLoadingStates}
                  key={`resident-form-${(editedResident || resident)?.id}-${(editedResident || resident)?.updated_at || Date.now()}`} // Force re-render when resident updates
                />
              );
            })()}
          </div>

          {/* Right Column - Side Information */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  Quick Actions
                </h3>
              </div>
              <div className="space-y-3 px-6 py-4">
                {/* Edit/Save mode toggle button with FormHeader styling */}
                <button
                  type="button"
                  onClick={async e => {
                    e.preventDefault();
                    // Save button clicked - processing form action
                    // Checking form mode and data availability

                    if (formMode === 'view') {
                      // Switching to edit mode
                      setFormMode('edit');
                    } else {
                      // Attempting to save form data
                      // The form component handles its own validation and submission
                      // Triggering form submission event
                      const formElement = document.querySelector('form');
                      if (formElement) {
                        // Found form element, triggering submit event
                        const submitEvent = new Event('submit', {
                          bubbles: true,
                          cancelable: true,
                        });
                        formElement.dispatchEvent(submitEvent);
                      } else {
                        clientLogger.error('Form element not found for submission', { component: 'ResidentDetailsPage', action: 'form_element_not_found' });
                        toast.error('Unable to submit form');
                      }
                    }
                    // Form action completed
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  {formMode === 'view' ? '✏️ Edit' : '💾 Save'}
                </button>
                <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                  Generate Certificate
                </button>
                <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                  Export Data
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting || formMode === 'edit'}
                  className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  {isDeleting ? 'Deleting...' : '🗑️ Delete Resident'}
                </button>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <button
                    type="button"
                    className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity border-0 p-0 cursor-default"
                    onClick={() => setShowDeleteConfirm(false)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setShowDeleteConfirm(false);
                      }
                    }}
                    aria-label="Close delete confirmation dialog"
                  />
                  <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-gray-800">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900/20">
                          <svg
                            className="h-6 w-6 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                          </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3 className="text-base leading-6 font-semibold text-gray-900 dark:text-gray-100">
                            Delete Resident
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Are you sure you want to delete {resident?.first_name}{' '}
                              {resident?.last_name}? This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-500 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResidentDetailPage() {
  return <ResidentDetailContent />;
}
