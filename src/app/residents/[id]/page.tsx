'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute, PersonalInformation, EducationEmployment } from '@/components/organisms';
import { DashboardLayout } from '@/components/templates';
import { DropdownSelect } from '@/components/molecules';
import { InputField } from '@/components/molecules';
import { logger, logError } from '@/lib/secure-logger';
import {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
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
        <div className="tooltip text-inverse absolute bottom-full left-1/2 z-10 -translate-x-1/2 -translate-y-2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium shadow-sm">
          {content}
          <div className="tooltip-arrow absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
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
  psoc_code?: string;
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
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        if (residentData.psoc_code) {
          try {
            const { data: psocData } = await supabase
              .from('psoc_codes')
              .select('code, title, level')
              .eq('code', residentData.psoc_code)
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
            <dt className="text-sm font-medium text-gray-600">{label}</dt>
            <dd className="mt-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={e => handleFieldChange(field, e.target.checked)}
                  className="rounded border-default text-gray-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">{value ? 'Yes' : 'No'}</span>
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
              className="block cursor-pointer text-sm font-medium text-gray-600"
            >
              {label}
            </label>
            <div className="mt-1">
              <DropdownSelect
                id={selectId}
                options={[
                  { value: '', label: 'Select...' },
                  ...options.map(option => ({ value: option, label: formatEnumValue(option) })),
                ]}
                value={(value as string) || ''}
                onChange={val => handleFieldChange(field, val)}
                size="sm"
              />
            </div>
          </div>
        );
      }

      const inputId = `edit-${field}-${Date.now()}`;
      return (
        <div>
          <label
            htmlFor={inputId}
            className="block cursor-pointer text-sm font-medium text-gray-500"
          >
            {label}
          </label>
          <div className="mt-1">
            <input
              id={inputId}
              type={type}
              value={(value as string) || ''}
              onChange={e => handleFieldChange(field, e.target.value)}
              className="bg-default block w-full rounded-md border border-default text-sm text-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      );
    }

    // Display mode
    if (type === 'checkbox') {
      return (
        <div className="flex items-center justify-between">
          <dt className={`text-sm font-medium ${isComputed ? 'text-muted' : 'text-gray-600'}`}>
            {label}
            {isComputed && (
              <Tooltip content={getComputedFieldTooltip(field)}>
                <span className="ml-1 cursor-help text-xs text-gray-600 underline">(auto)</span>
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
          <dt className="text-sm font-medium text-gray-600">{label}</dt>
          <dd className="mt-1 text-sm text-gray-600">
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
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className="mt-1 text-sm text-gray-600">{formatEnumValue(value as string)}</dd>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm}>
        <div className="p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Loading resident details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !resident) {
    return (
      <DashboardLayout searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm}>
        <div className="p-6">
          <div className="mx-auto max-w-md text-center">
            <div className="bg-default rounded-lg border border-default p-6 shadow-md">
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
              <h1 className="font-montserrat mb-2 text-lg font-semibold text-gray-600">
                Resident Not Found
              </h1>
              <p className="font-montserrat mb-4 text-sm text-gray-600">{error}</p>
              <Link
                href="/residents"
                className="hover:bg-default-hover inline-flex items-center rounded-md border border-default px-4 py-2 text-sm font-medium text-gray-600"
              >
                Back to Residents
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/residents"
              className="bg-default hover:bg-default-hover inline-flex items-center rounded-md border border-default px-3 py-2 text-sm font-medium text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              <h1 className="font-montserrat text-xl font-semibold text-gray-600">
                {formatFullName(resident)}
              </h1>
              <p className="font-montserrat text-sm font-normal text-gray-600">Resident Details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Information */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal Information Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Personal Information</h3>
              </div>
              <div className="px-6 py-4">
                {isEditing ? (
                  <PersonalInformation
                    value={{
                      firstName: editedResident?.first_name || '',
                      middleName: editedResident?.middle_name || '',
                      lastName: editedResident?.last_name || '',
                      extensionName: editedResident?.extension_name || '',
                      birthdate: editedResident?.birthdate || '',
                      sex: (editedResident?.sex as 'male' | 'female') || '',
                      civilStatus: editedResident?.civil_status || '',
                      citizenship: editedResident?.citizenship || 'filipino',
                    }}
                    onChange={personalData => {
                      if (!editedResident) return;
                      setEditedResident({
                        ...editedResident,
                        first_name: personalData.firstName,
                        middle_name: personalData.middleName,
                        last_name: personalData.lastName,
                        extension_name: personalData.extensionName,
                        birthdate: personalData.birthdate,
                        sex: personalData.sex as 'male' | 'female',
                        civil_status: personalData.civilStatus,
                        citizenship: personalData.citizenship,
                      });
                    }}
                    errors={{}}
                  />
                ) : (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {renderEditableField('First Name', 'first_name', 'text')}
                    {renderEditableField('Middle Name', 'middle_name', 'text')}
                    {renderEditableField('Last Name', 'last_name', 'text')}
                    {renderEditableField('Extension Name', 'extension_name', 'text')}
                    {renderEditableField('Date of Birth', 'birthdate', 'date')}
                    {renderEditableField('Sex', 'sex', 'select', extractValues(SEX_OPTIONS))}
                    {renderEditableField(
                      'Civil Status',
                      'civil_status',
                      'select',
                      extractValues(CIVIL_STATUS_OPTIONS)
                    )}
                    {renderEditableField(
                      'Citizenship',
                      'citizenship',
                      'select',
                      extractValues(CITIZENSHIP_OPTIONS)
                    )}
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-600">Address</dt>
                      <dd className="mt-1 text-sm text-gray-600">
                        {resident.household ? (
                          <div>
                            <Link
                              href={`/households/${resident.household.code}`}
                              className="cursor-pointer text-gray-600 hover:text-gray-800 hover:underline"
                            >
                              <div className="font-medium">
                                {[
                                  formatAddress(resident.household),
                                  resident.address_info?.barangay_name,
                                  resident.address_info?.city_municipality_name &&
                                    resident.address_info.city_municipality_name +
                                      (resident.address_info.province_name
                                        ? `, ${resident.address_info.province_name}`
                                        : ''),
                                  resident.address_info?.region_name,
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            </Link>
                          </div>
                        ) : (
                          <div>
                            <div className="text-gray-600">
                              {resident.address_info
                                ? [
                                    'No household assigned',
                                    resident.address_info.barangay_name,
                                    resident.address_info.city_municipality_name &&
                                      resident.address_info.city_municipality_name +
                                        (resident.address_info.province_name
                                          ? `, ${resident.address_info.province_name}`
                                          : ''),
                                    resident.address_info.region_name,
                                  ]
                                    .filter(Boolean)
                                    .join(', ')
                                : `No household assigned, Barangay Code: ${resident.barangay_code}`}
                            </div>
                          </div>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>

            {/* Education & Employment Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Education & Employment</h3>
              </div>
              <div className="px-6 py-4">
                {isEditing ? (
                  <EducationEmployment
                    value={{
                      educationAttainment: editedResident?.education_level || '',
                      isGraduate: editedResident?.education_status === 'graduate',
                      psocCode: editedResident?.psoc_code || '',
                      psocLevel: editedResident?.psoc_level || '',
                      positionTitleId: '',
                      occupationDescription: editedResident?.occupation_title || '',
                      employmentStatus: editedResident?.employment_status || '',
                      workplace: editedResident?.workplace || '',
                    }}
                    onChange={educationData => {
                      if (!editedResident) return;
                      setEditedResident({
                        ...editedResident,
                        education_level: educationData.educationAttainment,
                        education_status: educationData.isGraduate ? 'graduate' : 'non-graduate',
                        psoc_code: educationData.psocCode,
                        psoc_level: educationData.psocLevel,
                        occupation_title: educationData.occupationDescription,
                        employment_status: educationData.employmentStatus,
                        workplace: educationData.workplace,
                      });
                    }}
                    errors={{}}
                  />
                ) : (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {renderEditableField(
                      'Education Level',
                      'education_level',
                      'select',
                      extractValues(EDUCATION_LEVEL_OPTIONS)
                    )}
                    {renderEditableField(
                      'Education Status',
                      'education_status',
                      'select',
                      extractValues(EDUCATION_STATUS_OPTIONS)
                    )}
                    {renderEditableField(
                      'Employment Status',
                      'employment_status',
                      'select',
                      extractValues(EMPLOYMENT_STATUS_OPTIONS)
                    )}
                    {renderEditableField('Occupation Title', 'occupation_title', 'text')}
                    {renderEditableField('Workplace', 'workplace', 'text')}
                    {resident.psoc_code && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">PSOC Code</dt>
                        <dd className="mt-1 font-mono text-sm text-gray-600">
                          {resident.psoc_code}
                        </dd>
                      </div>
                    )}
                    {resident.psoc_level && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">PSOC Level</dt>
                        <dd className="mt-1 text-sm text-gray-600">
                          {formatEnumValue(resident.psoc_level)}
                        </dd>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      {renderEditableField('Occupation Details', 'occupation_details', 'text')}
                    </div>
                  </dl>
                )}
              </div>
            </div>

            {/* Household Information Card */}
            {resident.household && (
              <div className="bg-default rounded-lg border border-default shadow">
                <div className="border-b border-default px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-600">Household Information</h3>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Household Code</dt>
                      <dd className="mt-1">
                        <Link
                          href={`/households/${resident.household.code}`}
                          className="font-medium text-gray-600 hover:text-gray-800 hover:underline"
                        >
                          #{resident.household.code}
                        </Link>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Address</dt>
                      <dd className="mt-1 text-sm text-gray-600">
                        <Link
                          href={`/households/${resident.household.code}`}
                          className="text-gray-600 hover:text-gray-800 hover:underline"
                        >
                          <div className="font-medium">
                            {[
                              formatAddress(resident.household),
                              resident.address_info?.barangay_name,
                              resident.address_info?.city_municipality_name &&
                                resident.address_info.city_municipality_name +
                                  (resident.address_info.province_name
                                    ? `, ${resident.address_info.province_name}`
                                    : ''),
                              resident.address_info?.region_name,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        </Link>
                      </dd>
                    </div>
                    {resident.household.household_number && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Household Number</dt>
                        <dd className="mt-1 font-mono text-sm text-gray-600">
                          {resident.household.household_number}
                        </dd>
                      </div>
                    )}
                    {resident.household.zip_code && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">ZIP Code</dt>
                        <dd className="mt-1 font-mono text-sm text-gray-600">
                          {resident.household.zip_code}
                        </dd>
                      </div>
                    )}
                    {resident.household.total_members && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Total Members</dt>
                        <dd className="mt-1 text-sm text-gray-600">
                          {resident.household.total_members}
                        </dd>
                      </div>
                    )}
                    {resident.household.head_resident && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-600">Household Head</dt>
                        <dd className="mt-1 text-sm text-gray-600">
                          {formatFullName(resident.household.head_resident)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Contact & Physical Information Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Contact & Physical Information</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-6">
                  {/* Contact Details */}
                  <div>
                    <h4 className="mb-4 text-sm/6 font-medium text-gray-600">Contact Information</h4>
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <InputField
                          label="Mobile Number"
                          type="tel"
                          value={editedResident?.mobile_number || ''}
                          onChange={e => handleFieldChange('mobile_number', e.target.value)}
                          placeholder="09XXXXXXXXX"
                          required
                        />
                        <InputField
                          label="Telephone Number"
                          type="tel"
                          value={editedResident?.telephone_number || ''}
                          onChange={e => handleFieldChange('telephone_number', e.target.value)}
                          placeholder="(02) XXX-XXXX"
                        />
                        <InputField
                          label="Email Address"
                          type="email"
                          value={editedResident?.email || ''}
                          onChange={e => handleFieldChange('email', e.target.value)}
                          placeholder="email@example.com"
                        />
                        <InputField
                          label="PhilSys Card Number"
                          type="text"
                          value={editedResident?.philsys_card_number || ''}
                          onChange={e => handleFieldChange('philsys_card_number', e.target.value)}
                          placeholder="XXXX-XXXX-XXXX"
                        />
                      </div>
                    ) : (
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        {renderEditableField('Mobile Number', 'mobile_number', 'tel')}
                        {renderEditableField('Telephone Number', 'telephone_number', 'tel')}
                        {renderEditableField('Email Address', 'email', 'email')}
                        {resident.philsys_last4 && (
                          <div>
                            <dt className="text-sm font-medium text-gray-600">PhilSys ID</dt>
                            <dd className="mt-1 font-mono text-sm text-gray-600">
                              ****-****-****-{resident.philsys_last4}
                            </dd>
                          </div>
                        )}
                      </dl>
                    )}
                  </div>

                  {/* Physical Characteristics */}
                  <div>
                    <h4 className="mb-4 text-sm/6 font-medium text-gray-600">
                      Physical Characteristics
                    </h4>
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <InputField
                          label="Height (cm)"
                          type="number"
                          value={editedResident?.height_cm?.toString() || ''}
                          onChange={e =>
                            handleFieldChange('height_cm', parseFloat(e.target.value) || undefined)
                          }
                          placeholder="170"
                        />
                        <InputField
                          label="Weight (kg)"
                          type="number"
                          value={editedResident?.weight_kg?.toString() || ''}
                          onChange={e =>
                            handleFieldChange('weight_kg', parseFloat(e.target.value) || undefined)
                          }
                          placeholder="65"
                        />
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-600">
                            Blood Type
                          </label>
                          <DropdownSelect
                            options={BLOOD_TYPE_OPTIONS}
                            value={editedResident?.blood_type || ''}
                            onChange={val => handleFieldChange('blood_type', val)}
                          />
                        </div>
                        <InputField
                          label="Complexion"
                          type="text"
                          value={editedResident?.complexion || ''}
                          onChange={e => handleFieldChange('complexion', e.target.value)}
                          placeholder="Fair, Medium, Dark, etc."
                        />
                      </div>
                    ) : (
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Height</dt>
                          <dd className="mt-1 text-sm text-gray-600">
                            {resident.height_cm ? `${resident.height_cm} cm` : 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Weight</dt>
                          <dd className="mt-1 text-sm text-gray-600">
                            {resident.weight_kg ? `${resident.weight_kg} kg` : 'N/A'}
                          </dd>
                        </div>
                        {renderEditableField('Blood Type', 'blood_type', 'text')}
                        {renderEditableField('Complexion', 'complexion', 'text')}
                      </dl>
                    )}
                  </div>

                  {/* Mother's Information */}
                  <div>
                    <h4 className="mb-4 text-sm/6 font-medium text-gray-600">
                      Mother&rsquo;s Information
                    </h4>
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <InputField
                          label="Mother&rsquo;s First Name"
                          type="text"
                          value={editedResident?.mother_first_name || ''}
                          onChange={e => handleFieldChange('mother_first_name', e.target.value)}
                          placeholder="First name"
                        />
                        <InputField
                          label="Mother&rsquo;s Middle Name"
                          type="text"
                          value={editedResident?.mother_middle_name || ''}
                          onChange={e => handleFieldChange('mother_middle_name', e.target.value)}
                          placeholder="Middle name"
                        />
                        <InputField
                          label="Mother&rsquo;s Maiden Last Name"
                          type="text"
                          value={editedResident?.mother_maiden_last_name || ''}
                          onChange={e =>
                            handleFieldChange('mother_maiden_last_name', e.target.value)
                          }
                          placeholder="Maiden last name"
                        />
                      </div>
                    ) : (
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                        {renderEditableField(
                          'Mother&rsquo;s First Name',
                          'mother_first_name',
                          'text'
                        )}
                        {renderEditableField(
                          'Mother&rsquo;s Middle Name',
                          'mother_middle_name',
                          'text'
                        )}
                        {renderEditableField(
                          'Mother&rsquo;s Maiden Last Name',
                          'mother_maiden_last_name',
                          'text'
                        )}
                      </dl>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Migration Information Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Migration Information</h3>
              </div>
              <div className="px-6 py-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_migrant"
                        checked={editedResident?.migration_info?.is_migrant || false}
                        onChange={e =>
                          handleFieldChange('migration_info', {
                            ...editedResident?.migration_info,
                            is_migrant: e.target.checked,
                          })
                        }
                        className="bg-default size-4 rounded border-default text-gray-600 focus:ring-blue-500"
                      />
                      <label htmlFor="is_migrant" className="text-sm text-gray-600">
                        Is Migrant
                      </label>
                    </div>
                    {editedResident?.migration_info?.is_migrant && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                          label="Previous Address"
                          type="text"
                          value={editedResident?.migration_info?.previous_address || ''}
                          onChange={e =>
                            handleFieldChange('migration_info', {
                              ...editedResident?.migration_info,
                              previous_address: e.target.value,
                            })
                          }
                          placeholder="Previous address"
                        />
                        <InputField
                          label="Previous Country"
                          type="text"
                          value={editedResident?.migration_info?.previous_country || ''}
                          onChange={e =>
                            handleFieldChange('migration_info', {
                              ...editedResident?.migration_info,
                              previous_country: e.target.value,
                            })
                          }
                          placeholder="Previous country"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Is Migrant</dt>
                      <dd className="mt-1 text-sm text-gray-600">
                        {formatBoolean(resident.migration_info?.is_migrant)}
                      </dd>
                    </div>
                    {resident.migration_info?.is_migrant && (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Migration Type</dt>
                          <dd className="mt-1 text-sm text-gray-600">
                            {formatEnumValue(resident.migration_info?.migration_type)}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-600">Previous Address</dt>
                          <dd className="mt-1 text-sm text-gray-600">
                            {resident.migration_info?.previous_address || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Previous Country</dt>
                          <dd className="mt-1 text-sm text-gray-600">
                            {resident.migration_info?.previous_country || 'N/A'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Migration Date</dt>
                          <dd className="mt-1 text-sm text-gray-600">
                            {resident.migration_info?.migration_date
                              ? new Date(
                                  resident.migration_info.migration_date
                                ).toLocaleDateString()
                              : 'N/A'}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                )}
              </div>
            </div>

            {/* Sectoral Information Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Sectoral Classification</h3>
              </div>
              <div className="px-6 py-4">
                {isEditing ? (
                  <div className="text-sm text-gray-600">
                    <p className="mb-4">
                      Sectoral classifications will be automatically calculated when you save the
                      changes based on the resident&rsquo;s age, employment status, and other
                      information.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <p>
                          <strong>Auto-calculated fields:</strong>
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Labor Force Status</li>
                          <li>Employment Status</li>
                          <li>Senior Citizen Status</li>
                          <li>Out of School Status</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <strong>Manual classifications:</strong>
                        </p>
                        <div className="space-y-2">
                          {['is_pwd', 'is_solo_parent', 'is_ofw', 'is_indigenous_people'].map(
                            field => (
                              <div key={field} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={field}
                                  checked={!!(editedResident as any)?.[field]}
                                  onChange={e =>
                                    handleFieldChange(field as keyof Resident, e.target.checked)
                                  }
                                  className="bg-default size-3 rounded border-default text-gray-600 focus:ring-blue-500"
                                />
                                <label htmlFor={field} className="text-xs">
                                  {field.replace(/^is_/, '').replace(/_/g, ' ').toUpperCase()}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p>
                      Sectoral classifications are automatically calculated based on other resident
                      information and displayed in the Classifications section.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Side Information */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Quick Actions</h3>
              </div>
              <div className="space-y-3 px-6 py-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    {saveError && (
                      <div className="mt-2 text-center text-sm text-red-600">{saveError}</div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit Information
                    </button>
                    <button className="bg-default hover:bg-default-hover w-full rounded-md border border-default px-4 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Generate Certificate
                    </button>
                    <button className="bg-default hover:bg-default-hover w-full rounded-md border border-default px-4 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Export Data
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Classifications Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Classifications</h3>
                <p className="text-muted mt-1 text-xs">
                  Fields marked with <span className="text-gray-600 underline">(auto)</span> are
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
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Additional Information</h3>
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
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">System Information</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Record ID</dt>
                    <dd className="mt-1 font-mono text-xs text-gray-600">{resident.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Created Date</dt>
                    <dd className="mt-1 text-sm text-gray-600">
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
                      <dt className="text-sm font-medium text-gray-600">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-600">
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
                      <dt className="text-sm font-medium text-gray-600">Household ID</dt>
                      <dd className="mt-1 font-mono text-xs text-gray-600">
                        {resident.household_id}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Active Status</dt>
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
    </DashboardLayout>
  );
}

export default function ResidentDetailPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <ResidentDetailContent />
    </ProtectedRoute>
  );
}
