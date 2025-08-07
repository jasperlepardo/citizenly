'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { logger, logError } from '@/lib/secure-logger';

interface BarangayOption {
  code: string;
  name: string;
  city_name: string;
  province_name: string;
  region_name: string;
  full_address: string;
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
  const [options, setOptions] = useState<BarangayOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<BarangayOption | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Don't load initial barangays - only load when user searches
  // This prevents overwhelming the UI with thousands of barangays

  // Handle search debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm.length >= 2) {
        loadBarangays(searchTerm);
      } else if (searchTerm === '') {
        setOptions([]); // Clear options when search is cleared
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Load selected option when value changes
  useEffect(() => {
    if (value && !selectedOption) {
      loadSelectedBarangay(value);
    }
  }, [value, selectedOption]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadBarangays = async (search: string) => {
    try {
      setLoading(true);

      if (!search.trim()) {
        setOptions([]);
        return;
      }

      // Simplified query to prevent infinite loop
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select(
          `
          code,
          name
        `
        )
        .ilike('name', `%${search}%`)
        .limit(20)
        .order('name', { ascending: true });

      if (error) {
        logger.error('Barangay search error', { error });
        setOptions([]);
        return;
      }

      let formattedOptions: BarangayOption[] = [];

      if (data && data.length > 0) {
        formattedOptions = data.map(item => ({
          code: item.code,
          name: item.name,
          city_name: 'Unknown City',
          province_name: 'Unknown Province',
          region_name: 'Unknown Region',
          full_address: `${item.name}, Unknown City, Unknown Province, Unknown Region`,
        }));
      }

      // Simplified - no additional city search to prevent complexity issues

      setOptions(formattedOptions);
    } catch (error) {
      logError(error as Error, 'BARANGAY_LOAD_ERROR');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedBarangay = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select(
          `
          code,
          name
        `
        )
        .eq('code', code)
        .single();

      if (error || !data) {
        logger.error('Error loading selected barangay', { error, code });
        return;
      }

      const option: BarangayOption = {
        code: data.code,
        name: data.name,
        city_name: 'Unknown City',
        province_name: 'Unknown Province',
        region_name: 'Unknown Region',
        full_address: `${data.name}, Unknown City, Unknown Province, Unknown Region`,
      };

      setSelectedOption(option);
      setSearchTerm(option.full_address);
    } catch (error) {
      logError(error as Error, 'SELECTED_BARANGAY_LOAD_ERROR');
    }
  };

  const handleSelect = (option: BarangayOption) => {
    setSelectedOption(option);
    setSearchTerm(option.full_address);
    setIsOpen(false);
    onChange(option.code);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    // Clear selection if user is typing
    if (selectedOption && newValue !== selectedOption.full_address) {
      setSelectedOption(null);
      onChange('');
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-medium text-primary">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-md border p-3 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="size-5 animate-spin text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {!loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="size-5 text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && options.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-lg bg-surface border-default">
          {options.map(option => (
            <button
              key={option.code}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <div className="flex flex-col">
                <div className="font-medium text-primary">
                  {highlightMatch(option.name, searchTerm)}
                </div>
                <div className="text-sm text-secondary">
                  {highlightMatch(`${option.city_name}, ${option.province_name}`, searchTerm)}
                </div>
                <div className="text-xs text-muted">{option.region_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && !loading && options.length === 0 && searchTerm.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border p-4 shadow-lg bg-surface border-default">
          <div className="text-center text-muted">
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
          </div>
        </div>
      )}

      {/* Search instruction when focused but no search term */}
      {isOpen && !loading && searchTerm.length < 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border p-4 shadow-lg bg-surface border-default">
          <div className="text-center text-muted">
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
              Type at least 2 characters (e.g., &quot;San&quot;, &quot;Manila&quot;,
              &quot;Cebu&quot;)
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Helper text */}
      {!error && (
        <p className="mt-1 text-xs text-muted">
          Start typing to search by barangay name, city, or province (e.g., &quot;Poblacion&quot;,
          &quot;Manila&quot;, &quot;Cebu City&quot;)
        </p>
      )}
    </div>
  );
}
