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

  // Fetch barangay data from API
  const searchBarangays = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

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
    metadata: {
      code: barangay.code,
      name: barangay.name,
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
    onChange(code);
    setIsOpen(false);
  };

  const renderOption = (option: BarangayOption) => (
    <>
      <div className="font-medium">{option.metadata.name}</div>
      <div className="text-sm text-gray-500">Code: {option.metadata.code}</div>
    </>
  );

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
