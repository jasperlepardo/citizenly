'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { logger, logError } from '@/lib/secure-logger';

interface BarangayOption {
  code: string;
  name: string;
}

interface SimpleBarangaySelectorProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function SimpleBarangaySelector({
  value: _value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Search for your barangay...',
}: SimpleBarangaySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<BarangayOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle search with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm.length >= 2) {
        loadBarangays(searchTerm);
      } else {
        setOptions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

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
      logger.debug('Loading barangays for search', { search });
      setLoading(true);

      // First, test if we can access the table at all
      const { count, error: countError } = await supabase
        .from('psgc_barangays')
        .select('*', { count: 'exact', head: true });

      logger.debug('Table access test', { count, error: countError });

      if (countError) {
        logger.error('Cannot access psgc_barangays table', { error: countError });
        logger.warn('PSGC data must be loaded in the database for barangay selection to work');
        setOptions([]);
        return;
      }

      if (count === 0) {
        logger.warn('psgc_barangays table is empty');
        setOptions([]);
        return;
      }

      // If table is accessible and has data, proceed with search
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select('code, name')
        .ilike('name', `%${search}%`)
        .limit(10)
        .order('name', { ascending: true });

      logger.debug('Barangay search result', { hasData: !!data, error, count: data?.length });

      if (error) {
        logger.error('Barangay search error', { error });
        setOptions([]);
        return;
      }

      setOptions(data || []);
      logger.debug('Set options', { itemCount: data?.length || 0 });
    } catch (error) {
      logError(error as Error, 'BARANGAY_LOAD_ERROR');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: BarangayOption) => {
    setSearchTerm(option.name);
    setIsOpen(false);
    onChange(option.code);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    // If user clears the input, clear the selection
    if (!newValue) {
      onChange('');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="size-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && searchTerm.length >= 2 && !loading && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {options.length > 0 ? (
            options.map(option => (
              <button
                key={option.code}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                onClick={() => handleSelect(option)}
              >
                <div className="font-medium">{option.name}</div>
                <div className="text-sm text-gray-500">Code: {option.code}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              No barangays found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
