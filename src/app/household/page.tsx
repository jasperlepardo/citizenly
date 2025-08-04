'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'

export const dynamic = 'force-dynamic'

interface Household {
  code: string
  street_name?: string
  house_number?: string
  subdivision?: string
  barangay_code: string
  region_code?: string
  province_code?: string
  city_municipality_code?: string
  created_at: string
  head_resident?: {
    id: string
    first_name: string
    middle_name?: string
    last_name: string
  }
  member_count?: number
  // Geographic information for display
  region_info?: {
    code: string
    name: string
  }
  province_info?: {
    code: string
    name: string
  }
  city_municipality_info?: {
    code: string
    name: string
    type: string
  }
  barangay_info?: {
    code: string
    name: string
  }
}

function HouseholdsContent() {
  const { user, loading: authLoading, userProfile } = useAuth()
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedHouseholds, setSelectedHouseholds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!authLoading && user && userProfile?.barangay_code) {
      loadHouseholds()
    }
  }, [user, authLoading, userProfile, localSearchTerm])

  const loadHouseholds = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('households')
        .select(`
          *,
          head_resident:residents!households_household_head_id_fkey(
            id,
            first_name,
            middle_name,
            last_name
          )
        `, { count: 'exact' })
        .eq('barangay_code', userProfile?.barangay_code)
        .order('code', { ascending: true })

      if (localSearchTerm.trim()) {
        query = query.or(`code.ilike.%${localSearchTerm}%,street_name.ilike.%${localSearchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      // Get member counts and geographic information for each household
      const householdsWithCounts = await Promise.all(
        (data || []).map(async (household) => {
          // Get member count
          const { count: memberCount } = await supabase
            .from('residents')
            .select('*', { count: 'exact', head: true })
            .eq('household_code', household.code)

          // Get geographic information from PSGC tables
          let geoInfo = {}
          try {
            const { data: barangayData } = await supabase
              .from('psgc_barangays')
              .select(`
                code,
                name,
                psgc_cities_municipalities!inner(
                  code,
                  name,
                  type,
                  psgc_provinces!inner(
                    code,
                    name,
                    psgc_regions!inner(
                      code,
                      name
                    )
                  )
                )
              `)
              .eq('code', household.barangay_code)
              .single()

            if (barangayData) {
              const cityMun = barangayData.psgc_cities_municipalities as any
              const province = cityMun.psgc_provinces as any
              const region = province.psgc_regions as any

              geoInfo = {
                barangay_info: {
                  code: barangayData.code,
                  name: barangayData.name
                },
                city_municipality_info: {
                  code: cityMun.code,
                  name: cityMun.name,
                  type: cityMun.type
                },
                province_info: {
                  code: province.code,
                  name: province.name
                },
                region_info: {
                  code: region.code,
                  name: region.name
                }
              }
            }
          } catch (geoError) {
            console.warn('Could not load geographic info for household:', household.code, geoError)
          }

          return {
            ...household,
            member_count: memberCount || 0,
            ...geoInfo
          }
        })
      )

      setHouseholds(householdsWithCounts)
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error loading households:', err)
      setHouseholds([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedAll) {
      setSelectedHouseholds(new Set())
    } else {
      setSelectedHouseholds(new Set(households.map(h => h.code)))
    }
    setSelectedAll(!selectedAll)
  }

  const handleSelectHousehold = (householdCode: string) => {
    const newSelected = new Set(selectedHouseholds)
    if (newSelected.has(householdCode)) {
      newSelected.delete(householdCode)
    } else {
      newSelected.add(householdCode)
    }
    setSelectedHouseholds(newSelected)
    setSelectedAll(newSelected.size === households.length && households.length > 0)
  }

  const formatFullName = (person?: { first_name: string; middle_name?: string; last_name: string }) => {
    if (!person) return 'No head assigned'
    return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')
  }

  const formatAddress = (household: Household) => {
    const parts = [household.house_number, household.street_name, household.subdivision].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  const formatFullAddress = (household: Household) => {
    const localAddress = formatAddress(household)
    const geoParts = []
    
    if (household.barangay_info?.name) {
      geoParts.push(`Brgy. ${household.barangay_info.name}`)
    }
    
    if (household.city_municipality_info?.name && household.city_municipality_info?.type) {
      geoParts.push(`${household.city_municipality_info.name} (${household.city_municipality_info.type})`)
    }
    
    if (household.province_info?.name) {
      geoParts.push(household.province_info.name)
    }
    
    if (household.region_info?.name) {
      geoParts.push(household.region_info.name)
    }

    if (localAddress === 'No address' && geoParts.length === 0) {
      return 'Address not available'
    }
    
    if (localAddress === 'No address') {
      return geoParts.join(', ')
    }
    
    return geoParts.length > 0 ? `${localAddress}, ${geoParts.join(', ')}` : localAddress
  }

  return (
    <DashboardLayout 
      currentPage="household"
      searchTerm={globalSearchTerm}
      onSearchChange={setGlobalSearchTerm}
    >
      <div className="p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-montserrat font-semibold text-xl text-neutral-900 mb-0.5">Households</h1>
              <p className="font-montserrat font-normal text-sm text-neutral-600">
                {totalCount} total households
              </p>
            </div>
            <Link
              href="/residents/create"
              className="bg-blue-600 text-white px-4 py-2 rounded font-montserrat font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add new resident
            </Link>
          </div>

          {/* Table */}
          <div className="bg-white overflow-hidden">
            {/* Table Header */}
            <div className="bg-white flex items-center p-0 border-b border-neutral-200">
              {/* Select All */}
              <div className="flex items-center p-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="w-4 h-4 border border-neutral-300 rounded flex items-center justify-center"
                  >
                    {selectedAll && (
                      <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                    )}
                  </button>
                  <span className="font-montserrat font-normal text-base text-neutral-800">Select all</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-4">
                <button className="bg-white border border-neutral-300 rounded p-2 flex items-center gap-1 hover:bg-neutral-50">
                  <div className="w-5 h-5 text-neutral-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <span className="font-montserrat font-medium text-base text-neutral-700">Properties</span>
                </button>

                <button className="bg-white border border-neutral-300 rounded p-2 flex items-center gap-1 hover:bg-neutral-50">
                  <div className="w-5 h-5 text-neutral-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <span className="font-montserrat font-medium text-base text-neutral-700">Sort</span>
                </button>

                <button className="bg-white border border-neutral-300 rounded p-2 flex items-center gap-1 hover:bg-neutral-50">
                  <div className="w-5 h-5 text-neutral-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                    </svg>
                  </div>
                  <span className="font-montserrat font-medium text-base text-neutral-700">Filter</span>
                </button>

                <button className="bg-white border border-neutral-300 rounded p-1 hover:bg-neutral-50">
                  <div className="w-5 h-5 text-neutral-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Search Households */}
              <div className="ml-auto mr-0">
                <div className="w-60 bg-white border border-neutral-300 rounded p-2 flex items-center gap-2">
                  <div className="w-5 h-5 text-neutral-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search households"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="flex-1 font-montserrat font-normal text-base text-neutral-400 placeholder-neutral-400 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Table Column Headers */}
            <div className="bg-neutral-50 flex items-center p-0 border-b border-neutral-200">
              {/* Checkbox Column */}
              <div className="p-2 w-12"></div>
              
              {/* Column Headers */}
              <div className="flex-1 grid grid-cols-5 gap-4 p-2">
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Household #</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Head of Household</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Address</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Members</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Created</span>
                </div>
              </div>
              
              {/* Actions Column */}
              <div className="p-1 w-12"></div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-neutral-200">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-neutral-600">Loading households...</p>
                </div>
              ) : households.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-neutral-600">
                    {localSearchTerm ? `No households found matching "${localSearchTerm}"` : 'No households found'}
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Households are created automatically when you add residents.
                  </p>
                </div>
              ) : (
                households.map((household) => (
                  <div key={household.code} className="bg-white flex items-center p-0 hover:bg-neutral-50">
                    {/* Checkbox */}
                    <div className="p-2">
                      <button
                        onClick={() => handleSelectHousehold(household.code)}
                        className="w-4 h-4 border border-neutral-300 rounded flex items-center justify-center"
                      >
                        {selectedHouseholds.has(household.code) && (
                          <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                        )}
                      </button>
                    </div>

                    {/* Content Columns */}
                    <div className="flex-1 grid grid-cols-5 gap-4 p-2">
                      <div className="p-2">
                        <Link 
                          href={`/households/${household.code}`}
                          className="font-montserrat font-normal text-base text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          #{household.code}
                        </Link>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {formatFullName(household.head_resident)}
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {formatFullAddress(household)}
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {household.member_count} member{household.member_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {new Date(household.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Menu */}
                    <div className="p-1">
                      <button className="bg-white border border-neutral-300 rounded p-2 hover:bg-neutral-50">
                        <div className="w-5 h-5 text-neutral-600">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
}

export default function HouseholdsPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <HouseholdsContent />
    </ProtectedRoute>
  )
}