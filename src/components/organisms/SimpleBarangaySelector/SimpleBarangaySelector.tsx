'use client';

import React, { useState } from 'react';
import { BaseSelector, BaseSelectorOption } from '@/components/base/BaseSelector';
import { useBarangaySearch } from '@/hooks/api/useBarangay';

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

  // Use React Query hook for search
  const { data: searchResults = [], isLoading, isError } = useBarangaySearch(
    searchTerm,
    searchTerm.length >= 2
  );

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