'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/templates';
import { logger, logError } from '@/lib/secure-logger';

interface Household {
  code: string;
  street_name?: string;
  house_number?: string;
  subdivision?: string;
  barangay_code: string;
  created_at: string;
  head_resident?: {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
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
  const params = useParams();
  const householdCode = params.id as string;
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  useEffect(() => {
    const loadHouseholdDetails = async () => {
      if (!householdCode) return;

      try {
        setLoading(true);

        // Load household details with head resident info
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select(
            `
            *,
            head_resident:residents!households_household_head_id_fkey(
              id,
              first_name,
              middle_name,
              last_name
            )
          `
          )
          .eq('code', householdCode)
          .single();

        if (householdError) {
          setError('Household not found');
          return;
        }

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
  }, [householdCode]);

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

  if (loading) {
    return (
      <DashboardLayout searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-secondary">Loading household details...</p>
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
          <div className="max-w-md mx-auto text-center">
            <div className="bg-surface rounded-lg shadow-md border border-default p-6">
              <div className="text-red-600 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
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
              <h1 className="font-montserrat font-semibold text-lg text-primary mb-2">
                Household Not Found
              </h1>
              <p className="font-montserrat text-secondary text-sm mb-4">{error}</p>
              <Link
                href="/households"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary border border-default rounded-md hover:bg-surface-hover"
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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-surface shadow-sm border-b border-default -mx-6 px-6 py-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/households"
                className="inline-flex items-center px-3 py-2 border border-default shadow-sm text-sm font-medium rounded-md text-secondary bg-surface hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                  <h1 className="text-2xl font-bold text-primary">Household #{household.code}</h1>
                  <p className="text-sm text-secondary">
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
                className="h-4 w-4"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Household Information Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Household Information</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-secondary">Household Number</dt>
                    <dd className="mt-1 text-sm text-primary font-mono">#{household.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-secondary">Head of Household</dt>
                    <dd className="mt-1 text-sm text-primary">
                      {household.head_resident
                        ? formatFullName(household.head_resident)
                        : 'No head assigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-secondary">Address</dt>
                    <dd className="mt-1 text-sm text-primary">
                      {[household.house_number, household.street_name, household.subdivision]
                        .filter(Boolean)
                        .join(', ') || 'No address specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-secondary">Total Members</dt>
                    <dd className="mt-1 text-sm text-primary">{members.length}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-secondary">Created Date</dt>
                    <dd className="mt-1 text-sm text-primary">
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
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Household Members</h3>
              </div>

              {members.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-secondary">No members found in this household.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border-light">
                    <thead className="bg-background-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Sex
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Civil Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border-light">
                      {members.map(member => (
                        <tr key={member.id} className="hover:bg-surface-hover transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary">
                              {formatFullName(member)}
                              {household.head_resident?.id === member.id && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Head
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                            {calculateAge(member.birthdate)} years old
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary capitalize">
                            {member.sex}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary capitalize">
                            {member.civil_status.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                            <div>{member.mobile_number}</div>
                            {member.email && (
                              <div className="text-xs text-muted">{member.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/residents/${member.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
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
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Quick Actions</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <Link
                  href={`/rbi-form?household=${household.code}`}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center justify-center"
                >
                  Generate RBI Form
                </Link>
                <button className="w-full bg-surface border border-default text-secondary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Export Household Data
                </button>
                <Link
                  href={`/residents/create?household=${household.code}`}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 inline-flex items-center justify-center"
                >
                  Add New Member
                </Link>
              </div>
            </div>

            {/* Household Statistics Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Statistics</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-secondary">Total Members</dt>
                    <dd className="text-sm font-medium text-primary">{members.length}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-secondary">Adults (18+)</dt>
                    <dd className="text-sm font-medium text-primary">
                      {members.filter(m => calculateAge(m.birthdate) >= 18).length}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-secondary">Minors (Under 18)</dt>
                    <dd className="text-sm font-medium text-primary">
                      {members.filter(m => calculateAge(m.birthdate) < 18).length}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-secondary">Senior Citizens (60+)</dt>
                    <dd className="text-sm font-medium text-primary">
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
