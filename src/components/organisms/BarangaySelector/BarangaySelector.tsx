'use client';

import React, { useState } from 'react';
import { BaseSelector, BaseSelectorOption } from '@/components/base/BaseSelector';
import { useBarangaySearch, useBarangay } from '@/hooks/api/useBarangay';

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

  // Use React Query hook for search
  const { data: searchResults = [], isLoading } = useBarangaySearch(
    searchTerm,
    searchTerm.length >= 2
  );

  // Get selected barangay details for display
  const { data: selectedBarangay } = useBarangay(value, !!value);

  // Transform search results to match BaseSelector format
  const options: BarangayOption[] = (searchResults || []).map(barangay => ({
    value: barangay.code,
    label: barangay.name,
    metadata: {
      code: barangay.code,
      name: barangay.name,
      city_name: 'Unknown City',
      province_name: 'Unknown Province', 
      region_name: 'Unknown Region',
      full_address: `${barangay.name}, Unknown City, Unknown Province, Unknown Region`,
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
        <div className="font-medium text-primary">
          {highlightMatch(option.metadata.name)}
        </div>
        <div className="text-sm text-secondary">
          {highlightMatch(`${option.metadata.city_name}, ${option.metadata.province_name}`)}
        </div>
        <div className="text-xs text-muted">{option.metadata.region_name}</div>
      </div>
    );
  };

  const emptyMessage = (
    <>
      <svg
        className="mx-auto mb-2 size-8 text-muted"
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
      <p className="mt-1 text-xs">
        Try searching with a different term or check your spelling
      </p>
    </>
  );

  const searchInstructions = (
    <>
      <svg
        className="mx-auto mb-2 size-8 text-muted"
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
        <p className="mt-1 text-xs text-muted">
          Start typing to search by barangay name, city, or province (e.g., &quot;Poblacion&quot;,
          &quot;Manila&quot;, &quot;Cebu City&quot;)
        </p>
      )}
    </div>
  );
}