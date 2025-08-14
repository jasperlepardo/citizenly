'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/organisms';
import { DashboardLayout } from '@/components/templates';
import { logger, logError } from '@/lib/secure-logger';
import { useAuth } from '@/contexts/AuthContext';

interface Household {
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
  const householdCode = params.id as string;
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

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
      <DashboardLayout searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm}>
        <div className="p-6">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Loading household details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !household) {
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
                Household Not Found
              </h1>
              <p className="font-montserrat mb-4 text-sm text-gray-600">{error}</p>
              <Link
                href="/households"
                className="hover:bg-default-hover inline-flex items-center rounded-md border border-default px-4 py-2 text-sm font-medium text-gray-600"
              >
                Back to Households
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm}>
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="bg-default -mx-6 mb-8 border-b border-default p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/households"
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
                  <h1 className="text-2xl font-bold text-gray-600">Household #{household.code}</h1>
                  <p className="text-sm text-gray-600">
                    {members.length} member{members.length !== 1 ? 's' : ''} • Created{' '}
                    {new Date(household.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/rbi-form?household=${household.code}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          {/* Left Column - Main Information */}
          <div className="space-y-8 lg:col-span-2">
            {/* Household Information Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Household Information</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Household Number</dt>
                    <dd className="mt-1 font-mono text-sm text-gray-600">#{household.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Head of Household</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {household.household_head_id ? 'Head assigned' : 'No head assigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Address</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {household.house_number || 'No address specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Total Members</dt>
                    <dd className="mt-1 text-sm text-gray-600">{members.length}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Created Date</dt>
                    <dd className="mt-1 text-sm text-gray-600">
                      {new Date(household.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Household Members Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Household Members</h3>
              </div>

              {members.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No members found in this household.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="divide-border-light min-w-full divide-y">
                    <thead className="bg-default-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                          Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                          Sex
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                          Civil Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border-light bg-default divide-y">
                      {members.map(member => (
                        <tr key={member.id} className="hover:bg-default-hover transition-colors">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-medium text-gray-600">
                              {formatFullName(member)}
                              {household.household_head_id === member.id && (
                                <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                  Head
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                            {calculateAge(member.birthdate)} years old
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-600">
                            {member.sex}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-600">
                            {member.civil_status.replace('_', ' ')}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                            <div>{member.mobile_number}</div>
                            {member.email && (
                              <div className="text-muted text-xs">{member.email}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            <Link
                              href={`/residents/${member.id}`}
                              className="text-gray-600 hover:text-gray-800 hover:underline"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Side Information */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Quick Actions</h3>
              </div>
              <div className="space-y-3 px-6 py-4">
                <Link
                  href={`/rbi-form?household=${household.code}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Generate RBI Form
                </Link>
                <button className="bg-default hover:bg-default-hover w-full rounded-md border border-default px-4 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Export Household Data
                </button>
                <Link
                  href={`/residents/create?household=${household.code}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Add New Member
                </Link>
              </div>
            </div>

            {/* Household Statistics Card */}
            <div className="bg-default rounded-lg border border-default shadow">
              <div className="border-b border-default px-6 py-4">
                <h3 className="text-lg font-medium text-gray-600">Statistics</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Total Members</dt>
                    <dd className="text-sm font-medium text-gray-600">{members.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Adults (18+)</dt>
                    <dd className="text-sm font-medium text-gray-600">
                      {members.filter(m => calculateAge(m.birthdate) >= 18).length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Minors (Under 18)</dt>
                    <dd className="text-sm font-medium text-gray-600">
                      {members.filter(m => calculateAge(m.birthdate) < 18).length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Senior Citizens (60+)</dt>
                    <dd className="text-sm font-medium text-gray-600">
                      {members.filter(m => calculateAge(m.birthdate) >= 60).length}
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

export default function HouseholdDetailPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <HouseholdDetailContent />
    </ProtectedRoute>
  );
}
