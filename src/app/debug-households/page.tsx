'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/templates';

export const dynamic = 'force-dynamic';

interface Household {
  id: string;
  code: string;
  household_number?: string;
  house_number?: string;
  barangay_code: string;
  created_at: string;
}

interface Resident {
  id: string;
  first_name: string;
  last_name: string;
  household_id?: string;
  household_code?: string;
}

function DebugHouseholdsContent() {
  const { userProfile } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDebugData = async () => {
      try {
        setLoading(true);

        // Load all households (not just from user's barangay)
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .limit(20)
          .order('created_at', { ascending: false });

        if (householdError) {
          console.error('Household error:', householdError);
          setError(`Household query error: ${householdError.message}`);
        } else {
          setHouseholds(householdData || []);
        }

        // Load some residents to see if they have household references
        const { data: residentData, error: residentError } = await supabase
          .from('residents')
          .select('id, first_name, last_name, household_id, household_code')
          .limit(10)
          .order('created_at', { ascending: false });

        if (residentError) {
          console.error('Resident error:', residentError);
        } else {
          setResidents(residentData || []);
        }
      } catch (err) {
        console.error('Error loading debug data:', err);
        setError('Failed to load debug data');
      } finally {
        setLoading(false);
      }
    };

    loadDebugData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-neutral-600">Loading debug information...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Database Debug Information</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* User Profile Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Profile Info:</h2>
          <p>
            <strong>Barangay Code:</strong> {userProfile?.barangay_code || 'Not set'}
          </p>
          <p>
            <strong>User ID:</strong> {userProfile?.id || 'Not set'}
          </p>
        </div>

        {/* Households */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Households in Database ({households.length} found):
          </h2>

          {households.length === 0 ? (
            <p className="text-gray-600">No households found in the database.</p>
          ) : (
            <div className="space-y-2">
              {households.map(household => (
                <div
                  key={household.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p>
                      <strong>Code:</strong> {household.code}
                    </p>
                    <p>
                      <strong>ID:</strong> {household.id}
                    </p>
                    <p>
                      <strong>Barangay:</strong> {household.barangay_code}
                    </p>
                    <p>
                      <strong>Created:</strong> {new Date(household.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <a
                      href={`/households/${household.code}`}
                      className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      View Details
                    </a>
                    <a
                      href={`/rbi-form?household=${household.code}`}
                      className="inline-block px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      RBI Form
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Residents */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            Recent Residents ({residents.length} found):
          </h2>

          {residents.length === 0 ? (
            <p className="text-gray-600">No residents found in the database.</p>
          ) : (
            <div className="space-y-2">
              {residents.map(resident => (
                <div key={resident.id} className="p-3 bg-gray-50 rounded">
                  <p>
                    <strong>Name:</strong> {resident.first_name} {resident.last_name}
                  </p>
                  <p>
                    <strong>Household ID:</strong> {resident.household_id || 'Not set'}
                  </p>
                  <p>
                    <strong>Household Code:</strong> {resident.household_code || 'Not set'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">How to Use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              If you see households above, click "RBI Form" next to any household to test the RBI
              form
            </li>
            <li>
              If no households are found, you need to create some residents first (they
              automatically create households)
            </li>
            <li>
              Go to{' '}
              <a href="/residents/create" className="text-blue-600 underline">
                /residents/create
              </a>{' '}
              to add residents
            </li>
            <li>Once you have households, you can generate RBI forms for them</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DebugHouseholdsPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <DebugHouseholdsContent />
    </ProtectedRoute>
  );
}
