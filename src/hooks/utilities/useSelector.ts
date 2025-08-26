'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { logger } from '@/lib';

export interface UseSelectorOptions<T> {
  value: string;
  onChange: (value: string) => void;
  searchFn: (term: string) => Promise<T[]>;
  loadSelectedFn?: (value: string) => Promise<T | null>;
  debounceMs?: number;
  minSearchLength?: number;
  formatDisplayValue?: (item: T) => string;
}

export function useSelector<T extends { value: string; label: string }>({
  value,
  onChange,
  searchFn,
  loadSelectedFn,
  debounceMs = 300,
  minSearchLength = 2,
  formatDisplayValue,
}: UseSelectorOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const loadOptions = useCallback(
    async (search: string) => {
      if (search.length < minSearchLength) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        const results = await searchFn(search);
        setOptions(results);
      } catch (error) {
        logger.error('Selector search error', { error });
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [searchFn, minSearchLength]
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadOptions(searchTerm);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, loadOptions, debounceMs]);

  useEffect(() => {
    if (value && !selectedOption && loadSelectedFn) {
      loadSelectedFn(value).then(option => {
        if (option) {
          setSelectedOption(option);
          setSearchTerm(formatDisplayValue ? formatDisplayValue(option) : option.label);
        }
      });
    }
  }, [value, selectedOption, loadSelectedFn, formatDisplayValue]);

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);

      if (
        selectedOption &&
        term !== (formatDisplayValue ? formatDisplayValue(selectedOption) : selectedOption.label)
      ) {
        setSelectedOption(null);
        onChange('');
      }
    },
    [selectedOption, onChange, formatDisplayValue]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return {
    searchTerm,
    options,
    loading,
    isOpen,
    selectedOption,
    onSearchChange: handleSearchChange,
    onOpenChange: handleOpenChange,
    setSearchTerm,
    setOptions,
    setSelectedOption,
  };
}
