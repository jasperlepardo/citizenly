'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface BarangayOption {
  code: string
  name: string
}

interface SimpleBarangaySelectorProps {
  value: string
  onChange: (code: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export default function SimpleBarangaySelector({ 
  value: _value, 
  onChange, 
  error, 
  disabled = false,
  placeholder = "Search for your barangay..."
}: SimpleBarangaySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [options, setOptions] = useState<BarangayOption[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle search with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm.length >= 2) {
        loadBarangays(searchTerm)
      } else {
        setOptions([])
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm])

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadBarangays = async (search: string) => {
    try {
      console.log('Loading barangays for search:', search)
      setLoading(true)
      
      // First, test if we can access the table at all
      const { count, error: countError } = await supabase
        .from('psgc_barangays')
        .select('*', { count: 'exact', head: true })
      
      console.log('Table access test:', { count, countError })
      
      if (countError) {
        console.error('Cannot access psgc_barangays table:', countError)
        console.error('PSGC data must be loaded in the database for barangay selection to work')
        setOptions([])
        return
      }
      
      if (count === 0) {
        console.warn('psgc_barangays table is empty')
        setOptions([])
        return
      }
      
      // If table is accessible and has data, proceed with search
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select('code, name')
        .ilike('name', `%${search}%`)
        .limit(10)
        .order('name', { ascending: true })

      console.log('Barangay search result:', { data, error, count: data?.length })

      if (error) {
        console.error('Barangay search error:', error)
        setOptions([])
        return
      }

      setOptions(data || [])
      console.log('Set options:', data?.length || 0, 'items')
    } catch (error) {
      console.error('Error loading barangays:', error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (option: BarangayOption) => {
    setSearchTerm(option.name)
    setIsOpen(false)
    onChange(option.code)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsOpen(true)
    
    // If user clears the input, clear the selection
    if (!newValue) {
      onChange('')
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && searchTerm.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.code}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                onClick={() => handleSelect(option)}
              >
                <div className="font-medium">{option.name}</div>
                <div className="text-sm text-gray-500">Code: {option.code}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              No barangays found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}