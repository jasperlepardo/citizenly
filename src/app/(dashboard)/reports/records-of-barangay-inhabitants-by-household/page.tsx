'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/data/supabase';
import { logger, logError } from '@/lib/logging/secure-logger';
import { HouseholdRecord, HouseholdMemberWithResident } from '@/types/domain/households/households';

export const dynamic = 'force-dynamic';

interface Resident extends HouseholdMemberWithResident {
  citizenship?: string;
  place_of_birth?: string;
  household_id?: string;
}

interface AddressInfo {
  purok?: string;
  street?: string;
  subdivision?: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
}

function RBIFormContent() {
  const searchParams = useSearchParams();
  const {} = useAuth();
  const [resident, setResident] = useState<Resident | null>(null);
  const [, setHousehold] = useState<HouseholdRecord | null>(null);
  const [, setAddressInfo] = useState<AddressInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const residentId = searchParams.get('resident_id');

  const fetchResidentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch resident data
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('*')
        .eq('id', residentId)
        .single();

      if (residentError) {
        throw residentError;
      }

      setResident(residentData);

      // Fetch household data if resident has one
      if (residentData?.household_id) {
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select(
            `
            *,
            head_resident:residents!households_household_head_id_fkey(
              id,
              first_name,
              middle_name,
              last_name,
              extension_name
            )
          `
          )
          .eq('id', residentData.household_id)
          .single();

        if (householdError) {
          logError(householdError, 'FETCH_HOUSEHOLD_ERROR');
        } else {
          setHousehold(householdData);
        }
      }

      // Fetch address information based on barangay code
      const { data: addressData, error: addressError } = await supabase
        .from('psgc_barangays')
        .select(
          `
          barangay_name,
          municipality:psgc_municipalities(
            municipality_name,
            province:psgc_provinces(
              province_name,
              region:psgc_regions(region_name)
            )
          )
        `
        )
        .eq('barangay_code', residentData.barangay_code)
        .single();

      if (addressError) {
        logError(addressError, 'FETCH_ADDRESS_ERROR');
      } else if (
        addressData &&
        addressData.municipality &&
        Array.isArray(addressData.municipality) &&
        addressData.municipality[0]
      ) {
        const municipality = addressData.municipality[0];
        const province =
          municipality.province && Array.isArray(municipality.province)
            ? municipality.province[0]
            : null;
        const region =
          province && province.region && Array.isArray(province.region) ? province.region[0] : null;

        setAddressInfo({
          barangay: addressData.barangay_name,
          municipality: municipality.municipality_name,
          province: province?.province_name || '',
          region: region?.region_name || '',
        });
      }
    } catch (err) {
      const error = err as Error;
      logError(error, 'FETCH_RESIDENT_DATA_ERROR');
      setError(error.message || 'Failed to fetch resident data');
    } finally {
      setLoading(false);
    }
  }, [residentId]);

  useEffect(() => {
    if (residentId) {
      fetchResidentData();
    } else {
      setLoading(false);
      setError('No resident ID provided');
    }
  }, [residentId, fetchResidentData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resident data...</p>
        </div>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-600 dark:text-red-400">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Error Loading Data
          </h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error || 'Resident not found'}</p>
          <Link
            href="/residents"
            className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Residents
          </Link>
        </div>
      </div>
    );
  }

  const formatName = (person: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    extension_name?: string;
  }) => {
    const parts = [
      person.first_name,
      person.middle_name,
      person.last_name,
      person.extension_name,
    ].filter(Boolean);
    return parts.join(' ');
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-white p-6 dark:bg-gray-900 print:bg-white print:p-0">
      {/* Header - only show on screen */}
      <div className="mb-8 print:hidden">
        <div className="mb-4 flex items-center gap-4">
          <Link
            href="/residents"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-950 shadow-xs hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Residents
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          RBI Form - {formatName(resident)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Records of Barangay Inhabitant Form</p>
      </div>

      {/* Print Button */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden"
        >
          Print Form
        </button>
      </div>
    </div>
  );
}

export default function RBIFormPage() {
  return <RBIFormContent />;
}
