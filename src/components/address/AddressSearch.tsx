'use client'

/**
 * Address Search Component
 * Provides full-text search across 38,372 barangays with autocomplete
 */

import React, { useState, useEffect, useRef } from 'react'
import { searchAddresses, type AddressHierarchy } from '@/lib/database'

interface AddressSearchProps {
  onSelect: (address: AddressHierarchy) => void
  placeholder?: string
  className?: string
  maxResults?: number
}

export default function AddressSearch({
  onSelect,
  placeholder = "Search for region, province, city, or barangay...",
  className = "",
  maxResults = 20
}: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AddressHierarchy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      try {
        setIsLoading(true)
        const searchResults = await searchAddresses(query.trim(), maxResults)
        setResults(searchResults)
        setIsOpen(searchResults.length > 0)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, maxResults])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (address: AddressHierarchy) => {
    onSelect(address)
    setQuery(address.full_address)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
      ) : part
    )
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        
        {/* Loading indicator only */}
        {isLoading && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {results.map((address, index) => (
            <button
              key={`${address.barangay_code}-${index}`}
              onClick={() => handleSelect(address)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="space-y-1">
                {/* Full Address */}
                <div className="text-sm font-medium text-gray-900">
                  {highlightMatch(address.full_address, query)}
                </div>
                
                {/* Geographic Details */}
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>
                    <span className="text-xs">📍</span> {highlightMatch(address.barangay_name, query)}, {address.city_municipality_name}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span><span className="text-xs">🏛️</span> {address.city_municipality_type}</span>
                    {address.is_independent && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Independent</span>
                    )}
                    {address.urban_rural_status && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        {address.urban_rural_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
          
          {/* Search Stats */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
            Found {results.length} result{results.length !== 1 ? 's' : ''} 
            {results.length === maxResults && ` (showing first ${maxResults})`}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500 text-sm">
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg className="h-5 w-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>No addresses found for "{query}"</div>
            <div className="text-xs">
              Try searching for region, province, city, or barangay names
            </div>
          </div>
        </div>
      )}

      {/* Search Help */}
      {!query && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="text-xs">💡</span> Search across 38,372 barangays in 1,637 cities nationwide
        </div>
      )}
    </div>
  )
}