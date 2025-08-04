'use client'

/**
 * Addresses Page
 * Philippine address management with location services and mapping
 */

import React, { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'


export default function AddressesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')

  // Address hierarchy statistics
  const addressStats = [
    {
      name: 'Regions',
      value: '17',
      description: 'Administrative regions',
      gradient: 'from-blue-500 to-indigo-600',
      coverage: '100%'
    },
    {
      name: 'Provinces',
      value: '86',
      description: 'Provinces and NCR',
      gradient: 'from-emerald-500 to-green-600',
      coverage: '100%'
    },
    {
      name: 'Cities/Municipalities',
      value: '1,637',
      description: 'Cities and municipalities',
      gradient: 'from-purple-500 to-pink-600',
      coverage: '100%'
    },
    {
      name: 'Barangays',
      value: '38,372',
      description: 'Barangay coverage',
      gradient: 'from-orange-500 to-red-600',
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
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200/60">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Address Management
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Complete Philippine administrative address hierarchy and location services
              </p>
            </div>
            <div className="mt-6 flex md:ml-4 md:mt-0">
              <Link
                href="/address-demo"
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200"
              >
                Try Address Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Address Hierarchy Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {addressStats.map((stat) => (
            <div key={stat.name} className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/60 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-6 h-6 bg-white rounded-lg opacity-90"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{stat.name}</h3>
                <div className="flex items-baseline mb-3">
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <div className="ml-3 flex items-center text-sm font-semibold text-emerald-600">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 mr-1"></div>
                    <span>{stat.coverage}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-auto">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Philippines Map Visualization */}
        <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
          <div className="p-8">
            <div className="border-b border-slate-200 pb-6 mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                Philippine Address Coverage Map
              </h3>
            </div>
            <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-dashed border-slate-300">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                  <div className="h-12 w-12 bg-white rounded-2xl opacity-90"></div>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Interactive Map Coming Soon</h4>
                <p className="text-slate-600 max-w-md mb-8">
                  Interactive map visualization showing barangay coverage across the Philippines with real-time data integration.
                </p>
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">91.3%</div>
                    <div className="text-sm font-medium text-slate-700 mt-1">Nationwide Coverage</div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">38,372</div>
                    <div className="text-sm font-medium text-slate-700 mt-1">Barangays Mapped</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <div className="h-5 w-5 text-slate-400">
                <div className="h-4 w-4 rounded-full border border-current"></div>
                <div className="absolute top-3 left-3 h-2 w-0.5 bg-current rotate-45"></div>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search addresses..."
              className="block w-full rounded-2xl border-0 py-3 pl-12 pr-4 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:bg-white transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="rounded-2xl border-0 py-3 pl-4 pr-10 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
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
        <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
          <div className="p-8">
            <div className="border-b border-slate-200 pb-6 mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                Address Directory
              </h3>
              <p className="mt-2 text-slate-600">
                Browse and manage Philippine administrative addresses by region, province, city, and barangay.
              </p>
            </div>
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0">
                          Region
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Province
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          City/Municipality
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Barangay
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Residents
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAddresses.map((address) => (
                        <tr key={address.id} className="hover:bg-slate-50 transition-colors duration-200">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">
                            {address.region}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            {address.province}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            {address.city}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            {address.barangay}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            {address.residents.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                              address.status === 'complete'
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                : address.status === 'partial'
                                ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                : 'bg-slate-50 text-slate-700 ring-slate-600/20'
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
            <div className="p-8">
              <div className="border-b border-slate-200 pb-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900">Address Validation</h3>
                <p className="mt-2 text-slate-600">
                  Validate and standardize Philippine addresses using our comprehensive database.
                </p>
              </div>
              <Link
                href="/address-demo"
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                Try Validation Tool
              </Link>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
            <div className="p-8">
              <div className="border-b border-slate-200 pb-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900">Location Services</h3>
                <p className="mt-2 text-slate-600">
                  Access geocoding, mapping, and location-based services for your applications.
                </p>
              </div>
              <button className="inline-flex items-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}