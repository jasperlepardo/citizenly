'use client'

/**
 * Addresses Page
 * Philippine address management with location services and mapping
 */

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/templates'
import { AddressSearch } from '@/components/address'
import { testDatabaseConnection, type AddressHierarchy } from '@/lib/database'


export default function AddressesPage() {
  const [addressResults, setAddressResults] = useState<AddressHierarchy[]>([])
  const [dbStats, setDbStats] = useState({
    regions: 0,
    provinces: 0,
    cities: 0,
    barangays: 0,
    connected: false
  })
  const [loading, setLoading] = useState(true)

  // Test database connection and get real stats
  useEffect(() => {
    async function loadDatabaseStats() {
      try {
        setLoading(true)
        const result = await testDatabaseConnection()
        if (result.success && result.data) {
          setDbStats({
            regions: result.data.regions,
            provinces: result.data.provinces,
            cities: result.data.cities,
            barangays: result.data.barangays,
            connected: true
          })
        } else {
          console.error('Database connection failed:', result.errors)
          // Fallback to estimated values if DB is not available
          setDbStats({
            regions: 17,
            provinces: 86,
            cities: 1637,
            barangays: 38372,
            connected: false
          })
        }
      } catch (error) {
        console.error('Error testing database:', error)
        setDbStats({
          regions: 17,
          provinces: 86,
          cities: 1637,
          barangays: 38372,
          connected: false
        })
      } finally {
        setLoading(false)
      }
    }

    loadDatabaseStats()
  }, [])

  // Calculate coverage percentage
  const calculateCoverage = (current: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((current / total) * 100)}%`
  }

  // Address hierarchy statistics (dynamic based on real data)
  const addressStats = [
    {
      name: 'Regions',
      value: loading ? '...' : dbStats.regions.toLocaleString(),
      description: 'Administrative regions',
      gradient: 'from-blue-500 to-indigo-600',
      coverage: dbStats.connected ? '100%' : 'Offline'
    },
    {
      name: 'Provinces',
      value: loading ? '...' : dbStats.provinces.toLocaleString(),
      description: 'Provinces and NCR',
      gradient: 'from-emerald-500 to-green-600',
      coverage: dbStats.connected ? '100%' : 'Offline'
    },
    {
      name: 'Cities/Municipalities',
      value: loading ? '...' : dbStats.cities.toLocaleString(),
      description: 'Cities and municipalities',
      gradient: 'from-purple-500 to-pink-600',
      coverage: dbStats.connected ? '100%' : 'Offline'
    },
    {
      name: 'Barangays',
      value: loading ? '...' : dbStats.barangays.toLocaleString(),
      description: 'Barangay coverage',
      gradient: 'from-orange-500 to-red-600',
      coverage: dbStats.connected ? calculateCoverage(dbStats.barangays, 42028) : 'Offline'
    }
  ]

  // Handle address selection
  const handleAddressSelect = (address: AddressHierarchy) => {
    console.log('Selected address:', address)
    // Add the selected address to results for display
    setAddressResults(prev => {
      // Check if already exists
      const exists = prev.some(addr => addr.barangay_code === address.barangay_code)
      if (exists) return prev
      return [address, ...prev.slice(0, 9)] // Keep only 10 results
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-montserrat font-semibold text-2xl text-primary">
            Address Management
          </h1>
          <p className="mt-1 text-secondary font-montserrat">
            Complete Philippine administrative address hierarchy and location services
          </p>
        </div>

        {/* Address Statistics Cards - Dashboard Style */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {addressStats.map((stat) => (
            <div key={stat.name} className="bg-surface rounded-lg border border-default p-6">
              <div className="font-montserrat font-medium text-sm text-secondary mb-2">{stat.name}</div>
              <div className="font-montserrat font-bold text-4xl text-primary mb-1">
                {stat.value}
              </div>
              <div className="flex items-center text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stat.coverage}</span>
              </div>
              <p className="text-xs text-muted mt-2">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Address Search Section */}
        <div className="bg-surface rounded-lg border border-default p-6">
          <div className="border-b border-default pb-4 mb-6">
            <h3 className="font-montserrat font-semibold text-lg text-primary">
              Search Philippine Addresses
            </h3>
            <p className="mt-1 text-sm text-secondary font-montserrat">
              Search across {loading ? '...' : dbStats.barangays.toLocaleString()} barangays nationwide
            </p>
          </div>
          <AddressSearch
            onSelect={handleAddressSelect}
            placeholder="Search for region, province, city, or barangay..."
            maxResults={50}
            className="w-full"
          />
        </div>

        {/* Search Results */}
        {addressResults.length > 0 && (
          <div className="bg-surface rounded-lg border border-default">
            <div className="p-6">
              <div className="border-b border-default pb-4 mb-6">
                <h3 className="font-montserrat font-semibold text-lg text-primary">
                  Recent Selections
                </h3>
                <p className="mt-1 text-sm text-secondary font-montserrat">
                  Recently selected {addressResults.length} address{addressResults.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-default">
                          <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-0">
                            Region
                          </th>
                          <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-primary">
                            Province
                          </th>
                          <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-primary">
                            City/Municipality
                          </th>
                          <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-primary">
                            Barangay
                          </th>
                          <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-primary">
                            Type
                          </th>
                          <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-primary">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-default">
                        {addressResults.map((address, index) => {
                          const status = address.urban_rural_status ? 'complete' : 'partial'
                          
                          return (
                            <tr key={`${address.barangay_code}-${index}`} className="hover:bg-surface-hover transition-colors duration-200">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-0">
                                {address.region_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.province_name || 'Metro Manila'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.city_municipality_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.barangay_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.city_municipality_type}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                                  status === 'complete'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20'
                                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-amber-600/20'
                                }`}>
                                  {status === 'complete' ? 'Complete' : 'Partial'}
                                </span>
                                {address.is_independent && (
                                  <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                    Independent
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coverage Summary */}
        <div className="bg-surface rounded-lg border border-default p-6">
          <div className="border-b border-default pb-4 mb-6">
            <h3 className="font-montserrat font-semibold text-lg text-primary">
              Philippine Address Coverage
            </h3>
            <p className="mt-1 text-sm text-secondary font-montserrat">
              Comprehensive nationwide coverage with real-time data integration
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-background rounded-lg p-4 border border-default">
              <div className="text-2xl font-bold text-emerald-600">
                {loading ? '...' : calculateCoverage(dbStats.barangays, 42028)}
              </div>
              <div className="text-sm font-medium text-secondary mt-1">
                Nationwide Coverage {dbStats.connected ? '(Live)' : '(Offline)'}
              </div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-default">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : dbStats.barangays.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-secondary mt-1">
                Barangays {dbStats.connected ? 'Available' : 'Cached'}
              </div>
            </div>
            <div className="bg-background rounded-lg p-4 border border-default">
              <div className="text-2xl font-bold text-purple-600">
                {loading ? '...' : '17'}
              </div>
              <div className="text-sm font-medium text-secondary mt-1">
                Regions Covered
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}