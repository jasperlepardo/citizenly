'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { BaseSelector, BaseSelectorOption } from '@/components/base/BaseSelector';

interface BarangayOption extends BaseSelectorOption {
  value: string;
  label: string;
  metadata: {
    code: string;
    name: string;
    hasAdmin: boolean;
    adminCheckStatus: 'checking' | 'completed' | 'error';
  };
}

interface SimpleBarangaySelectorProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function SimpleBarangaySelector({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Search for your barangay...',
}: SimpleBarangaySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if barangays already have administrators
  const checkAdminStatus = async (barangays: any[]) => {
    try {
      console.log('🔍 Checking admin status for', barangays.length, 'barangays');

      const promises = barangays.map(async barangay => {
        try {
          const response = await fetch('/api/auth/check-barangay-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ barangayCode: barangay.code }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          return {
            code: barangay.code,
            hasAdmin: data.hasAdmin || false,
            adminCheckStatus: 'completed' as const,
          };
        } catch (error) {
          console.error('Admin check failed for', barangay.code, error);
          return {
            code: barangay.code,
            hasAdmin: false, // Default to allowing signup if check fails
            adminCheckStatus: 'error' as const,
          };
        }
      });

      const results = await Promise.all(promises);
      console.log('✅ Admin check results:', results);

      // Update search results with admin status
      setSearchResults(prevResults =>
        prevResults.map(barangay => {
          const result = results.find(r => r.code === barangay.code);
          if (result) {
            return {
              ...barangay,
              hasAdmin: result.hasAdmin,
              adminCheckStatus: result.adminCheckStatus,
            };
          }
          return barangay;
        })
      );
    } catch (error) {
      console.error('Error checking admin status:', error);
      // Mark all as error status if batch check fails
      setSearchResults(prevResults =>
        prevResults.map(barangay => ({
          ...barangay,
          adminCheckStatus: 'error' as const,
        }))
      );
    }
  };

  // Fetch barangay data (works with or without authentication)
  const searchBarangays = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);

      // Try to get session, but don't require it
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        // Authenticated search - use API
        const response = await fetch(
          `/api/addresses/barangays?search=${encodeURIComponent(searchTerm)}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(data.barangays || []);
      } else {
        // Public search - direct Supabase query
        console.log('🔍 Public barangay search for:', searchTerm);

        const { data, error } = await supabase
          .from('psgc_barangays')
          .select('code, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(20)
          .order('name');

        if (error) {
          console.error('Public search error:', error);
          throw error;
        }

        console.log('✅ Found barangays:', data?.length);

        // Transform to match expected format and check admin status
        const transformedData =
          data?.map((item: any) => ({
            code: item.code,
            name: item.name,
            full_address: item.name, // Simple version just shows name
            hasAdmin: false,
            adminCheckStatus: 'checking' as const,
          })) || [];

        setSearchResults(transformedData);

        // Check admin status for each barangay
        await checkAdminStatus(transformedData);
      }
    } catch (error) {
      console.error('Error searching barangays:', error);
      setIsError(true);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform search results to match BaseSelector format
  const options: BarangayOption[] = (searchResults || []).map(barangay => ({
    value: barangay.code,
    label: barangay.name,
    disabled: barangay.hasAdmin && barangay.adminCheckStatus === 'completed',
    metadata: {
      code: barangay.code,
      name: barangay.name,
      hasAdmin: barangay.hasAdmin || false,
      adminCheckStatus: barangay.adminCheckStatus || 'checking',
    },
  }));

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      onChange('');
    }

    // Debounce the search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchBarangays(term);
    }, 300);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleChange = (code: string) => {
    // Find the selected barangay to check admin status
    const selectedBarangay = searchResults.find(b => b.code === code);

    if (selectedBarangay?.hasAdmin && selectedBarangay?.adminCheckStatus === 'completed') {
      // Don't allow selection of barangays with existing admins
      console.log('❌ Cannot select barangay with existing admin:', code);
      return;
    }

    onChange(code);
    setIsOpen(false);
  };

  const renderOption = (option: BarangayOption) => {
    const { hasAdmin, adminCheckStatus } = option.metadata;

    return (
      <>
        <div className="flex items-center justify-between">
          <div className="font-medium">{option.metadata.name}</div>
          {adminCheckStatus === 'checking' && (
            <div className="flex items-center text-xs text-blue-500">
              <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-blue-500 border-t-transparent"></div>
              Checking...
            </div>
          )}
          {adminCheckStatus === 'completed' && hasAdmin && (
            <div className="flex items-center rounded bg-red-50 px-2 py-1 text-xs text-red-500">
              <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Admin exists
            </div>
          )}
          {adminCheckStatus === 'completed' && !hasAdmin && (
            <div className="flex items-center rounded bg-green-50 px-2 py-1 text-xs text-green-500">
              <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Available
            </div>
          )}
          {adminCheckStatus === 'error' && (
            <div className="flex items-center rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-500">
              <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Check failed
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">Code: {option.metadata.code}</div>
        {hasAdmin && adminCheckStatus === 'completed' && (
          <div className="mt-1 text-xs text-red-600">
            This barangay already has an administrator. Contact them to be added to the system.
          </div>
        )}
      </>
    );
  };

  const emptyMessage = isError
    ? 'Unable to load barangays. Please check your connection.'
    : `No barangays found matching "${searchTerm}"`;

  return (
    <BaseSelector
      value={value}
      onChange={handleChange}
      options={options}
      loading={isLoading}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      renderOption={renderOption}
      emptyMessage={emptyMessage}
      minSearchLength={2}
    />
  );
}
