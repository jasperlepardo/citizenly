'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logger, logError } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

interface Resident {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  birthdate: string;
  sex: 'male' | 'female';
  civil_status?: string;
  citizenship?: string;
  occupation_title?: string;
  place_of_birth?: string;
  household_id?: string;
  household_code?: string;
  barangay_code: string;
}

interface Household {
  id: string;
  code: string;
  household_number?: string;
  house_number?: string;
  street_name?: string;
  subdivision?: string;
  zip_code?: string;
  barangay_code: string;
  total_members?: number;
  household_head_id?: string;
  created_at: string;
  head_resident?: {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    extension_name?: string;
  };
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
  const { userProfile } = useAuth();
  const [resident, setResident] = useState<Resident | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const residentId = searchParams.get('resident_id');

  useEffect(() => {
    if (residentId) {
      fetchResidentData();
    } else {
      setLoading(false);
      setError('No resident ID provided');
    }
  }, [residentId]);

  const fetchResidentData = async () => {
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
          .select(`
            *,
            head_resident:residents!households_household_head_id_fkey(
              id,
              first_name,
              middle_name,
              last_name,
              extension_name
            )
          `)
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
        .select(`
          barangay_name,
          municipality:psgc_municipalities(
            municipality_name,
            province:psgc_provinces(
              province_name,
              region:psgc_regions(region_name)
            )
          )
        `)
        .eq('barangay_code', residentData.barangay_code)
        .single();

      if (addressError) {
        logError(addressError, 'FETCH_ADDRESS_ERROR');
      } else {
        setAddressInfo({
          barangay: addressData.barangay_name,
          municipality: addressData.municipality.municipality_name,
          province: addressData.municipality.province.province_name,
          region: addressData.municipality.province.region.region_name,
        });
      }

    } catch (err) {
      const error = err as Error;
      logError(error, 'FETCH_RESIDENT_DATA_ERROR');
      setError(error.message || 'Failed to fetch resident data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resident data...</p>
        </div>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Resident not found'}
          </p>
          <Link
            href="/residents"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            Back to Residents
          </Link>
        </div>
      </div>
    );
  }

  const formatName = (person: any) => {
    const parts = [
      person.first_name,
      person.middle_name,
      person.last_name,
      person.extension_name
    ].filter(Boolean);
    return parts.join(' ');
  };

  const formatAddress = () => {
    const parts = [];
    
    if (household?.house_number) parts.push(`House ${household.house_number}`);
    if (household?.street_name) parts.push(household.street_name);
    if (household?.subdivision) parts.push(household.subdivision);
    if (addressInfo?.barangay) parts.push(`Brgy. ${addressInfo.barangay}`);
    if (addressInfo?.municipality) parts.push(addressInfo.municipality);
    if (addressInfo?.province) parts.push(addressInfo.province);
    
    return parts.join(', ');
  };

  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen print:bg-white print:p-0">
      {/* Header - only show on screen */}
      <div className="mb-8 print:hidden">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/residents"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-950 shadow-xs hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Residents
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          RBI Form - {formatName(resident)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Records of Barangay Inhabitant Form
        </p>
      </div>

      {/* Print Button */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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