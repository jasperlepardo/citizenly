'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface PSOCOption {
  occupation_code: string
  level_type: string
  occupation_title: string
  occupation_description: string | null
  full_hierarchy: string
  hierarchy_level: number
}

interface PSOCSelectorProps {
  value?: string
  onSelect: (option: PSOCOption | null) => void
  placeholder?: string
  className?: string
  error?: string
}

export default function PSOCSelector({ 
  value, 
  onSelect, 
  placeholder = "Search for occupation...",
  className = "",
  error 
}: PSOCSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [options, setOptions] = useState<PSOCOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<PSOCOption | null>(null)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Search PSOC occupations
  const searchOccupations = async (query: string) => {
    if (!query.trim()) {
      setOptions([])
      return
    }

    setLoading(true)
    try {
      console.log('Searching PSOC for:', query)
      
      // Try the view first
      let { data, error } = await supabase
        .from('psoc_occupation_search')
        .select('*')
        .or(`occupation_title.ilike.%${query}%, full_hierarchy.ilike.%${query}%`)
        .order('hierarchy_level', { ascending: true })
        .order('occupation_title', { ascending: true })
        .limit(50)

      console.log('PSOC view search result:', { data, error })

      // If view doesn't exist or has no data, try direct table queries
      if (error || !data || data.length === 0) {
        console.log('Trying direct PSOC table queries...')
        
        // Try major groups first
        const { data: majorGroups, error: majorError } = await supabase
          .from('psoc_major_groups')
          .select('code, title')
          .ilike('title', `%${query}%`)
          .limit(10)

        if (majorGroups && majorGroups.length > 0) {
          const formattedData = majorGroups.map(group => ({
            occupation_code: group.code,
            level_type: 'major_group',
            occupation_title: group.title,
            occupation_description: null,
            full_hierarchy: group.title,
            hierarchy_level: 4
          }))
          setOptions(formattedData)
          return
        }

        // Try unit groups
        const { data: unitGroups, error: unitError } = await supabase
          .from('psoc_unit_groups')
          .select('code, title')
          .ilike('title', `%${query}%`)
          .limit(20)

        if (unitGroups && unitGroups.length > 0) {
          const formattedData = unitGroups.map(group => ({
            occupation_code: group.code,
            level_type: 'unit_group',
            occupation_title: group.title,
            occupation_description: null,
            full_hierarchy: group.title,
            hierarchy_level: 1
          }))
          setOptions(formattedData)
          return
        }

        // Try unit sub-groups (most specific occupations like "Radiology technician")
        const { data: unitSubGroups, error: unitSubError } = await supabase
          .from('psoc_unit_sub_groups')
          .select('code, title')
          .ilike('title', `%${query}%`)
          .limit(30)

        if (unitSubGroups && unitSubGroups.length > 0) {
          const formattedData = unitSubGroups.map(group => ({
            occupation_code: group.code,
            level_type: 'unit_sub_group',
            occupation_title: group.title,
            occupation_description: null,
            full_hierarchy: group.title,
            hierarchy_level: 0
          }))
          setOptions(formattedData)
          return
        }

        console.log('No PSOC data found in any table')
        setOptions([])
      } else {
        setOptions(data || [])
      }
    } catch (error) {
      console.error('PSOC search error:', error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      searchOccupations(searchQuery)
    }, 300)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [searchQuery])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setIsOpen(true)
    
    if (!query.trim()) {
      setSelectedOption(null)
      onSelect(null)
    }
  }

  // Handle option selection
  const handleOptionSelect = (option: PSOCOption) => {
    setSelectedOption(option)
    setSearchQuery(option.occupation_title)
    setIsOpen(false)
    onSelect(option)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            .single()

          if (data && !error) {
            setSelectedOption(data)
            setSearchQuery(data.occupation_title)
          }
        } catch (error) {
          console.error('Error loading PSOC option:', error)
        }
      }
      loadSelectedOption()
    }
  }, [value, selectedOption])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset placeholder:text-zinc-500 focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-400 ${
            error 
              ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
              : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
          } ${className}`}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : 'false'}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 animate-spin text-zinc-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 max-h-60 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm/6 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching occupations...
            </div>
          ) : options.length > 0 ? (
            <ul className="py-1">
              {options.map((option) => (
                <li key={option.occupation_code}>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className="w-full px-3 py-2 text-left text-sm/6 text-zinc-950 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800 focus:bg-zinc-50 dark:focus:bg-zinc-800 focus:outline-none"
                  >
                    <div className="font-medium">{option.occupation_title}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {option.full_hierarchy} • {option.occupation_code} • {option.level_type.replace('_', ' ')}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.trim() ? (
            <div className="px-3 py-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
              <div>No occupations found for "{searchQuery}"</div>
              <div className="text-xs mt-1 text-zinc-400">
                Note: PSOC data may not be loaded in the database yet.
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
              Start typing to search occupations...
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm/6 text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}