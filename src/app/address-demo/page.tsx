'use client'

/**
 * Address Components Demo Page
 * Test and showcase the cascading address dropdowns and search functionality
 */

import React, { useState } from 'react'
import AddressSelector, { type AddressSelection } from '@/components/address/AddressSelector'
import AddressSearch from '@/components/address/AddressSearch'
import { type AddressHierarchy } from '@/lib/database'

export default function AddressDemoPage() {
  // Address selector state
  const [selectedAddress, setSelectedAddress] = useState<AddressSelection>({
    region: '',
    province: '',
    city: '',
    barangay: ''
  })

  // Search result state
  const [searchResult, setSearchResult] = useState<AddressHierarchy | null>(null)

  const handleSearchSelect = (address: AddressHierarchy) => {
    setSearchResult(address)
    // Optionally sync with selector
    setSelectedAddress({
      region: address.region_code,
      province: address.province_code || '',
      city: address.city_municipality_code,
      barangay: address.barangay_code
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-2xl">📍</span> Address Components Demo
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Test cascading dropdowns and search across 38,372 barangays
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Cascading Address Selector */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="text-lg">🔽</span> Cascading Address Selector
            </h2>
            <p className="text-gray-600 mb-6">
              Select address components in hierarchy: Region → Province → City → Barangay
            </p>
            
            <AddressSelector
              value={selectedAddress}
              onChange={setSelectedAddress}
              required={true}
              showLabels={true}
            />

            {/* Selection Summary */}
            {(selectedAddress.region || selectedAddress.province || selectedAddress.city || selectedAddress.barangay) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Current Selection:</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <div>Region: {selectedAddress.region || 'Not selected'}</div>
                  <div>Province: {selectedAddress.province || 'Not selected'}</div>
                  <div>City: {selectedAddress.city || 'Not selected'}</div>
                  <div>Barangay: {selectedAddress.barangay || 'Not selected'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Address Search */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <span className="text-lg">🔍</span> Address Search
            </h2>
            <p className="text-gray-600 mb-6">
              Search and autocomplete across all geographic levels
            </p>
            
            <AddressSearch
              onSelect={handleSearchSelect}
              maxResults={15}
              className="mb-4"
            />

            {/* Search Result */}
            {searchResult && (
              <div className="mt-6 p-4 bg-green-50 rounded-md">
                <h3 className="text-sm font-medium text-green-900 mb-2">Search Result:</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="font-medium">{searchResult.full_address}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Region: {searchResult.region_name}</div>
                    <div>Province: {searchResult.province_name || 'N/A'}</div>
                    <div>City: {searchResult.city_municipality_name}</div>
                    <div>Barangay: {searchResult.barangay_name}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {searchResult.city_municipality_type}
                    </span>
                    {searchResult.is_independent && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        Independent
                      </span>
                    )}
                    {searchResult.urban_rural_status && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {searchResult.urban_rural_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Demo */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <span className="text-lg">📱</span> Compact Address Selector
          </h2>
          <p className="text-gray-600 mb-6">
            Space-efficient layout for forms and mobile interfaces
          </p>
          
          <AddressSelector
            value={selectedAddress}
            onChange={setSelectedAddress}
            compact={true}
            showLabels={true}
            className="max-w-4xl"
          />
        </div>

        {/* JSON Output for Development */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            <span className="text-lg">🛠️</span> Development Output
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Selected Address (JSON):</h3>
              <pre className="text-sm text-green-400 bg-gray-800 p-3 rounded overflow-x-auto">
                {JSON.stringify(selectedAddress, null, 2)}
              </pre>
            </div>
            
            {searchResult && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Search Result (JSON):</h3>
                <pre className="text-sm text-blue-400 bg-gray-800 p-3 rounded overflow-x-auto">
                  {JSON.stringify(searchResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Coverage Stats */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">
            <span className="text-lg">🗺️</span> Database Coverage
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">17</div>
              <div className="text-sm opacity-90">Regions</div>
            </div>
            <div>
              <div className="text-2xl font-bold">86</div>
              <div className="text-sm opacity-90">Provinces</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1,637</div>
              <div className="text-sm opacity-90">Cities</div>
            </div>
            <div>
              <div className="text-2xl font-bold">38,372</div>
              <div className="text-sm opacity-90">Barangays</div>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="text-lg font-semibold">91% Nationwide Coverage</div>
          </div>
        </div>
      </div>
    </div>
  )
}