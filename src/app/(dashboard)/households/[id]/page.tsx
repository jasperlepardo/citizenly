'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import HouseholdForm, {
  HouseholdFormData,
  HouseholdFormMode,
} from '@/components/templates/Form/Household/HouseholdForm';
import { useAuth } from '@/contexts';
import { supabase } from '@/lib/data/supabase';
import { logger, logError } from '@/lib/logging/secure-logger';
import { HouseholdRecord, HouseholdMemberWithResident } from '@/types/domain/households/households';
import { lookupHouseholdTypeLabels } from '@/services/domain/geography/addressHelpers';
import { SupabaseGeographicRepository } from '@/services/infrastructure/repositories/SupabaseGeographicRepository';

function HouseholdDetailContent() {
  const { user, session, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const householdCode = params.id as string;
  const [household, setHousehold] = useState<HouseholdRecord | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<HouseholdFormMode>('view');
  const [householdFormData, setHouseholdFormData] = useState<HouseholdFormData | null>(null);
  const [addressLabels, setAddressLabels] = useState<Record<string, unknown> | null>(null);
  const [householdTypeLabels, setHouseholdTypeLabels] = useState<Record<string, unknown> | null>(
    null
  );
  const [householdHeadLabel, setHouseholdHeadLabel] = useState<string>('');

  useEffect(() => {
    // Load household details when params are available

    const loadHouseholdDetails = async () => {
      // More stringent authentication checks
      if (!householdCode || authLoading || !user) {
        return;
      }

      // Ensure we have a valid session before making the query
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.debug('No valid session available, skipping household query');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading household details for code:', householdCode);
        
        // Debug: Check RLS functions
        const { data: userAccessLevel, error: accessLevelError } = await supabase.rpc('user_access_level');
        const { data: userBarangayCode, error: barangayCodeError } = await supabase.rpc('user_barangay_code');
        console.log('Debug - User access level:', userAccessLevel, 'Error:', accessLevelError?.message);
        console.log('Debug - User barangay code:', userBarangayCode, 'Error:', barangayCodeError?.message);
        console.log('Debug - Target household barangay:', '042114014');
        console.log('Debug - Codes match:', userBarangayCode === '042114014');
        
        // Test if we can query households without the specific household filter
        const { data: allUserHouseholds, error: allHouseholdsError } = await supabase
          .from('households')
          .select('code, barangay_code')
          .limit(5);
        console.log('Debug - User can access households:', allUserHouseholds?.length || 0, 'Error:', allHouseholdsError?.message);

        // Load household details - handle single record properly
        const { data: householdResults, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('code', householdCode);

        let householdData = null;
        
        if (householdError) {
          // Handle query error
          console.log('Household query error:', householdError);
        } else if (!householdResults || householdResults.length === 0) {
          // No household found with this code
          console.log('No household found with code:', householdCode);
          setError(`Household with code "${householdCode}" not found`);
          return;
        } else if (householdResults.length > 1) {
          // Multiple households found (unexpected)
          console.warn(`Multiple households found with code ${householdCode}:`, householdResults.length);
          householdData = householdResults[0]; // Use the first one
        } else {
          // Exactly one household found
          householdData = householdResults[0];
        }
          
        console.log('Query completed:', { 
          hasData: !!householdData, 
          hasError: !!householdError
        });

        // Handle actual database errors (not "no results" which is handled above)
        if (householdError) {
          // Only log error if it's not an authentication-related issue
          if (householdError.code !== 'PGRST301') {
            console.error('Database error loading household:', householdError);
            logger.error('Household database query failed', { 
              error: householdError.message,
              code: householdError.code,
              household_code: householdCode
            });
          }
          setError(`Database error: ${householdError.message || 'Unknown error'}`);
          return;
        }

        // Setting household data from query result
        setHousehold(householdData);

        // Use household data directly as it already matches schema
        const formData: HouseholdFormData = {
          ...householdData,
          // Ensure form-specific fields have defaults
          isEditing: false,
          isDirty: false,
          lastModified: new Date().toISOString(),
        };
        setHouseholdFormData(formData);

        // Lookup labels for display in view mode
        const geographicRepository = new SupabaseGeographicRepository();
        
        const [addressLookupResult, householdTypeLookup] = await Promise.all([
          geographicRepository.lookupAddressLabels({
            regionCode: formData.region_code || undefined,
            provinceCode: formData.province_code || undefined,
            cityMunicipalityCode: formData.city_municipality_code || undefined,
            barangayCode: formData.barangay_code || undefined,
            streetId: formData.street_id || undefined,
            subdivisionId: formData.subdivision_id || undefined,
          }),
          lookupHouseholdTypeLabels({
            householdType: formData.household_type || undefined,
            tenureStatus: formData.tenure_status || undefined,
            householdUnit: formData.household_unit || undefined,
            householdHeadPosition: formData.household_head_position || undefined,
          }),
        ]);

        const addressLookup = addressLookupResult.success ? addressLookupResult.data : {};
        const householdHeadLookup = '';

        // Log if address lookup failed (for debugging database permission issues)
        if (!addressLookupResult.success) {
          logger.warn('Address lookup failed, using empty labels', { 
            error: addressLookupResult.error,
            householdCode 
          });
        }

        setAddressLabels(addressLookup as Record<string, unknown>);
        setHouseholdTypeLabels(householdTypeLookup as Record<string, unknown>);
        setHouseholdHeadLabel(householdHeadLookup || '');

        // Load all household members
        const { data: membersData, error: membersError } = await supabase
          .from('residents')
          .select('*')
          .eq('household_code', householdCode)
          .order('birthdate', { ascending: true });

        if (membersError) {
          // Only log non-authentication errors
          if (membersError.code !== 'PGRST301') {
            console.error('Members query failed - Raw error:', membersError);
            console.error('Members query details:', {
              message: membersError.message,
              code: membersError.code,
              details: membersError.details,
              hint: membersError.hint,
              householdCode,
            });
            logError(membersError, 'HOUSEHOLD_MEMBERS_ERROR');
            logger.warn('Failed to load household members', { 
              errorMessage: membersError.message,
              errorCode: membersError.code,
              household_code: householdCode
            });
          }
          // Still set empty array to prevent UI issues
          setMembers([]);
        } else {
          setMembers(membersData || []);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Only log if it's not an authentication timeout or permission issue
        if (!error.message.includes('No valid session') && !error.message.includes('JWT')) {
          logError(error, 'HOUSEHOLD_LOAD_ERROR');
          logger.error('Failed to load household details', { 
            error: error.message,
            stack: error.stack,
            householdCode,
            authLoading,
            hasUser: !!user,
            fullError: JSON.stringify(err, null, 2)
          });
        }
        
        setError(`Failed to load household details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadHouseholdDetails();
  }, [householdCode, authLoading, user]);

  const handleFormSubmit = async (formData: HouseholdFormData) => {
    // The form handles the database operations
    // After successful save, reload the household data
    if (household?.code) {
      const updatedHousehold = { ...household, ...formData };
      setHousehold(updatedHousehold);
      setHouseholdFormData(formData);
    }
  };

  const handleModeChange = (mode: HouseholdFormMode) => {
    setFormMode(mode);
  };

  // View mode options removed - not currently used

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
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Loading household details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !household) {
    return (
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
              Household Not Found
            </h1>
            <p className="font-montserrat mb-4 text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <Link
              href="/households"
              className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
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
      <div className="-mx-6 mb-8 border-b border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/households"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-xs hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
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
                <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  Household #{household.code}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {members.length} member{members.length !== 1 ? 's' : ''} • Created{' '}
                  {household.created_at
                    ? new Date(household.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/reports/records-of-barangay-inhabitants-by-household?household=${household.code}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:text-black"
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
              householdId={household.code}
              onSubmit={handleFormSubmit}
              onModeChange={handleModeChange}
              onCancel={() => router.push('/households')}
              // Pass view mode options for proper label display
              viewModeOptions={
                formMode === 'view'
                  ? {
                      addressLabels,
                      household_typeLabels: householdTypeLabels,
                      householdHeadLabel,
                    }
                  : undefined
              }
            />
          )}
        </div>

        {/* Right Column - Side Information */}
        <div className="space-y-8">
          {/* Household Members Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Household Members
              </h3>
            </div>

            {members.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No members found in this household.
                </p>
              </div>
            ) : (
              <div className="space-y-3 px-6 py-4">
                {members.slice(0, 5).map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {formatFullName(member)
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
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
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3 px-6 py-4">
              <Link
                href={`/reports/records-of-barangay-inhabitants-by-household?household=${household.code}`}
                className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:text-black"
              >
                Generate RBI Form
              </Link>
              <button className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                Export Household Data
              </button>
              <Link
                href={`/residents/create?household=${household.code}`}
                className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-hidden dark:text-black"
              >
                Add New Member
              </Link>
            </div>
          </div>

          {/* Household Statistics Card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Statistics</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Members
                  </dt>
                  <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {members.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Adults (18+)
                  </dt>
                  <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {members.filter(m => calculateAge(m.birthdate) >= 18).length}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Minors (Under 18)
                  </dt>
                  <dd className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {members.filter(m => calculateAge(m.birthdate) < 18).length}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Senior Citizens (60+)
                  </dt>
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
