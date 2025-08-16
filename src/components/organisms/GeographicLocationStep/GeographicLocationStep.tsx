'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GeographicLocationStepProps {
  formData: {
    regionCode?: string;
    provinceCode?: string;
    cityMunicipalityCode?: string;
    barangayCode?: string;
    regionName?: string;
    provinceName?: string;
    cityMunicipalityName?: string;
    barangayName?: string;
  };
  updateFormData: (data: Partial<any>) => void;
  errors: Record<string, string>;
  required?: boolean;
}

export function GeographicLocationStep({
  formData,
  updateFormData: _updateFormData,
  errors,
  required: _required = true,
}: GeographicLocationStepProps) {
  const [names, setNames] = useState({
    regionName: '',
    provinceName: '',
    cityName: '',
    barangayName: '',
  });
  const [loading, setLoading] = useState(true);

  // Fetch names for the codes
  useEffect(() => {
    const fetchNames = async () => {
      if (!formData.barangayCode) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const response = await fetch('/api/user/geographic-location', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const hierarchy = await response.json();
          setNames({
            regionName: hierarchy.region?.name || '',
            provinceName: hierarchy.province?.name || '',
            cityName: hierarchy.city?.name || '',
            barangayName: hierarchy.barangay?.name || '',
          });
        }
      } catch (error) {
        console.error('Error fetching geographic names:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNames();
  }, [formData.barangayCode]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Geographic Location</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select your geographic location. This information will be used for administrative purposes
          and data collection.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Geographic Location</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          This resident will be assigned to your barangay's jurisdiction:
        </p>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Region:</span>
            <span className="text-gray-900 dark:text-gray-100 dark:text-gray-900">
              {loading
                ? 'Loading...'
                : formData.regionCode
                  ? `${names.regionName} (${formData.regionCode})`
                  : 'Not assigned'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Province:</span>
            <span className="text-gray-900 dark:text-gray-100 dark:text-gray-900">
              {loading
                ? 'Loading...'
                : formData.provinceCode
                  ? `${names.provinceName} (${formData.provinceCode})`
                  : 'Not assigned'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">City/Municipality:</span>
            <span className="text-gray-900 dark:text-gray-100 dark:text-gray-900">
              {loading
                ? 'Loading...'
                : formData.cityMunicipalityCode
                  ? `${names.cityName} (${formData.cityMunicipalityCode})`
                  : 'Not assigned'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Barangay:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-900">
              {loading
                ? 'Loading...'
                : formData.barangayCode
                  ? `${names.barangayName} (${formData.barangayCode})`
                  : 'Not assigned'}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            ✓ Geographic location automatically assigned from your barangay admin profile
          </p>
        </div>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-red-800">
            Please fix the following errors:
          </h4>
          <ul className="space-y-1 text-sm text-red-700">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Information Note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Important Information</h4>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>• Location automatically populated from your barangay admin profile</li>
          <li>• Geographic location is required for proper data organization</li>
          <li>• Only the location codes are stored in the system, not the names</li>
          <li>• This information helps with statistical reporting and administration</li>
          <li>• You can search by typing the location name to change selection</li>
        </ul>
      </div>
    </div>
  );
}
