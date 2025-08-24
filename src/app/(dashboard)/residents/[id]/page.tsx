'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/data/supabase';
import { PersonalInformationForm } from '@/components/organisms';
import { ResidentForm } from '@/components/templates/ResidentForm';

import { InputField } from '@/components/molecules';
import { logger, logError } from '@/lib/logging/secure-logger';
import type { ResidentFormState } from '@/types/resident-form';
import type { FormMode } from '@/types/forms';
import { 
  CivilStatusEnum, 
  CitizenshipEnum, 
  EducationLevelEnum, 
  EmploymentStatusEnum, 
  BloodTypeEnum, 
  EthnicityEnum, 
  ReligionEnum 
} from '@/types/residents';
import {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  ETHNICITY_OPTIONS,
  extractValues,
} from '@/lib/constants/resident-enums';

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="tooltip text-inverse absolute bottom-full left-1/2 z-10 -translate-x-1/2 -translate-y-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium whitespace-nowrap shadow-xs">
          {content}
          <div className="tooltip-arrow absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
        </div>
      )}
    </div>
  );
};

export const dynamic = 'force-dynamic';

interface Resident {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  birthdate: string;
  sex: 'male' | 'female';
  civil_status: string;
  citizenship?: string;
  mobile_number?: string;
  email?: string;
  telephone_number?: string;
  philsys_card_number?: string;
  education_level?: string;
  education_status?: string;
  employment_status?: string;
  occupation_code?: string;
  psoc_level?: string;
  occupation_title?: string;
  occupation_details?: string;
  workplace?: string;
  blood_type?: string;
  height_cm?: number;
  weight_kg?: number;
  complexion?: string;
  ethnicity?: string;
  religion?: string;
  mother_first_name?: string;
  mother_middle_name?: string;
  mother_maiden_last_name?: string;
  migration_info?: any;
  is_voter?: boolean;
  is_resident_voter?: boolean;
  voter_id_number?: string;
  philsys_last4?: string;
  philsys_card_number_hash?: string;
  is_labor_force?: boolean;
  is_employed?: boolean;
  is_unemployed?: boolean;
  is_ofw?: boolean;
  is_pwd?: boolean;
  is_out_of_school_children?: boolean;
  is_out_of_school_youth?: boolean;
  is_senior_citizen?: boolean;
  is_registered_senior_citizen?: boolean;
  is_solo_parent?: boolean;
  is_indigenous_people?: boolean;
  is_migrant?: boolean;
  household_id?: string;
  household_code?: string;
  barangay_code: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  search_text?: string;
  // Related data
  household?: {
    id?: string;
    household_number?: string;
    code: string;
    street_name?: string;
    house_number?: string;
    subdivision?: string;
    zip_code?: string;
    barangay_code: string;
    region_code?: string;
    province_code?: string;
    city_municipality_code?: string;
    total_members?: number;
    created_at?: string;
    updated_at?: string;
    head_resident?: {
      id: string;
      first_name: string;
      middle_name?: string;
      last_name: string;
    };
  };
  psoc_info?: {
    code: string;
    title: string;
    level: string;
  };
  address_info?: {
    barangay_name: string;
    city_municipality_name: string;
    province_name?: string;
    region_name: string;
    full_address: string;
  };
}

function ResidentDetailContent() {
  const params = useParams();
  const residentId = params.id as string;
  const [resident, setResident] = useState<Resident | null>(null);
  const [editedResident, setEditedResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('view');

  useEffect(() => {
    const loadResidentDetails = async () => {
      if (!residentId) return;

      try {
        setLoading(true);

        logger.debug('Loading resident details', { residentId });

        // Use API endpoint instead of direct queries
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('No valid session found');
        }

        // Load resident details via API
        const response = await fetch(`/api/residents/${residentId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const { resident: residentData, household: householdData } = await response.json();

        if (!residentData) {
          setError('No data returned for resident');
          return;
        }

        logger.debug('Resident data loaded successfully via API', { residentId: residentData.id });

        // Household data is already included in the API response
        if (householdData) {
          residentData.household = householdData;
        }

        // Load address information for the resident's barangay
        try {
          logger.debug('Loading address information', { barangayCode: residentData.barangay_code });

          // Try to use the address hierarchy view first (if it exists)
          const { data: addressViewData, error: viewError } = await supabase
            .from('psgc_address_hierarchy')
            .select(
              'barangay_name, city_municipality_name, province_name, region_name, full_address'
            )
            .eq('barangay_code', residentData.barangay_code)
            .single();

          if (addressViewData && !viewError) {
            residentData.address_info = {
              barangay_name: addressViewData.barangay_name,
              city_municipality_name: addressViewData.city_municipality_name,
              province_name: addressViewData.province_name,
              region_name: addressViewData.region_name,
              full_address: addressViewData.full_address,
            };
          } else {
            // Fallback: Try individual table queries
            logger.debug('Address view not available, trying individual table queries');

            const { data: barangayData, error: barangayError } = await supabase
              .from('psgc_barangays')
              .select('name, city_municipality_code')
              .eq('code', residentData.barangay_code)
              .single();

            logger.debug('Barangay query completed', {
              found: !!barangayData,
              hasError: !!barangayError,
            });

            if (barangayData && !barangayError) {
              // Initialize with barangay data only - no fallback values
              residentData.address_info = {
                barangay_name: barangayData.name,
                city_municipality_name: undefined,
                province_name: undefined,
                region_name: undefined,
                full_address: barangayData.name,
              };

              // Try to get city info and trace back to region
              const { data: cityData } = await supabase
                .from('psgc_cities_municipalities')
                .select('name, province_code, is_independent')
                .eq('code', barangayData.city_municipality_code)
                .single();

              if (cityData) {
                residentData.address_info.city_municipality_name = cityData.name;
                residentData.address_info.full_address = `${barangayData.name}, ${cityData.name}`;

                // Try to get province and region info
                if (!cityData.is_independent && cityData.province_code) {
                  const { data: provinceData } = await supabase
                    .from('psgc_provinces')
                    .select('name, region_code')
                    .eq('code', cityData.province_code)
                    .single();

                  if (provinceData) {
                    residentData.address_info.province_name = provinceData.name;

                    // Get region name
                    const { data: regionData } = await supabase
                      .from('psgc_regions')
                      .select('name')
                      .eq('code', provinceData.region_code)
                      .single();

                    if (regionData) {
                      residentData.address_info.region_name = regionData.name;
                    }
                    // No fallback mapping - only use actual database data
                  }
                }
                // No assumptions for independent cities - only use database data
              }
            }
            // No fallback creation - if no barangay data, leave address_info undefined
          }
        } catch (addressError) {
          logger.warn('Address data lookup failed', {
            error: addressError instanceof Error ? addressError.message : 'Unknown error',
          });
          // No fallback data - leave address_info undefined if query fails
        }

        // Household information is now included in the main API response

        // Try to load PSOC information if available
        if (residentData.occupation_code) {
          try {
            const { data: psocData } = await supabase
              .from('occupation_codes')
              .select('code, title, level')
              .eq('code', residentData.occupation_code)
              .single();

            if (psocData) {
              residentData.psoc_info = psocData;
            }
          } catch (psocError) {
            logger.warn('PSOC data lookup failed', {
              error: psocError instanceof Error ? psocError.message : 'Unknown error',
            });
          }
        }

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

        setResident(initializedResident);
        setEditedResident(updateComputedFields({ ...initializedResident }));
      } catch (err) {
        logError(
          err instanceof Error ? err : new Error('Unknown error loading resident'),
          'RESIDENT_LOAD'
        );
        setError('Failed to load resident details');
      } finally {
        setLoading(false);
      }
    };

    loadResidentDetails();
  }, [residentId]);

  const formatFullName = (person: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    extension_name?: string;
  }) => {
    return [person.first_name, person.middle_name, person.last_name, person.extension_name]
      .filter(Boolean)
      .join(' ');
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  const formatAddress = (household?: Resident['household']) => {
    if (!household) return 'No household assigned';
    const parts = [household.house_number, household.street_name, household.subdivision].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  const formatEnumValue = (value: string | undefined) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatBoolean = (value: boolean | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return value ? 'Yes' : 'No';
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedResident(resident); // Reset to original data
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!editedResident) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const { error: updateError } = await supabase
        .from('residents')
        .update({
          first_name: editedResident.first_name,
          middle_name: editedResident.middle_name,
          last_name: editedResident.last_name,
          extension_name: editedResident.extension_name,
          birthdate: editedResident.birthdate,
          sex: editedResident.sex,
          civil_status: editedResident.civil_status,
          citizenship: editedResident.citizenship,
          mobile_number: editedResident.mobile_number,
          email: editedResident.email,
          telephone_number: editedResident.telephone_number,
          education_level: editedResident.education_level,
          education_status: editedResident.education_status,
          employment_status: editedResident.employment_status,
          occupation_title: editedResident.occupation_title,
          occupation_details: editedResident.occupation_details,
          workplace: editedResident.workplace,
          blood_type: editedResident.blood_type,
          height_cm: editedResident.height_cm,
          weight_kg: editedResident.weight_kg,
          complexion: editedResident.complexion,
          ethnicity: editedResident.ethnicity,
          religion: editedResident.religion,
          mother_first_name: editedResident.mother_first_name,
          mother_middle_name: editedResident.mother_middle_name,
          mother_maiden_last_name: editedResident.mother_maiden_last_name,
          is_voter: editedResident.is_voter,
          is_resident_voter: editedResident.is_resident_voter,
          voter_id_number: editedResident.voter_id_number,
          is_ofw: editedResident.is_ofw,
          is_pwd: editedResident.is_pwd,
          is_solo_parent: editedResident.is_solo_parent,
          is_indigenous_people: editedResident.is_indigenous_people,
          is_migrant: editedResident.is_migrant,
          migration_info: editedResident.migration_info,
          updated_at: new Date().toISOString(),
        })
        .eq('id', residentId);

      if (updateError) {
        throw updateError;
      }

      setResident(editedResident);
      setIsEditing(false);
    } catch (err) {
      logError(
        err instanceof Error ? err : new Error('Unknown error saving resident'),
        'RESIDENT_SAVE'
      );
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateComputedFields = (updatedResident: Resident) => {
    // Update employment-related flags based on employment_status
    const employmentStatus = updatedResident.employment_status;

    updatedResident.is_employed = ['employed', 'self_employed'].includes(employmentStatus || '');
    updatedResident.is_unemployed = employmentStatus === 'unemployed';
    updatedResident.is_labor_force = [
      'employed',
      'unemployed',
      'underemployed',
      'self_employed',
      'looking_for_work',
    ].includes(employmentStatus || '');

    // Update senior citizen flag based on birthdate
    if (updatedResident.birthdate) {
      const age = new Date().getFullYear() - new Date(updatedResident.birthdate).getFullYear();
      updatedResident.is_senior_citizen = age >= 60;
    }

    return updatedResident;
  };

  const handleFieldChange = (field: keyof Resident, value: unknown) => {
    if (!editedResident) return;

    let updatedResident = {
      ...editedResident,
      [field]: value,
    };

    // Update computed fields when employment status or birthdate changes
    if (field === 'employment_status' || field === 'birthdate') {
      updatedResident = updateComputedFields(updatedResident);
    }

    setEditedResident(updatedResident);
  };

  const getComputedFieldTooltip = (field: keyof Resident) => {
    switch (field) {
      case 'is_labor_force':
        return `Automatically calculated from Employment Status. Includes: employed, unemployed, underemployed, self-employed, looking for work`;
      case 'is_employed':
        return `Automatically calculated from Employment Status. Includes: employed, self-employed`;
      case 'is_unemployed':
        return `Automatically calculated from Employment Status. Only when status is 'unemployed'`;
      case 'is_senior_citizen':
        return `Automatically calculated from Date of Birth. Senior citizen when age is 60 or above`;
      default:
        return 'This field is automatically calculated';
    }
  };

  // Transform resident data to ResidentFormState format
  const transformToFormState = (resident: Resident): ResidentFormState => {
    return {
      // Personal Information
      first_name: resident.first_name || '',
      middle_name: resident.middle_name || '',
      last_name: resident.last_name || '',
      extension_name: resident.extension_name || '',
      sex: resident.sex || '',
      civil_status: (resident.civil_status as CivilStatusEnum) || '',
      civil_status_others_specify: '', // Not in current Resident type
      citizenship: (resident.citizenship as CitizenshipEnum) || '',
      birthdate: resident.birthdate || '',
      birth_place_name: '', // Not in current Resident type
      birth_place_code: '', // Not in current Resident type
      birth_place_level: '', // Not in current Resident type
      philsys_card_number: resident.philsys_card_number || '',
      philsys_last4: resident.philsys_last4 || '',
      education_attainment: (resident.education_level as EducationLevelEnum) || '',
      is_graduate: resident.education_status === 'graduate',
      employment_status: (resident.employment_status as EmploymentStatusEnum) || '',
      employment_code: '', // Not in current Resident type
      employment_name: '', // Not in current Resident type
      occupation_code: resident.occupation_code || '',
      psoc_level: parseInt(resident.psoc_level || '0'),
      occupation_title: resident.occupation_title || '',
      
      // Contact Information
      email: resident.email || '',
      telephone_number: resident.telephone_number || '',
      mobile_number: resident.mobile_number || '',
      household_code: resident.household_code || '',
      
      // Physical Personal Details
      blood_type: (resident.blood_type as BloodTypeEnum) || '',
      complexion: resident.complexion || '',
      height: resident.height_cm || 0,
      weight: resident.weight_kg || 0,
      ethnicity: (resident.ethnicity as EthnicityEnum) || '',
      religion: (resident.religion as ReligionEnum) || '',
      religion_others_specify: '', // Not in current Resident type
      is_voter: resident.is_voter ?? null,
      is_resident_voter: resident.is_resident_voter ?? null,
      last_voted_date: '', // Not in current Resident type
      mother_maiden_first: resident.mother_first_name || '',
      mother_maiden_middle: resident.mother_middle_name || '',
      mother_maiden_last: resident.mother_maiden_last_name || '',
      
      // Sectoral Information
      is_labor_force: resident.is_labor_force || false,
      is_labor_force_employed: resident.is_employed || false,
      is_unemployed: resident.is_unemployed || false,
      is_overseas_filipino_worker: resident.is_ofw || false,
      is_person_with_disability: resident.is_pwd || false,
      is_out_of_school_children: resident.is_out_of_school_children || false,
      is_out_of_school_youth: resident.is_out_of_school_youth || false,
      is_senior_citizen: resident.is_senior_citizen || false,
      is_registered_senior_citizen: resident.is_registered_senior_citizen || false,
      is_solo_parent: resident.is_solo_parent || false,
      is_indigenous_people: resident.is_indigenous_people || false,
      is_migrant: resident.is_migrant || false,
      
      // Migration Information (from migration_info object)
      previous_barangay_code: resident.migration_info?.previous_address || '',
      previous_city_municipality_code: '', // Not in current migration_info
      previous_province_code: '', // Not in current migration_info
      previous_region_code: '', // Not in current migration_info
      length_of_stay_previous_months: 0, // Not in current migration_info
      reason_for_leaving: resident.migration_info?.migration_reason || '',
      date_of_transfer: resident.migration_info?.migration_date || '',
      reason_for_transferring: '', // Not in current migration_info
      duration_of_stay_current_months: 0, // Not in current migration_info
      is_intending_to_return: resident.migration_info?.is_returning_resident || false,
    };
  };

  // Handle form submission
  const handleFormSubmit = async (formData: ResidentFormState) => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Use the API endpoint for updating
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`/api/residents/${residentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update resident');
      }

      const { resident: updatedResident } = await response.json();
      
      // Update local state
      setResident({...resident, ...updatedResident});
      
      // Show success message briefly
      const tempSuccessState = { ...resident, ...updatedResident };
      setResident(tempSuccessState);
      
    } catch (err) {
      const error = err as Error;
      logError(error, 'RESIDENT_FORM_UPDATE');
      setSaveError(error.message || 'Failed to update resident');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableField = (
    label: string,
    field: keyof Resident,
    type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'checkbox' = 'text',
    options?: string[],
    isComputed = false
  ) => {
    const currentResident = isEditing ? editedResident : resident;
    if (!currentResident) return null;

    const value = currentResident[field] as string | boolean | undefined;

    if (isEditing && !isComputed) {
      if (type === 'checkbox') {
        return (
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</dt>
            <dd className="mt-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={e => handleFieldChange(field, e.target.checked)}
                  className="rounded border-gray-200 text-gray-600 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-400"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {value ? 'Yes' : 'No'}
                </span>
              </label>
            </dd>
          </div>
        );
      }

      if (type === 'select' && options) {
        const selectId = `edit-select-${field}-${Date.now()}`;
        return (
          <div>
            <label
              htmlFor={selectId}
              className="block cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              {label}
            </label>
            <div className="mt-1">
              {/* TODO: Replace with SelectField DropdownSelect component
                - id={selectId}
                - options=[{ value: '', label: 'Select...' }, ...options.map(...)]
                - value={(value as string) || ''}
                - onChange={val => handleFieldChange(field, val)}
                - size="sm"
              */}
            </div>
          </div>
        );
      }

      const inputId = `edit-${field}-${Date.now()}`;
      return (
        <div>
          <label
            htmlFor={inputId}
            className="block cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {label}
          </label>
          <div className="mt-1">
            <input
              id={inputId}
              type={type}
              value={(value as string) || ''}
              onChange={e => handleFieldChange(field, e.target.value)}
              className="block w-full rounded-md border border-gray-200 bg-white text-sm text-gray-600 shadow-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            />
          </div>
        </div>
      );
    }

    // Display mode
    if (type === 'checkbox') {
      return (
        <div className="flex items-center justify-between">
          <dt
            className={`text-sm font-medium ${isComputed ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {label}
            {isComputed && (
              <Tooltip content={getComputedFieldTooltip(field)}>
                <span className="ml-1 cursor-help text-xs text-gray-500 underline dark:text-gray-500">
                  (auto)
                </span>
              </Tooltip>
            )}
          </dt>
          <dd className={`text-sm font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
            {formatBoolean(value as boolean)}
          </dd>
        </div>
      );
    }

    if (type === 'date') {
      return (
        <div>
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</dt>
          <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {value
              ? `${new Date(value as string).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} (${calculateAge(value as string)} y/o)`
              : 'N/A'}
          </dd>
        </div>
      );
    }

    return (
      <div>
        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {formatEnumValue(value as string)}
        </dd>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <div className="p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading resident details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resident) {
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

  return (
    <div>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/residents"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-xs hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <h1 className="font-montserrat text-xl font-semibold text-gray-600 dark:text-gray-400">
                {formatFullName(resident)}
              </h1>
              <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                Resident Details
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - ResidentForm Template */}
          <div className="lg:col-span-2">
            {/* ResidentForm Template */}
            <ResidentForm
              mode={formMode}
              initialData={resident ? transformToFormState(resident) : undefined}
              onSubmit={handleFormSubmit}
              onModeChange={setFormMode}
            />
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
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:text-black"
                    >
                      Cancel
                    </button>
                    {saveError && (
                      <div className="mt-2 text-center text-sm text-red-600">{saveError}</div>
                    )}
                  </>
                ) : (
                  <>
                    <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                      Generate Certificate
                    </button>
                    <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                      Export Data
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Classifications Card */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  Classifications
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Fields marked with{' '}
                  <span className="text-gray-500 underline dark:text-gray-500">(auto)</span> are
                  calculated automatically. Hover for details.
                </p>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  {renderEditableField('Registered Voter', 'is_voter', 'checkbox')}
                  {renderEditableField('Resident Voter', 'is_resident_voter', 'checkbox')}
                  {renderEditableField(
                    'Labor Force',
                    'is_labor_force',
                    'checkbox',
                    undefined,
                    true
                  )}
                  {renderEditableField('Employed', 'is_employed', 'checkbox', undefined, true)}
                  {renderEditableField('Unemployed', 'is_unemployed', 'checkbox', undefined, true)}
                  {renderEditableField(
                    'Senior Citizen',
                    'is_senior_citizen',
                    'checkbox',
                    undefined,
                    true
                  )}
                  {renderEditableField(
                    'Registered Senior Citizen',
                    'is_registered_senior_citizen',
                    'checkbox'
                  )}
                  {renderEditableField('PWD', 'is_pwd', 'checkbox')}
                  {renderEditableField('Solo Parent', 'is_solo_parent', 'checkbox')}
                  {renderEditableField('OFW', 'is_ofw', 'checkbox')}
                  {renderEditableField('Indigenous People', 'is_indigenous_people', 'checkbox')}
                  {renderEditableField('Migrant', 'is_migrant', 'checkbox')}
                  {renderEditableField(
                    'Out of School Children',
                    'is_out_of_school_children',
                    'checkbox'
                  )}
                  {renderEditableField('Out of School Youth', 'is_out_of_school_youth', 'checkbox')}
                </dl>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  Additional Information
                </h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  {renderEditableField(
                    'Religion',
                    'religion',
                    'select',
                    extractValues(RELIGION_OPTIONS)
                  )}
                  {renderEditableField(
                    'Ethnicity',
                    'ethnicity',
                    'select',
                    extractValues(ETHNICITY_OPTIONS)
                  )}
                  {renderEditableField('Voter ID Number', 'voter_id_number', 'text')}
                </dl>
              </div>
            </div>

            {/* System Information Card */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  System Information
                </h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Record ID
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {resident.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Created Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(resident.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </dd>
                  </div>
                  {resident.updated_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Last Updated
                      </dt>
                      <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(resident.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </dd>
                    </div>
                  )}
                  {resident.household_id && (
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Household ID
                      </dt>
                      <dd className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                        {resident.household_id}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Status
                    </dt>
                    <dd
                      className={`text-sm font-medium ${
                        resident.is_active ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatBoolean(resident.is_active)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResidentDetailPage() {
  return <ResidentDetailContent />;
}
