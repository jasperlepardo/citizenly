'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'

export const dynamic = 'force-dynamic'

interface Resident {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  extension_name?: string
  email?: string
  mobile_number?: string
  sex: 'male' | 'female' | ''
  birthdate: string
  civil_status?: string
  occupation?: string
  job_title?: string
  profession?: string
  education_level?: string
  household_code?: string
  barangay_code: string
  status?: string
  created_at: string
  household?: {
    code: string
    street_name?: string
    house_number?: string
    subdivision?: string
  }
}

function ResidentsContent() {
  const { user, loading: authLoading, userProfile } = useAuth()
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedResidents, setSelectedResidents] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!authLoading && user && userProfile?.barangay_code) {
      loadResidents()
    }
  }, [user, authLoading, userProfile, localSearchTerm])

  const loadResidents = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('residents')
        .select(`
          *,
          household:households!residents_household_code_fkey(
            code,
            street_name,
            house_number,
            subdivision
          )
        `, { count: 'exact' })
        .eq('barangay_code', userProfile?.barangay_code)
        .order('created_at', { ascending: false })

      if (localSearchTerm.trim()) {
        query = query.or(`first_name.ilike.%${localSearchTerm}%,middle_name.ilike.%${localSearchTerm}%,last_name.ilike.%${localSearchTerm}%,email.ilike.%${localSearchTerm}%,occupation.ilike.%${localSearchTerm}%,job_title.ilike.%${localSearchTerm}%`)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      setResidents(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error loading residents:', err)
      setResidents([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedAll) {
      setSelectedResidents(new Set())
    } else {
      setSelectedResidents(new Set(residents.map(r => r.id)))
    }
    setSelectedAll(!selectedAll)
  }

  const handleSelectResident = (id: string) => {
    const newSelected = new Set(selectedResidents)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedResidents(newSelected)
    setSelectedAll(newSelected.size === residents.length && residents.length > 0)
  }

  const formatFullName = (resident: Resident) => {
    return [resident.first_name, resident.middle_name, resident.last_name, resident.extension_name].filter(Boolean).join(' ')
  }

  const formatAddress = (resident: Resident) => {
    if (!resident.household) return 'No household assigned'
    const parts = [resident.household.house_number, resident.household.street_name, resident.household.subdivision].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age.toString()
  }

  return (
    <DashboardLayout 
      currentPage="residents"
      searchTerm={globalSearchTerm}
      onSearchChange={setGlobalSearchTerm}
    >
      <div className="p-6">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-montserrat font-semibold text-xl text-neutral-900 mb-0.5">Residents</h1>
              <p className="font-montserrat font-normal text-sm text-neutral-600">
                {totalCount} total residents
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

              {/* Search Residents */}
              <div className="ml-auto mr-0">
                <div className="w-60 bg-white border border-neutral-300 rounded p-2 flex items-center gap-2">
                  <div className="w-5 h-5 text-neutral-600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search residents"
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
              <div className="flex-1 grid grid-cols-6 gap-4 p-2">
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Name</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Email</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Address</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Age</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Sex</span>
                </div>
                <div className="p-2">
                  <span className="font-montserrat font-medium text-sm text-neutral-700">Occupation</span>
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
                  <p className="mt-2 text-neutral-600">Loading residents...</p>
                </div>
              ) : residents.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-neutral-600">
                    {localSearchTerm ? `No residents found matching "${localSearchTerm}"` : 'No residents found'}
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Click "Add new resident" to register your first resident.
                  </p>
                </div>
              ) : (
                residents.map((resident) => (
                  <div key={resident.id} className="bg-white flex items-center p-0 hover:bg-neutral-50">
                    {/* Checkbox */}
                    <div className="p-2">
                      <button
                        onClick={() => handleSelectResident(resident.id)}
                        className="w-4 h-4 border border-neutral-300 rounded flex items-center justify-center"
                      >
                        {selectedResidents.has(resident.id) && (
                          <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                        )}
                      </button>
                    </div>

                    {/* Content Columns */}
                    <div className="flex-1 grid grid-cols-6 gap-4 p-2">
                      <div className="p-2">
                        <Link 
                          href={`/residents/${resident.id}`}
                          className="font-montserrat font-normal text-base text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {formatFullName(resident)}
                        </Link>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {resident.email || 'No email'}
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {formatAddress(resident)}
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {calculateAge(resident.birthdate)}
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800 capitalize">
                          {resident.sex || 'N/A'}
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="font-montserrat font-normal text-base text-neutral-800">
                          {resident.occupation || resident.job_title || 'N/A'}
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

export default function ResidentsPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <ResidentsContent />
    </ProtectedRoute>
  )
}