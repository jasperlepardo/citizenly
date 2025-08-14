'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/atoms';
import { useAuth } from '@/contexts/AuthContext';

interface HouseholdDetail {
  code: string;
  name?: string;
  house_number?: string;
  street_name?: string;
  subdivision?: string;
  barangay_code: string;
  created_at: string;
  head_resident?: {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  member_count?: number;
  members?: Array<{
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    relationship_to_head?: string;
  }>;
}

export default function HouseholdDetailContent() {
  const [household, setHousehold] = useState<HouseholdDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const householdId = params.id as string;

  useEffect(() => {
    const fetchHousehold = async () => {
      if (!session || !householdId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/households/${householdId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Household not found');
          } else {
            throw new Error(`Failed to fetch household: ${response.status}`);
          }
          return;
        }

        const data = await response.json();
        setHousehold(data);
      } catch (err) {
        console.error('Error fetching household:', err);
        setError(err instanceof Error ? err.message : 'Failed to load household');
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [session, householdId]);

  const formatFullName = (person: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  }) => {
    const parts = [person.first_name, person.middle_name, person.last_name].filter(Boolean);
    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Loading household details</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we fetch the information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl text-red-600">⚠️</span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Error Loading Household</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              🔄 Retry
            </Button>
            <Button
              variant="secondary-outline"
              onClick={() => router.push('/households')}
              className="flex items-center gap-2"
            >
              ← Back to Households
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <span className="text-xl text-yellow-600">🔍</span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Household Not Found</h3>
          <p className="mt-2 text-gray-600">
            The requested household could not be found in our records.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => router.push('/households')}
              className="flex items-center gap-2"
            >
              ← Back to Households
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Household {household.code}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="text-sm text-gray-600">Members: {household.member_count || 0}</span>
              <span className="text-sm text-gray-600">
                Created: {new Date(household.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary-outline"
              onClick={() => router.push('/households')}
              className="flex items-center gap-2"
            >
              ← Back to List
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/households/${household.code}/edit`)}
              className="flex items-center gap-2"
            >
              ✏️ Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Household Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
            🏠 Household Information
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-secondary block text-sm font-medium">Household Code</span>
              <span className="text-primary">{household.code}</span>
            </div>
            {household.name && (
              <div>
                <span className="text-secondary block text-sm font-medium">Household Name</span>
                <span className="text-primary">{household.name}</span>
              </div>
            )}
            <div>
              <span className="text-secondary block text-sm font-medium">Address</span>
              <span className="text-primary">
                {[household.house_number, household.street_name, household.subdivision]
                  .filter(Boolean)
                  .join(', ') || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-secondary block text-sm font-medium">Barangay Code</span>
              <span className="text-primary">{household.barangay_code}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
            👤 Household Head
          </h2>
          <div className="space-y-3">
            {household.head_resident ? (
              <>
                <div>
                  <span className="text-secondary block text-sm font-medium">Name</span>
                  <span className="text-primary">{formatFullName(household.head_resident)}</span>
                </div>
                <div>
                  <span className="text-secondary block text-sm font-medium">Resident ID</span>
                  <span className="text-primary">{household.head_resident.id}</span>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <span className="text-gray-500">No household head assigned</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      {household.members && household.members.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
            👥 Household Members ({household.members.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {household.members.map(member => (
              <div key={member.id} className="rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">{formatFullName(member)}</h4>
                <p className="mt-1 text-sm text-gray-600">
                  {member.relationship_to_head || 'Member'}
                </p>
                <p className="mt-1 text-xs text-gray-500">ID: {member.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
