'use client'

/**
 * Addresses Page
 * Philippine address management with location services and mapping
 */

import React, { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'

// Icons
function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  )
}

function GlobeAsiaAustraliaIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-.427 1.068l-2.146 1.025c-.348.166-.705-.032-.705-.405v-.741c0-1.036.84-1.875 1.875-1.875h.375a1.5 1.5 0 0 0 1.302-.756l.723-1.447A.75.75 0 0 0 9 10.125l-1.875.375L5.25 12.75v-2.757c0-.235-.146-.445-.365-.53-.47-.18-.57-.69-.189-1.07l.256-.256a1.875 1.875 0 0 0 .55-1.326V3.75A20.25 20.25 0 0 1 12.75 3.03Z" />
    </svg>
  )
}

function BuildingOfficeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9h.75m0 0h.75m-.75 0v3m0-3v-1.5M12 9h.75m-.75 0v3m0-3v-1.5m0 1.5h-.75M18 9h-.75m.75 0v3m0-3v-1.5m0 1.5h-.75" />
    </svg>
  )
}

function HomeModernIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
    </svg>
  )
}

function MagnifyingGlassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

export default function AddressesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')

  // Address hierarchy statistics
  const addressStats = [
    {
      name: 'Regions',
      value: '17',
      description: 'Administrative regions',
      icon: GlobeAsiaAustraliaIcon,
      color: 'bg-blue-500',
      coverage: '100%'
    },
    {
      name: 'Provinces',
      value: '86',
      description: 'Provinces and NCR',
      icon: HomeModernIcon,
      color: 'bg-green-500',
      coverage: '100%'
    },
    {
      name: 'Cities/Municipalities',
      value: '1,637',
      description: 'Cities and municipalities',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-500',
      coverage: '100%'
    },
    {
      name: 'Barangays',
      value: '38,372',
      description: 'Barangay coverage',
      icon: MapPinIcon,
      color: 'bg-orange-500',
      coverage: '91.3%'
    }
  ]

  // Mock address data
  const mockAddresses = [
    {
      id: 1,
      region: 'National Capital Region (NCR)',
      province: 'Metro Manila',
      city: 'Makati City',
      barangay: 'Poblacion',
      zipCode: '1210',
      residents: 1245,
      status: 'complete'
    },
    {
      id: 2,
      region: 'National Capital Region (NCR)',
      province: 'Metro Manila',
      city: 'Quezon City',
      barangay: 'Barangay 1',
      zipCode: '1100',
      residents: 2134,
      status: 'complete'
    },
    {
      id: 3,
      region: 'Region IV-A (CALABARZON)',
      province: 'Laguna',
      city: 'Los Baños',
      barangay: 'Poblacion',
      zipCode: '4030',
      residents: 876,
      status: 'partial'
    },
    {
      id: 4,
      region: 'Region III (Central Luzon)',
      province: 'Bulacan',
      city: 'Malolos',
      barangay: 'Barangay Poblacion',
      zipCode: '3000',
      residents: 1521,
      status: 'complete'
    }
  ]

  const filteredAddresses = mockAddresses.filter(address => {
    const matchesSearch = [address.region, address.province, address.city, address.barangay]
      .some(field => field.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLevel = selectedLevel === 'all' || address.status === selectedLevel
    return matchesSearch && matchesLevel
  })

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Address Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete Philippine administrative address hierarchy and location services
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/address-demo"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <MapPinIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Try Address Demo
            </Link>
          </div>
        </div>

        {/* Address Hierarchy Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {addressStats.map((stat) => (
            <div key={stat.name} className="relative overflow-hidden rounded-xl bg-white px-4 pb-12 pt-5 shadow ring-1 ring-gray-900/5 sm:px-6 sm:pt-6">
              <dt>
                <div className={`absolute rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                  <span className="ml-1">{stat.coverage}</span>
                </div>
              </dd>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Philippines Map Visualization */}
        <div className="bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Philippine Address Coverage Map
            </h3>
            <div className="mt-6 flex items-center justify-center min-h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <GlobeAsiaAustraliaIcon className="mx-auto h-24 w-24 text-indigo-400" />
                <h4 className="mt-4 text-lg font-medium text-gray-900">Interactive Map Coming Soon</h4>
                <p className="mt-2 text-sm text-gray-500 max-w-sm">
                  Interactive map visualization showing barangay coverage across the Philippines with real-time data integration.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">91.3%</div>
                    <div className="text-xs text-green-700">Nationwide Coverage</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">38,372</div>
                    <div className="text-xs text-blue-700">Barangays Mapped</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search addresses..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Address Directory */}
        <div className="bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Address Directory
                </h3>
                <p className="mt-2 text-sm text-gray-700">
                  Browse and manage Philippine administrative addresses by region, province, city, and barangay.
                </p>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Region
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Province
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          City/Municipality
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Barangay
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Residents
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAddresses.map((address) => (
                        <tr key={address.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {address.region}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {address.province}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {address.city}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {address.barangay}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {address.residents.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              address.status === 'complete'
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : address.status === 'partial'
                                ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                                : 'bg-gray-50 text-gray-700 ring-gray-600/20'
                            }`}>
                              {address.status === 'complete' ? 'Complete' : address.status === 'partial' ? 'Partial' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Address Validation</h3>
              <p className="mt-2 text-sm text-gray-500">
                Validate and standardize Philippine addresses using our comprehensive database.
              </p>
              <div className="mt-4">
                <Link
                  href="/address-demo"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Try Validation Tool
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Location Services</h3>
              <p className="mt-2 text-sm text-gray-500">
                Access geocoding, mapping, and location-based services for your applications.
              </p>
              <div className="mt-4">
                <button className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}