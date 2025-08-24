'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/atoms';
import { ResidentForm } from '@/components/templates/ResidentForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/data/supabase';
import { logError } from '@/lib/logging/secure-logger';
import type { ResidentFormState } from '@/types/resident-form';

export const dynamic = 'force-dynamic';

export default function ResidentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useAuth();
  const [resident, setResident] = useState<ResidentFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const residentId = params.id as string;

  useEffect(() => {
    if (residentId) {
      fetchResident();
    }
  }, [residentId]);

  const fetchResident = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the API endpoint instead of direct Supabase query for consistency
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

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

      const { resident: residentData } = await response.json();

      if (!residentData) {
        throw new Error('No resident data found');
      }

      // Transform the data to match ResidentFormState interface
      const formData: ResidentFormState = {
        // Personal Information
        first_name: residentData.first_name || '',
        middle_name: residentData.middle_name || '',
        last_name: residentData.last_name || '',
        extension_name: residentData.extension_name || '',
        sex: residentData.sex || '',
        civil_status: residentData.civil_status || '',
        civil_status_others_specify: residentData.civil_status_others_specify || '',
        citizenship: residentData.citizenship || '',
        birthdate: residentData.birthdate || '',
        birth_place_name: residentData.birth_place_name || '',
        birth_place_code: residentData.birth_place_code || '',
        birth_place_level: residentData.birth_place_level || '',
        philsys_card_number: residentData.philsys_card_number || '',
        philsys_last4: residentData.philsys_last4 || '',
        education_attainment: residentData.education_attainment || '',
        is_graduate: residentData.is_graduate || false,
        employment_status: residentData.employment_status || '',
        employment_code: residentData.employment_code || '',
        employment_name: residentData.employment_name || '',
        occupation_code: residentData.occupation_code || '',
        psoc_level: residentData.psoc_level || 0,
        occupation_title: residentData.occupation_title || '',
        
        // Contact Information
        email: residentData.email || '',
        telephone_number: residentData.telephone_number || '',
        mobile_number: residentData.mobile_number || '',
        household_code: residentData.household_code || '',
        
        // Physical Personal Details
        blood_type: residentData.blood_type || '',
        complexion: residentData.complexion || '',
        height: residentData.height || 0,
        weight: residentData.weight || 0,
        ethnicity: residentData.ethnicity || '',
        religion: residentData.religion || '',
        religion_others_specify: residentData.religion_others_specify || '',
        is_voter: residentData.is_voter,
        is_resident_voter: residentData.is_resident_voter,
        last_voted_date: residentData.last_voted_date || '',
        mother_maiden_first: residentData.mother_maiden_first || '',
        mother_maiden_middle: residentData.mother_maiden_middle || '',
        mother_maiden_last: residentData.mother_maiden_last || '',
        
        // Sectoral Information
        is_labor_force: residentData.is_labor_force || false,
        is_labor_force_employed: residentData.is_labor_force_employed || false,
        is_unemployed: residentData.is_unemployed || false,
        is_overseas_filipino_worker: residentData.is_overseas_filipino_worker || false,
        is_person_with_disability: residentData.is_person_with_disability || false,
        is_out_of_school_children: residentData.is_out_of_school_children || false,
        is_out_of_school_youth: residentData.is_out_of_school_youth || false,
        is_senior_citizen: residentData.is_senior_citizen || false,
        is_registered_senior_citizen: residentData.is_registered_senior_citizen || false,
        is_solo_parent: residentData.is_solo_parent || false,
        is_indigenous_people: residentData.is_indigenous_people || false,
        is_migrant: residentData.is_migrant || false,
        
        // Migration Information
        previous_barangay_code: residentData.previous_barangay_code || '',
        previous_city_municipality_code: residentData.previous_city_municipality_code || '',
        previous_province_code: residentData.previous_province_code || '',
        previous_region_code: residentData.previous_region_code || '',
        length_of_stay_previous_months: residentData.length_of_stay_previous_months || 0,
        reason_for_leaving: residentData.reason_for_leaving || '',
        date_of_transfer: residentData.date_of_transfer || '',
        reason_for_transferring: residentData.reason_for_transferring || '',
        duration_of_stay_current_months: residentData.duration_of_stay_current_months || 0,
        is_intending_to_return: residentData.is_intending_to_return || false,
      };

      setResident(formData);
    } catch (err) {
      const error = err as Error;
      logError(error, 'FETCH_RESIDENT_ERROR');
      setError(error.message || 'Failed to fetch resident data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ResidentFormState) => {
    try {
      // Use the API endpoint for updating the resident
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

      // Navigate back to the resident detail page
      router.push(`/residents/${residentId}`);
    } catch (err) {
      const error = err as Error;
      logError(error, 'UPDATE_RESIDENT_ERROR');
      setError(error.message || 'Failed to update resident');
      throw error; // Let the form handle the error display
    }
  };

  const handleCancel = () => {
    router.push(`/residents/${residentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resident...</p>
        </div>
      </div>
    );
  }

  if (error && !resident) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Resident
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/residents/${residentId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-950 shadow-xs hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl/8 font-semibold text-zinc-950 dark:text-white">
            Edit Resident
          </h1>
          <p className="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            Update resident information
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* ResidentForm Template */}
      {resident && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <ResidentForm
            initialData={resident}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}