'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { BaseSelector, BaseSelectorOption } from '@/components/base/BaseSelector';

interface BarangayOption extends BaseSelectorOption {
  value: string;
  label: string;
  metadata: {
    code: string;
    name: string;
    city_name: string;
    province_name: string;
    region_name: string;
    full_address: string;
  };
}

interface BarangaySelectorProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function BarangaySelector({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Search for your barangay...',
}: BarangaySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch barangay data from API (works with or without authentication)
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
        // Authenticated search - use API with jurisdiction filtering
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
        // Public search - simplified direct query for reliability
        console.log('🔍 Public barangay search for:', searchTerm);
        
        const { data, error } = await supabase
          .from('psgc_barangays')
          .select('code, name, city_municipality_code')
          .ilike('name', `%${searchTerm}%`)
          .limit(20)
          .order('name');

        if (error) {
          console.error('Public search error:', error);
          throw error;
        }

        console.log('✅ Found barangays:', data?.length);

        // Transform to match expected format (simplified)
        const transformedData = data?.map((item: any) => ({
          code: item.code,
          name: item.name,
          city_name: 'Loading...', // Will be populated by separate queries if needed
          province_name: 'Loading...',
          region_name: 'Loading...',
          full_address: `${item.name} (Code: ${item.code})`,
        })) || [];

        setSearchResults(transformedData);
      }
    } catch (error) {
      console.error('Error searching barangays:', error);
      setIsError(true);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected barangay details
  useEffect(() => {
    if (value && searchResults.length > 0) {
      const barangay = searchResults.find(b => b.code === value);
      setSelectedBarangay(barangay);
    } else if (!value) {
      setSelectedBarangay(null);
    }
  }, [value, searchResults]);

  // Transform search results to match BaseSelector format
  const options: BarangayOption[] = (searchResults || []).map(barangay => ({
    value: barangay.code,
    label: barangay.name,
    metadata: {
      code: barangay.code,
      name: barangay.name,
      city_name: barangay.city_name || 'Unknown City',
      province_name: barangay.province_name || 'Unknown Province',
      region_name: barangay.region_name || 'Unknown Region',
      full_address: `${barangay.name}, ${barangay.city_name || 'Unknown City'}, ${barangay.province_name || 'Unknown Province'}, ${barangay.region_name || 'Unknown Region'}`,
    },
  }));

  // Set search term to selected barangay name when value changes
  React.useEffect(() => {
    if (selectedBarangay && searchTerm !== selectedBarangay.name) {
      setSearchTerm(selectedBarangay.name);
    }
  }, [selectedBarangay, searchTerm]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);

    // Clear selection if user is typing and it doesn't match selected
    if (selectedBarangay && term !== selectedBarangay.name) {
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
    onChange(code);
    setIsOpen(false);
  };

  const renderOption = (option: BarangayOption, search: string) => {
    const highlightMatch = (text: string) => {
      if (!search.trim()) return text;
      const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={`${part}-${index}`} className="bg-yellow-200 font-medium text-primary">
            {part}
          </mark>
        ) : (
          part
        )
      );
    };

    return (
      <div className="flex flex-col">
        <div className="font-medium text-primary">{highlightMatch(option.metadata.name)}</div>
        <div className="text-sm text-secondary">
          {highlightMatch(`${option.metadata.city_name}, ${option.metadata.province_name}`)}
        </div>
        <div className="text-muted text-xs">{option.metadata.region_name}</div>
      </div>
    );
  };

  const emptyMessage = isError ? (
    <>
      <svg
        className="text-muted mx-auto mb-2 size-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm text-red-600">Unable to load barangays</p>
      <p className="mt-1 text-xs text-red-500">Please check your connection and try again</p>
    </>
  ) : (
    <>
      <svg
        className="text-muted mx-auto mb-2 size-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p className="text-sm">No barangays found for &quot;{searchTerm}&quot;</p>
      <p className="mt-1 text-xs">Try searching with a different term or check your spelling</p>
    </>
  );

  const searchInstructions = (
    <>
      <svg
        className="text-muted mx-auto mb-2 size-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p className="text-sm">Start typing to search barangays</p>
      <p className="mt-1 text-xs">
        Type at least 2 characters (e.g., &quot;San&quot;, &quot;Manila&quot;, &quot;Cebu&quot;)
      </p>
    </>
  );

  return (
    <div>
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
        searchInstructions={searchInstructions}
        minSearchLength={2}
      />
      {!error && (
        <p className="text-muted mt-1 text-xs">
          Start typing to search by barangay name, city, or province (e.g., &quot;Poblacion&quot;,
          &quot;Manila&quot;, &quot;Cebu City&quot;)
        </p>
      )}
    </div>
  );
}
