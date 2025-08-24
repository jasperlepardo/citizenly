'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/data/supabase';
import { logger, logError } from '@/lib/logging/secure-logger';
import { useAuth } from '@/contexts/AuthContext';
import HouseholdForm, { HouseholdFormData, HouseholdFormMode } from '@/components/templates/HouseholdForm/NewHouseholdForm';
import { Button } from '@/components/atoms';
import { lookupAddressLabels, lookupHouseholdTypeLabels, lookupHouseholdHeadLabel } from '@/lib/utilities/address-lookup';

interface Household {
  id: string;
  code: string;
  name?: string;
  house_number?: string;
  barangay_code: string;
  created_at: string;
  household_head_id?: string;
  street_id?: string;
  subdivision_id?: string;
}

interface HouseholdMember {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  birthdate: string;
  sex: 'male' | 'female';
  civil_status: string;
  relationship_to_head?: string;
  mobile_number: string;
  email?: string;
}

function HouseholdDetailContent() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const householdCode = params.id as string;
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<HouseholdFormMode>('view');
  const [householdFormData, setHouseholdFormData] = useState<HouseholdFormData | null>(null);
  const [addressLabels, setAddressLabels] = useState<any>(null);
  const [householdTypeLabels, setHouseholdTypeLabels] = useState<any>(null);
  const [householdHeadLabel, setHouseholdHeadLabel] = useState<string>('');

  useEffect(() => {
    console.log('useEffect triggered:', { householdCode, authLoading, user: !!user });

    const loadHouseholdDetails = async () => {
      if (!householdCode || authLoading || !user) {
        console.log('Early return:', { householdCode, authLoading, user: !!user });
        return;
      }

      console.log('Starting to load household details...');
      try {
        setLoading(true);

        // Load household details - simplified query first
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('code', householdCode)
          .single();

        console.log('Household query result:', { householdData, householdError });

        if (householdError) {
          console.error('Household error:', householdError);
          setError('Household not found');
          return;
        }

        console.log('Setting household data:', householdData);
        setHousehold(householdData);

        // Transform household data to form data format
        const formData: HouseholdFormData = {
          houseNumber: householdData.house_number || '',
          streetId: householdData.street_id || '',
          subdivisionId: householdData.subdivision_id || '',
          barangayCode: householdData.barangay_code || '',
          cityMunicipalityCode: householdData.city_municipality_code || '',
          provinceCode: householdData.province_code || '',
          regionCode: householdData.region_code || '',
          noOfFamilies: householdData.no_of_families || 1,
          noOfHouseholdMembers: householdData.no_of_household_members || 0,
          noOfMigrants: householdData.no_of_migrants || 0,
          householdType: householdData.household_type || '',
          tenureStatus: householdData.tenure_status || '',
          tenureOthersSpecify: householdData.tenure_others_specify || '',
          householdUnit: householdData.household_unit || '',
          householdName: householdData.name || '',
          monthlyIncome: householdData.monthly_income || 0,
          householdHeadId: householdData.household_head_id || '',
          householdHeadPosition: householdData.household_head_position || '',
          code: householdData.code,
          isActive: householdData.is_active,
        };
        setHouseholdFormData(formData);

        // Lookup labels for display in view mode
        const [addressLookup, householdTypeLookup, householdHeadLookup] = await Promise.all([
          lookupAddressLabels({
            regionCode: formData.regionCode,
            provinceCode: formData.provinceCode,
            cityMunicipalityCode: formData.cityMunicipalityCode,
            barangayCode: formData.barangayCode,
            streetId: formData.streetId,
            subdivisionId: formData.subdivisionId,
          }),
          lookupHouseholdTypeLabels({
            householdType: formData.householdType,
            tenureStatus: formData.tenureStatus,
            householdUnit: formData.householdUnit,
            householdHeadPosition: formData.householdHeadPosition,
          }),
          lookupHouseholdHeadLabel(formData.householdHeadId)
        ]);

        setAddressLabels(addressLookup);
        setHouseholdTypeLabels(householdTypeLookup);
        setHouseholdHeadLabel(householdHeadLookup || '');

        // Load all household members
        const { data: membersData, error: membersError } = await supabase
          .from('residents')
          .select('*')
          .eq('household_code', householdCode)
          .order('birthdate', { ascending: true });

        if (membersError) {
          logError(membersError, 'HOUSEHOLD_MEMBERS_ERROR');
          logger.error('Failed to load household members', { householdCode });
        } else {
          setMembers(membersData || []);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logError(error, 'HOUSEHOLD_LOAD_ERROR');
        logger.error('Failed to load household details', { householdCode });
        setError('Failed to load household details');
      } finally {
        setLoading(false);
      }
    };

    loadHouseholdDetails();
  }, [householdCode, authLoading, user]);

  const handleFormSubmit = async (formData: HouseholdFormData) => {
    // The form handles the database operations
    // After successful save, reload the household data
    if (household?.id) {
      const updatedHousehold = { ...household, ...formData, id: household.id };
      setHousehold(updatedHousehold);
      setHouseholdFormData(formData);
    }
  };

  const handleModeChange = (mode: HouseholdFormMode) => {
    setFormMode(mode);
  };

  // Create options for view mode display
  const getViewModeOptions = () => {
    const options: any = {};

    // Address options with current values
    if (addressLabels && householdFormData) {
      options.regionOptions = householdFormData.regionCode ? 
        [{ value: householdFormData.regionCode, label: addressLabels.regionLabel || householdFormData.regionCode }] : [];
      options.provinceOptions = householdFormData.provinceCode ? 
        [{ value: householdFormData.provinceCode, label: addressLabels.provinceLabel || householdFormData.provinceCode }] : [];
      options.cityOptions = householdFormData.cityMunicipalityCode ? 
        [{ value: householdFormData.cityMunicipalityCode, label: addressLabels.cityLabel || householdFormData.cityMunicipalityCode }] : [];
      options.barangayOptions = householdFormData.barangayCode ? 
        [{ value: householdFormData.barangayCode, label: addressLabels.barangayLabel || householdFormData.barangayCode }] : [];
      options.streetOptions = householdFormData.streetId ? 
        [{ value: householdFormData.streetId, label: addressLabels.streetLabel || householdFormData.streetId }] : [];
      options.subdivisionOptions = householdFormData.subdivisionId ? 
        [{ value: householdFormData.subdivisionId, label: addressLabels.subdivisionLabel || householdFormData.subdivisionId }] : [];
    }

    // Household type options with current values
    if (householdTypeLabels && householdFormData) {
      options.householdTypeOptions = householdFormData.householdType ? 
        [{ value: householdFormData.householdType, label: householdTypeLabels.householdTypeLabel || householdFormData.householdType }] : [];
      options.tenureStatusOptions = householdFormData.tenureStatus ? 
        [{ value: householdFormData.tenureStatus, label: householdTypeLabels.tenureStatusLabel || householdFormData.tenureStatus }] : [];
      options.householdUnitOptions = householdFormData.householdUnit ? 
        [{ value: householdFormData.householdUnit, label: householdTypeLabels.householdUnitLabel || householdFormData.householdUnit }] : [];
      options.householdHeadPositionOptions = householdFormData.householdHeadPosition ? 
        [{ value: householdFormData.householdHeadPosition, label: householdTypeLabels.householdHeadPositionLabel || householdFormData.householdHeadPosition }] : [];
    }

    // Household head options
    if (householdFormData?.householdHeadId && householdHeadLabel) {
      options.householdHeadOptions = [{ value: householdFormData.householdHeadId, label: householdHeadLabel }];
    }

    return options;
  };

  const formatFullName = (person: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  }) => {
    return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ');
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading || authLoading) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading household details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !household) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-md">
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
              Household Not Found
            </h1>
            <p className="font-montserrat mb-4 text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <Link
              href="/households"
              className="hover:bg-gray-50 dark:bg-gray-700 inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              Back to Households
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 -mx-6 mb-8 border-b border-gray-200 dark:border-gray-700 p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/households"
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-700 inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Households
              </Link>
              <div className="flex items-center space-x-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="size-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0H8v0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-400">Household #{household.code}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {members.length} member{members.length !== 1 ? 's' : ''} • Created{' '}
                    {new Date(household.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/reports/records-of-barangay-inhabitants-by-household?household=${household.code}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white dark:text-black shadow-xs hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c0 .621-.504 1.125-1.125 1.125H11.25a9 9 0 01-9-9V3.375c0-.621.504-1.125 1.125-1.125z"
                />
              </svg>
              Generate RBI Form
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Household Form */}
          <div className="space-y-8 lg:col-span-2">
            {/* Household Form */}
            {householdFormData && (
              <HouseholdForm
                mode={formMode}
                initialData={householdFormData}
                householdId={household.id}
                onSubmit={handleFormSubmit}
                onModeChange={handleModeChange}
                onCancel={() => router.push('/households')}
                // Pass view mode options for proper label display
                viewModeOptions={formMode === 'view' ? {
                  addressLabels,
                  householdTypeLabels,
                  householdHeadLabel
                } : undefined}
              />
            )}
          </div>

          {/* Right Column - Side Information */}
          <div className="space-y-8">
            {/* Household Members Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Household Members</h3>
              </div>

              {members.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No members found in this household.</p>
                </div>
              ) : (
                <div className="space-y-3 px-6 py-4">
                  {members.slice(0, 5).map(member => (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {formatFullName(member).split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {formatFullName(member)}
                            {household.household_head_id === member.id && (
                              <span className="ml-1 inline-flex items-center rounded-sm bg-blue-100 px-1 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                                Head
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {calculateAge(member.birthdate)} y/o, {member.sex}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/residents/${member.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <div className="pt-3 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        +{members.length - 5} more members
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 dark:text-gray-600">Quick Actions</h3>
              </div>
              <div className="space-y-3 px-6 py-4">
                <Link
                  href={`/reports/records-of-barangay-inhabitants-by-household?household=${household.code}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Generate RBI Form
                </Link>
                <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-700 w-full rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Export Household Data
                </button>
                <Link
                  href={`/residents/create?household=${household.code}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-green-700 focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Add New Member
                </Link>
              </div>
            </div>

            {/* Household Statistics Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Statistics</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</dt>
                    <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">{members.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Adults (18+)</dt>
                    <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {members.filter(m => calculateAge(m.birthdate) >= 18).length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Minors (Under 18)</dt>
                    <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {members.filter(m => calculateAge(m.birthdate) < 18).length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Senior Citizens (60+)</dt>
                    <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {members.filter(m => calculateAge(m.birthdate) >= 60).length}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function HouseholdDetailPage() {
  return <HouseholdDetailContent />;
}
