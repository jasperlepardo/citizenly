'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/templates'

export const dynamic = 'force-dynamic'

interface Resident {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  extension_name?: string
  birthdate: string
  sex: 'male' | 'female'
  civil_status?: string
  citizenship?: string
  occupation_title?: string
  place_of_birth?: string
  household_id?: string
  household_code?: string
  barangay_code: string
}

interface Household {
  id: string
  code: string
  household_number?: string
  house_number?: string
  street_name?: string
  subdivision?: string
  zip_code?: string
  barangay_code: string
  total_members?: number
  household_head_id?: string
  created_at: string
  head_resident?: {
    id: string
    first_name: string
    middle_name?: string
    last_name: string
    extension_name?: string
  }
}

interface AddressInfo {
  barangay_name: string
  city_municipality_name: string
  province_name?: string
  region_name: string
}

function HouseholdSelector() {
  const { userProfile } = useAuth()
  const [households, setHouseholds] = useState<Household[]>([])
  const [filteredHouseholds, setFilteredHouseholds] = useState<Household[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [houseNumberFilter, setHouseNumberFilter] = useState('')
  const [streetNameFilter, setStreetNameFilter] = useState('')
  const [subdivisionFilter, setSubdivisionFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [householdsWithHeads, setHouseholdsWithHeads] = useState<(Household & { headName?: string })[]>([])

  useEffect(() => {
    const loadHouseholds = async () => {
      try {
        setLoading(true)
        console.log('Starting to load households...')
        
        // First, try a simple count query to check table access
        const { count, error: countError } = await supabase
          .from('households')
          .select('*', { count: 'exact', head: true })
        
        console.log('Household count check:', { count, countError })
        
        const { data: householdData, error } = await supabase
          .from('households')
          .select(`
            *,
            head_resident:residents!households_household_head_id_fkey(
              id,
              first_name,
              middle_name,
              last_name,
              extension_name
            )
          `)
          .order('code')

        console.log('Query result:', { householdData, error })
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        console.log('Loaded households:', householdData?.length, 'households')
        if (householdData && householdData.length > 0) {
          console.log('Sample household codes:', householdData.slice(0, 3).map(h => h.code))
        }
        
        // Process households and extract head names from JOIN data
        const householdsWithHeadNames = (householdData || []).map((household) => {
          let headName = undefined
          if (household.head_resident) {
            headName = [
              household.head_resident.first_name,
              household.head_resident.middle_name,
              household.head_resident.last_name,
              household.head_resident.extension_name
            ].filter(Boolean).join(' ')
          }
          
          return {
            ...household,
            headName
          }
        })
        
        console.log('Final households with heads:', householdsWithHeadNames)
        console.log('Search test - looking for "042114014-0000-0001-0001"')
        const testHousehold = householdsWithHeadNames.find(h => h.code === '042114014-0000-0001-0001')
        console.log('Found test household:', testHousehold)
        
        setHouseholds(householdData || [])
        setHouseholdsWithHeads(householdsWithHeadNames)
        setFilteredHouseholds(householdsWithHeadNames)
      } catch (err) {
        console.error('Error loading households:', err)
        // Set an empty array so the UI shows "No households found" instead of loading forever
        setHouseholds([])
        setHouseholdsWithHeads([])
        setFilteredHouseholds([])
      } finally {
        setLoading(false)
      }
    }

    loadHouseholds()
  }, [])

  useEffect(() => {
    console.log('Filtering households. Search term:', searchTerm)
    console.log('Total households to filter:', householdsWithHeads.length)
    
    let filtered = householdsWithHeads.filter(household => {
      // Text search across multiple fields
      const searchFields = [
        household.code,
        household.house_number,
        household.street_name,
        household.subdivision,
        household.headName
      ].filter(Boolean).join(' ').toLowerCase()
      
      console.log(`Household ${household.code} search fields:`, searchFields)
      
      const matchesSearch = !searchTerm || 
        searchFields.includes(searchTerm.toLowerCase()) ||
        household.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (household.house_number && household.house_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (household.street_name && household.street_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (household.subdivision && household.subdivision.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (household.headName && household.headName.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Individual field filters
      const matchesHouseNumber = !houseNumberFilter || 
        (household.house_number && household.house_number.toLowerCase().includes(houseNumberFilter.toLowerCase()))
      
      const matchesStreetName = !streetNameFilter || 
        (household.street_name && household.street_name.toLowerCase().includes(streetNameFilter.toLowerCase()))
      
      const matchesSubdivision = !subdivisionFilter || 
        (household.subdivision && household.subdivision.toLowerCase().includes(subdivisionFilter.toLowerCase()))
      
      const result = matchesSearch && matchesHouseNumber && matchesStreetName && matchesSubdivision
      
      if (searchTerm === '042114014-0000-0001-0001') {
        console.log(`Household ${household.code} filter result:`, {
          searchFields,
          matchesSearch,
          matchesHouseNumber,
          matchesStreetName,
          matchesSubdivision,
          result
        })
      }
      
      return result
    })
    
    console.log('Filtered households count:', filtered.length)
    setFilteredHouseholds(filtered)
  }, [searchTerm, houseNumberFilter, streetNameFilter, subdivisionFilter, householdsWithHeads])

  const formatHeadName = (household: Household & { headName?: string }) => {
    return household.headName || 'No head assigned'
  }

  const formatAddress = (household: Household) => {
    const parts = [household.house_number, household.street_name, household.subdivision].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600">Loading households...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        {/* Main Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by household code, house number, street name, subdivision, or head name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Individual Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">House Number</label>
            <input
              type="text"
              placeholder="Filter by house number..."
              value={houseNumberFilter}
              onChange={(e) => setHouseNumberFilter(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Street Name</label>
            <input
              type="text"
              placeholder="Filter by street name..."
              value={streetNameFilter}
              onChange={(e) => setStreetNameFilter(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subdivision</label>
            <input
              type="text"
              placeholder="Filter by subdivision..."
              value={subdivisionFilter}
              onChange={(e) => setSubdivisionFilter(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Clear Filters */}
        {(searchTerm || houseNumberFilter || streetNameFilter || subdivisionFilter) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setHouseNumberFilter('')
                setStreetNameFilter('')
                setSubdivisionFilter('')
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Counter */}
      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
        Showing {filteredHouseholds.length} of {householdsWithHeads.length} households
      </div>

      {/* Household List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredHouseholds.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">
              {(searchTerm || houseNumberFilter || streetNameFilter || subdivisionFilter) 
                ? 'No households match your search criteria' 
                : 'No households found in the database'}
            </p>
            {!(searchTerm || houseNumberFilter || streetNameFilter || subdivisionFilter) && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500">
                  Households are created automatically when you add residents.
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                  <a 
                    href="/residents/create" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    Add Resident
                  </a>
                  <a 
                    href="/debug-households" 
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                  >
                    Debug Households
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          filteredHouseholds.map((household) => (
            <div key={household.id || household.code} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="font-mono text-sm font-medium text-blue-600">
                      #{household.code}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatHeadName(household)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {formatAddress(household)}
                  </div>
                </div>
                <div className="ml-4">
                  <a
                    href={`/rbi-form?household=${household.code}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Generate RBI Form
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RBIFormContent() {
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const [household, setHousehold] = useState<Household | null>(null)
  const [residents, setResidents] = useState<Resident[]>([])
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableHouseholds, setAvailableHouseholds] = useState<Household[]>([])

  // Get household ID from URL params or use a default
  const householdId = searchParams.get('household') || searchParams.get('id')

  useEffect(() => {
    const loadHouseholdData = async () => {
      if (!householdId && !userProfile?.barangay_code) return

      try {
        setLoading(true)
        let targetHousehold: Household | null = null

        if (householdId) {
          // Load specific household by ID or code
          let { data: householdData, error: householdError } = await supabase
            .from('households')
            .select('*')
            .eq('code', householdId)
            .single()

          // If not found by code, try by ID
          if (householdError && householdId.length < 50) { // IDs are usually shorter than codes
            const result = await supabase
              .from('households')
              .select('*')
              .eq('id', householdId)
              .single()
            
            householdData = result.data
            householdError = result.error
          }

          if (householdError) {
            console.error('Household error:', householdError)
            
            // Load available households for debugging
            const { data: allHouseholds } = await supabase
              .from('households')
              .select('id, code, household_number, barangay_code, created_at')
              .limit(10)
            
            setAvailableHouseholds(allHouseholds || [])
            setError(`Household not found: ${householdId}`)
            return
          }
          targetHousehold = householdData
        } else {
          // Load first household from user's barangay or any available household
          let { data: householdData, error: householdError } = await supabase
            .from('households')
            .select('*')
            .eq('barangay_code', userProfile?.barangay_code || '')
            .limit(1)
            .single()

          // If no household in user's barangay, try to get any household
          if (householdError || !householdData) {
            console.log('No households in user barangay, trying any household...')
            const { data: anyHousehold, error: anyError } = await supabase
              .from('households')
              .select('*')
              .limit(1)
              .single()

            if (anyError || !anyHousehold) {
              console.error('No households found anywhere:', anyError)
              setError('No households found in the database')
              return
            }
            householdData = anyHousehold
          }
          targetHousehold = householdData
        }

        if (!targetHousehold) {
          setError('No household data available')
          return
        }

        setHousehold(targetHousehold)

        // Load all residents in this household - try both household_id and household_code
        let residentsData = null
        let residentsError = null

        // First try with household_id if it exists
        if (targetHousehold.id) {
          const result = await supabase
            .from('residents')
            .select('*')
            .eq('household_id', targetHousehold.id)
            .order('created_at')
          
          residentsData = result.data
          residentsError = result.error
        }

        // If no results with household_id, try with household_code
        if ((!residentsData || residentsData.length === 0) && targetHousehold.code) {
          console.log('Trying to find residents by household_code:', targetHousehold.code)
          const result = await supabase
            .from('residents')
            .select('*')
            .eq('household_code', targetHousehold.code)
            .order('created_at')
          
          residentsData = result.data
          residentsError = result.error
        }

        if (residentsError) {
          console.error('Residents error:', residentsError)
          setError('Failed to load residents')
          return
        }

        setResidents(residentsData || [])

        // Load address information
        const { data: barangayData } = await supabase
          .from('psgc_barangays')
          .select('name, city_municipality_code')
          .eq('code', targetHousehold.barangay_code)
          .single()

        if (barangayData) {
          let addressData: AddressInfo = {
            barangay_name: barangayData.name,
            city_municipality_name: 'Unknown',
            region_name: 'Unknown'
          }

          // Get city/municipality info
          const { data: cityData } = await supabase
            .from('psgc_cities_municipalities')
            .select('name, province_code')
            .eq('code', barangayData.city_municipality_code)
            .single()

          if (cityData) {
            addressData.city_municipality_name = cityData.name

            // Get province info
            const { data: provinceData } = await supabase
              .from('psgc_provinces')
              .select('name, region_code')
              .eq('code', cityData.province_code)
              .single()

            if (provinceData) {
              addressData.province_name = provinceData.name

              // Get region info
              const { data: regionData } = await supabase
                .from('psgc_regions')
                .select('name')
                .eq('code', provinceData.region_code)
                .single()

              if (regionData) {
                addressData.region_name = regionData.name
              }
            }
          }

          setAddressInfo(addressData)
        }

      } catch (err) {
        console.error('Error loading household data:', err)
        setError('Failed to load household data')
      } finally {
        setLoading(false)
      }
    }

    loadHouseholdData()
  }, [householdId, userProfile?.barangay_code])


  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).toUpperCase()
  }

  const formatSex = (sex: string) => {
    return sex === 'male' ? 'M' : sex === 'female' ? 'F' : ''
  }

  const formatCivilStatus = (status: string) => {
    if (!status) return ''
    return status.replace('_', ' ').toUpperCase()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm text-neutral-600">Loading household data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show household selection interface if no household is specified or not found
  if (!householdId || (error && !household)) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-3">RBI Form A</h1>
              <h2 className="text-xl font-semibold mb-4">RECORD OF BARANGAY INHABITANTS BY HOUSEHOLD</h2>
              <p className="text-gray-600">Select a household to generate the RBI form</p>
            </div>

            {error && householdId && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <HouseholdSelector />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full min-h-screen bg-white p-6 print:p-2">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-3">RBI Form A</h1>
          <h2 className="text-xl font-semibold">RECORD OF BARANGAY INHABITANTS BY HOUSEHOLD</h2>
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-3 gap-8 mb-8 text-base">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">A. REGION</span>
              <span className="border-b border-black flex-1 px-2">{addressInfo?.region_name || ''}</span>
              <span className="text-xs">PSG</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">B. PROVINCE</span>
              <span className="border-b border-black flex-1 px-2">{addressInfo?.province_name || ''}</span>
              <span className="text-xs">CODES</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">C. CITY/MUNICIPALITY</span>
              <span className="border-b border-black flex-1 px-2">{addressInfo?.city_municipality_name || ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">D. BARANGAY</span>
              <span className="border-b border-black flex-1 px-2">{addressInfo?.barangay_name || ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">R. HOUSEHOLD NO.</span>
              <span className="border-b border-black flex-1 px-2">{household?.house_number || ''}</span>
            </div>
          </div>
          <div></div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="font-semibold">DATE ACCOMPLISHED:</span>
              <span className="border-b border-black px-2">{formatDate(household?.created_at || '')}</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="mb-8 w-full overflow-x-auto">
          <table className="w-full border-2 border-black border-collapse">
            {/* Header Row - Main Categories */}
            <thead>
              <tr>
                <th colSpan={4} className="border border-black p-2 text-center font-semibold text-base">
                  NAME (1)
                </th>
                <th colSpan={3} className="border border-black p-2 text-center font-semibold text-base">
                  ADDRESS (2)
                </th>
                <th rowSpan={2} className="border border-black p-2 text-center font-semibold text-base min-w-[120px]">
                  PLACE OF BIRTH<br/>(3)
                </th>
                <th rowSpan={2} className="border border-black p-2 text-center font-semibold text-base min-w-[120px]">
                  DATE OF BIRTH<br/>(4)
                </th>
                <th rowSpan={2} className="border border-black p-2 text-center font-semibold text-base min-w-[80px]">
                  SEX<br/>(5)
                </th>
                <th rowSpan={2} className="border border-black p-2 text-center font-semibold text-base min-w-[100px]">
                  CIVIL STATUS<br/>(6)
                </th>
                <th rowSpan={2} className="border border-black p-2 text-center font-semibold text-base min-w-[100px]">
                  CITIZENSHIP (7)
                </th>
                <th rowSpan={2} className="border border-black p-2 text-center font-semibold text-base min-w-[120px]">
                  OCCUPATION<br/>(8)
                </th>
              </tr>
              
              {/* Sub Header Row - Individual Fields */}
              <tr>
                <th className="border border-black p-2 text-center font-semibold text-base min-w-[120px]">
                  LAST NAME<br/>(1.1)
                </th>
                <th className="border border-black p-2 text-center font-semibold text-base min-w-[120px]">
                  FIRST NAME<br/>(1.2)
                </th>
                <th className="border border-black p-2 text-center font-semibold text-base min-w-[120px]">
                  MIDDLE NAME<br/>(1.3)
                </th>
                <th className="border border-black p-2 text-center font-semibold text-base min-w-[80px]">
                  EXT.<br/>(1.4)
                </th>
                <th className="border border-black p-2 text-center font-semibold text-base min-w-[100px]">
                  HOUSE NO.<br/>(2.1)
                </th>
                <th className="border border-black p-2 text-center font-semibold text-base min-w-[150px]">
                  STREET NAME<br/>(2.2)
                </th>
                <th className="border border-black p-2 text-center font-semibold text-base min-w-[160px]">
                  SUBDIVISION / ZONE / SITIO / PUROK<br/>(if applicable)<br/>(2.3)
                </th>
                {/* The rowSpan={2} columns from first row continue here */}
              </tr>
            </thead>
            
            {/* Data Rows */}
            <tbody>
              {residents.map((resident) => (
                <tr key={resident.id} className="min-h-[60px]">
                  <td className="border border-black p-3 text-center text-base font-medium">{resident.last_name}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{resident.first_name}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{resident.middle_name || ''}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{resident.extension_name || ''}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{household?.house_number || ''}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{household?.street_name || ''}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{household?.subdivision || ''}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{resident.place_of_birth || ''}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{formatDate(resident.birthdate)}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{formatSex(resident.sex)}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{formatCivilStatus(resident.civil_status || '')}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{resident.citizenship || ''}</td>
                  <td className="border border-black p-3 text-center text-base font-medium">{resident.occupation_title || ''}</td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-3 gap-12 text-base mt-16">
          <div className="text-center">
            <div className="text-base font-medium mb-4">Prepared by:</div>
            <div className="h-12 border-b border-black flex items-end justify-center mb-2">
              <div className="text-base font-medium">
                {residents.length > 0 && household?.household_head_id
                  ? (() => {
                      const headResident = residents.find(r => r.id === household.household_head_id);
                      return headResident 
                        ? `${headResident.first_name} ${headResident.middle_name ? headResident.middle_name + ' ' : ''}${headResident.last_name}${headResident.extension_name ? ' ' + headResident.extension_name : ''}`
                        : '';
                    })()
                  : ''
                }
              </div>
            </div>
            <div className="text-base mb-1">Name of Household head/member</div>
            <div className="text-sm italic text-gray-600">(Signature over Printed name)</div>
          </div>
          
          <div className="text-center">
            <div className="text-base font-medium mb-4">Certified correct:</div>
            <div className="h-12 border-b border-black mb-2"></div>
            <div className="text-base mb-1">Barangay Secretary</div>
            <div className="text-sm italic text-gray-600">(Signature over printed name)</div>
          </div>
          
          <div className="text-center">
            <div className="text-base font-medium mb-4">Validated by:</div>
            <div className="h-12 border-b border-black mb-2"></div>
            <div className="text-base mb-1">Punong Barangay</div>
            <div className="text-sm italic text-gray-600">(Signature over printed name)</div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-8 print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
        >
          Print Form
        </button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
          
          /* Hide all dashboard navigation elements */
          .min-h-screen .fixed,
          [class*="fixed"],
          [class*="sidebar"],
          nav,
          header,
          .ml-56 > div:first-child {
            display: none !important;
          }
          
          /* Reset main content positioning */
          .ml-56 {
            margin-left: 0 !important;
          }
          
          /* Hide any top bars or headers */
          .bg-white.border-b,
          .border-neutral-300,
          .px-6.py-2 {
            display: none !important;
          }
          
          /* Hide print button and other interactive elements */
          .print\\:hidden,
          button {
            display: none !important;
          }
          
          /* Ensure the main content takes full width */
          body,
          html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          
          /* Main container adjustments */
          .min-h-screen {
            min-height: auto !important;
            margin: 0 !important;
            padding: 0.5in !important;
            width: 100% !important;
          }
          
          /* Form container */
          .w-full.min-h-screen.bg-white {
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 10px !important;
            background: white !important;
          }
          
          /* Table optimizations for landscape print */
          table {
            font-size: 9px !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            display: table !important;
            border-collapse: collapse !important;
            border: 2px solid black !important;
          }
          
          thead {
            display: table-header-group !important;
          }
          
          tbody {
            display: table-row-group !important;
          }
          
          tr {
            display: table-row !important;
          }
          
          th, td {
            display: table-cell !important;
            padding: 3px !important;
            font-size: 9px !important;
            border: 1px solid black !important;
            vertical-align: middle !important;
          }
          
          /* Ensure last column has right border */
          th:last-child, td:last-child {
            border-right: 1px solid black !important;
          }
          
          /* Header text adjustments */
          h1, h2 {
            font-size: 14px !important;
            margin: 10px 0 !important;
          }
          
          /* Location information section */
          .grid.grid-cols-3 {
            font-size: 11px !important;
            margin-bottom: 15px !important;
          }
          
          /* Signature section */
          .grid.grid-cols-3.gap-12 {
            font-size: 11px !important;
            margin-top: 20px !important;
          }
          
          /* Remove any scrollbars and ensure full width */
          .overflow-x-auto {
            overflow: visible !important;
          }
          
          /* Ensure table takes full available width */
          table {
            margin: 0 !important;
          }
          
          /* Color preservation */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}

export default function RBIFormPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <RBIFormContent />
    </ProtectedRoute>
  )
}