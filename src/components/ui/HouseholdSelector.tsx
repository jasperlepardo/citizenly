'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import CreateHouseholdModal from './CreateHouseholdModal'

interface Household {
  code: string
  street_name?: string
  house_number?: string
  subdivision?: string
  barangay_code: string
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

interface HouseholdSelectorProps {
  value: string
  onSelect: (householdCode: string | null) => void
  error?: string
  placeholder?: string
}

export default function HouseholdSelector({
  value,
  onSelect,
  error,
  placeholder = "🏠 Search households or leave blank to create new"
}: HouseholdSelectorProps) {
  const { userProfile } = useAuth()
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Load households for the user's barangay
  const loadHouseholds = async () => {
      if (!userProfile?.barangay_code) {
        console.log('No barangay_code available, cannot load households')
        return
      }

      console.log('Loading households for barangay:', userProfile.barangay_code)
      setLoading(true)
      try {
        // Get households with head resident info
        const { data: householdsData, error } = await supabase
          .from('households')
          .select(`
            *,
            head_resident:residents!households_household_head_id_fkey(
              id,
              first_name,
              middle_name,
              last_name
            )
          `)
          .eq('barangay_code', userProfile.barangay_code)
          .order('code', { ascending: true })

        if (error) {
          console.error('Error loading households:', error)
          return
        }

        // Get member counts and geographic information for each household
        const householdsWithCounts = await Promise.all(
          (householdsData || []).map(async (household) => {
            // Get member count
            const { count } = await supabase
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
              member_count: count || 0,
              ...geoInfo
            }
          })
        )

        console.log('Loaded households:', householdsWithCounts)
        setHouseholds(householdsWithCounts)
      } catch (error) {
        console.error('Error loading households:', error)
      } finally {
        setLoading(false)
      }
    }

  // Load households when barangay changes
  useEffect(() => {
    loadHouseholds()
  }, [userProfile?.barangay_code])

  // Helper function to format full name
  const formatFullName = (person?: { first_name: string; middle_name?: string; last_name: string }) => {
    if (!person) return 'No head assigned'
    return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')
  }

  // Helper function to format address
  const formatAddress = (household: Household) => {
    const parts = [household.house_number, household.street_name, household.subdivision].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  // Helper function to format full address with geographic hierarchy
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

    if (localAddress === 'No address' && geoParts.length === 0) {
      return 'Address not available'
    }
    
    if (localAddress === 'No address') {
      return geoParts.join(', ')
    }
    
    return geoParts.length > 0 ? `${localAddress}, ${geoParts.join(', ')}` : localAddress
  }

  // Filter households based on search term
  const filteredHouseholds = households.filter(household => {
    const searchLower = searchTerm.toLowerCase()
    return (
      household.code.toLowerCase().includes(searchLower) ||
      formatFullName(household.head_resident).toLowerCase().includes(searchLower) ||
      household.street_name?.toLowerCase().includes(searchLower) ||
      household.house_number?.toLowerCase().includes(searchLower) ||
      household.subdivision?.toLowerCase().includes(searchLower)
    )
  })

  const selectedHousehold = households.find(h => h.code === value)
  
  // Debug logging for selection state
  React.useEffect(() => {
    console.log('HouseholdSelector state:', {
      value,
      householdsCount: households.length,
      selectedHousehold: selectedHousehold ? `${selectedHousehold.code} - ${formatFullName(selectedHousehold.head_resident)}` : 'None found',
      households: households.map(h => ({ code: h.code }))
    })
  }, [value, households, selectedHousehold])

  return (
    <div className="relative">
      <div className={`relative border rounded font-montserrat text-base focus-within:ring-2 focus-within:border-transparent ${
        error 
          ? 'border-red-500 focus-within:ring-red-500' 
          : 'border-neutral-300 focus-within:ring-blue-500'
      }`}>
        <input
          type="text"
          value={selectedHousehold ? `#${selectedHousehold.code} - ${formatFullAddress(selectedHousehold)} (${formatFullName(selectedHousehold.head_resident)})` : searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
            if (!e.target.value) {
              onSelect(null)
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2 bg-transparent outline-none"
          placeholder={placeholder}
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-neutral-500">
              <div className="animate-pulse">Loading households...</div>
            </div>
          ) : (
            <div>
              {/* Always show option to create new household */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setShowCreateModal(true)
                }}
                className="w-full p-3 text-left hover:bg-blue-50 border-b border-neutral-100"
              >
                <div className="font-medium text-blue-600">+ Create New Household</div>
                <div className="text-xs text-blue-500">This resident will start a new household</div>
              </button>

              {/* Show message when no existing households */}
              {filteredHouseholds.length === 0 && !searchTerm && (
                <div className="p-3 text-center text-neutral-500">
                  <div className="text-sm">No existing households in this barangay</div>
                  <div className="text-xs mt-1 text-green-600">✓ Perfect! This will be the first household</div>
                </div>
              )}

              {/* Show "no search results" when searching */}
              {filteredHouseholds.length === 0 && searchTerm && (
                <div className="p-3 text-center text-neutral-500">
                  <div className="text-sm">No households match your search</div>
                </div>
              )}

              {/* Existing households */}
              {filteredHouseholds.map((household) => (
                <button
                  key={household.code}
                  type="button"
                  onClick={() => {
                    onSelect(household.code)
                    setSearchTerm('')
                    setIsOpen(false)
                  }}
                  className="w-full p-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">
                        Household #{household.code}
                      </div>
                      <div className="text-sm text-neutral-600">
                        Head: {formatFullName(household.head_resident)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {formatFullAddress(household)}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500 ml-2">
                      {household.member_count} member{household.member_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Create Household Modal */}
      <CreateHouseholdModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onHouseholdCreated={(householdCode) => {
          console.log('Auto-selecting newly created household:', householdCode)
          onSelect(householdCode)
          setShowCreateModal(false)
          // Refresh households list after a small delay to ensure database consistency
          setTimeout(() => {
            console.log('Refreshing households list...')
            loadHouseholds()
          }, 500)
        }}
      />
    </div>
  )
}