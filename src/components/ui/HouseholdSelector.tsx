'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import CreateHouseholdModal from './CreateHouseholdModal'

interface Household {
  code: string
  head_name?: string
  street_name?: string
  house_number?: string
  member_count?: number
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
        // Get households with basic info and member count
        const { data: householdsData, error } = await supabase
          .from('households')
          .select(`
            code,
            street_name,
            house_number,
            household_head_id
          `)
          .eq('barangay_code', userProfile.barangay_code)
          .order('code', { ascending: true })

        if (error) {
          console.error('Error loading households:', error)
          return
        }

        // Get member counts and head info for each household
        const householdsWithCounts = await Promise.all(
          (householdsData || []).map(async (household) => {
            // Get member count
            const { count } = await supabase
              .from('residents')
              .select('*', { count: 'exact', head: true })
              .eq('household_code', household.code)

            // Get head info if household_head_id exists
            let headName = 'No Head Assigned'
            if (household.household_head_id) {
              const { data: headData } = await supabase
                .from('residents')
                .select('first_name, last_name')
                .eq('id', household.household_head_id)
                .single()
              
              if (headData) {
                headName = `${headData.first_name} ${headData.last_name}`
              }
            }

            return {
              code: household.code,
              head_name: headName,
              street_name: household.street_name,
              house_number: household.house_number,
              member_count: count || 0
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

  // Filter households based on search term
  const filteredHouseholds = households.filter(household =>
    household.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    household.head_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    household.street_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedHousehold = households.find(h => h.code === value)
  
  // Debug logging for selection state
  React.useEffect(() => {
    console.log('HouseholdSelector state:', {
      value,
      householdsCount: households.length,
      selectedHousehold: selectedHousehold ? `${selectedHousehold.code} - ${selectedHousehold.head_name}` : 'None found',
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
          value={selectedHousehold ? `#${selectedHousehold.code} - ${selectedHousehold.head_name}` : searchTerm}
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
                        Head: {household.head_name}
                      </div>
                      {household.street_name && (
                        <div className="text-xs text-neutral-500">
                          {household.house_number && `${household.house_number} `}
                          {household.street_name}
                        </div>
                      )}
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