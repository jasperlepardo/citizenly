'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger, logError } from '@/lib/secure-logger';

interface PSOCOption {
  occupation_code: string;
  level_type: string;
  occupation_title: string;
  occupation_description: string | null;
  full_hierarchy: string;
  hierarchy_level: number;
}

interface PSOCSelectorProps {
  value?: string;
  onSelect: (option: PSOCOption | null) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function PSOCSelector({
  value,
  onSelect,
  placeholder = 'Search for occupation...',
  className = '',
  error,
}: PSOCSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<PSOCOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<PSOCOption | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate unique ID for ARIA attributes
  const listboxId = `psoc-listbox-${Math.random().toString(36).substr(2, 9)}`;

  // Search PSOC occupations
  const searchOccupations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      logger.debug('Searching PSOC for', { query });

      // Try the view first
      const { data, error } = await supabase
        .from('psoc_occupation_search')
        .select('*')
        .or(`occupation_title.ilike.%${query}%, full_hierarchy.ilike.%${query}%`)
        .order('hierarchy_level', { ascending: true })
        .order('occupation_title', { ascending: true })
        .limit(50);

      logger.debug('PSOC view search result', { hasData: !!data, error, dataLength: data?.length });

      // If view works and has data, use it
      if (!error && data && data.length > 0) {
        setOptions(data);
        return;
      }

      // If view doesn't exist or has no data, try direct table queries
      if (error || !data || data.length === 0) {
        logger.debug('Trying direct PSOC table queries');

        // Try major groups first
        const { data: majorGroups } = await supabase
          .from('psoc_major_groups')
          .select('code, title')
          .ilike('title', `%${query}%`)
          .limit(10);

        if (majorGroups && majorGroups.length > 0) {
          const formattedData = majorGroups.map(group => ({
            occupation_code: group.code,
            level_type: 'major_group',
            occupation_title: group.title,
            occupation_description: null,
            full_hierarchy: group.title,
            hierarchy_level: 4,
          }));
          setOptions(formattedData);
          return;
        }

        // Try unit groups
        const { data: unitGroups } = await supabase
          .from('psoc_unit_groups')
          .select('code, title')
          .ilike('title', `%${query}%`)
          .limit(20);

        if (unitGroups && unitGroups.length > 0) {
          const formattedData = unitGroups.map(group => ({
            occupation_code: group.code,
            level_type: 'unit_group',
            occupation_title: group.title,
            occupation_description: null,
            full_hierarchy: group.title,
            hierarchy_level: 1,
          }));
          setOptions(formattedData);
          return;
        }

        // Try unit sub-groups (most specific occupations like "Radiology technician")
        const { data: unitSubGroups } = await supabase
          .from('psoc_unit_sub_groups')
          .select('code, title')
          .ilike('title', `%${query}%`)
          .limit(30);

        if (unitSubGroups && unitSubGroups.length > 0) {
          const formattedData = unitSubGroups.map(group => ({
            occupation_code: group.code,
            level_type: 'unit_sub_group',
            occupation_title: group.title,
            occupation_description: null,
            full_hierarchy: group.title,
            hierarchy_level: 0,
          }));
          setOptions(formattedData);
          return;
        }

        logger.warn('No PSOC data found in any table');
        setOptions([]);
      }
    } catch (error) {
      logError(error as Error, 'PSOC_SEARCH_ERROR');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      searchOccupations(searchQuery);
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchOccupations]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);

    if (!query.trim()) {
      setSelectedOption(null);
      onSelect(null);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: PSOCOption) => {
    setSelectedOption(option);
    setSearchQuery(option.occupation_title);
    setIsOpen(false);
    onSelect(option);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load initial value if provided
  useEffect(() => {
    if (value && !selectedOption) {
      // Load the selected PSOC option by code
      const loadSelectedOption = async () => {
        try {
          const { data, error } = await supabase
            .from('psoc_occupation_search')
            .select('*')
            .eq('occupation_code', value)
            .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

          if (data && !error) {
            setSelectedOption(data);
            setSearchQuery(data.occupation_title);
          } else if (error) {
            logger.debug('Could not load PSOC option by code', { value, error: error.message });
          }
        } catch (error) {
          logError(error as Error, 'PSOC_OPTION_LOAD_ERROR');
        }
      };
      loadSelectedOption();
    }
  }, [value, selectedOption]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Container - Figma: exact 8px padding, structured like InputField */}
      <div
        className={`relative flex w-full items-center transition-colors font-system focus-within:outline-none ${
          error
            ? 'rounded border border-red-600 bg-surface focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]'
            : 'rounded border bg-surface border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]'
        } min-h-10 p-2 text-base ${className}`}
      >
        {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
        <div className="flex min-h-0 min-w-0 grow basis-0 flex-col items-center justify-center gap-0.5 px-1 py-0">
          {/* Input wrapped in flex container - Figma: flex flex-col justify-center */}
          <div className="font-montserrat flex w-full flex-col justify-center overflow-hidden text-ellipsis text-nowrap font-normal leading-5">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              className="font-montserrat w-full border-0 bg-transparent text-base font-normal leading-5 shadow-none outline-0 ring-0 text-primary placeholder:text-muted focus:border-0 focus:shadow-none focus:outline-0 focus:ring-0 active:border-0 active:shadow-none active:outline-0 active:ring-0"
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                appearance: 'none',
              }}
              placeholder={placeholder}
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls={listboxId}
              aria-invalid={error ? 'true' : 'false'}
            />
          </div>
        </div>

        {/* Loading indicator - Figma: w-5 (20px width) */}
        {loading && (
          <div className="flex size-5 shrink-0 items-center justify-center text-secondary">
            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="ring-border-default absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg shadow-lg ring-1 bg-surface"
        >
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm/6 text-muted">
              <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Searching occupations...
            </div>
          ) : options.length > 0 ? (
            <ul className="py-1">
              {options.map(option => (
                <li key={option.occupation_code}>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    role="option"
                    aria-selected={selectedOption?.occupation_code === option.occupation_code}
                    className="w-full px-3 py-2 text-left text-sm/6 text-primary hover:bg-surface-hover focus:outline-none focus:bg-surface-hover"
                  >
                    <div className="font-medium">{option.occupation_title}</div>
                    <div className="text-xs text-muted">
                      {option.full_hierarchy} • {option.occupation_code} •{' '}
                      {option.level_type.replace('_', ' ')}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.trim() ? (
            <div className="px-3 py-2 text-sm/6 text-muted">
              <div>No occupations found for &quot;{searchQuery}&quot;</div>
              <div className="mt-1 text-xs text-muted">
                Note: PSOC data may not be loaded in the database yet.
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 text-sm/6 text-muted">
              Start typing to search occupations...
            </div>
          )}
        </div>
      )}

      {/* Error message styled like InputField */}
      {error && (
        <div className="mt-2">
          <p className="text-xs leading-[14px] text-red-500 font-system" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
