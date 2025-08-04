'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Household {
  code: string
  street_name?: string
  house_number?: string
  subdivision?: string
  barangay_code: string
  created_at: string
  head_resident?: {
    id: string
    first_name: string
    middle_name?: string
    last_name: string
  }
}

interface HouseholdMember {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  birthdate: string
  sex: 'male' | 'female'
  civil_status: string
  relationship_to_head?: string
  mobile_number: string
  email?: string
}

function HouseholdDetailContent() {
  const params = useParams()
  const householdCode = params.id as string
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHouseholdDetails = async () => {
      if (!householdCode) return

      try {
        setLoading(true)
        
        // Load household details with head resident info
        const { data: householdData, error: householdError } = await supabase
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
          .eq('code', householdCode)
          .single()

        if (householdError) {
          setError('Household not found')
          return
        }

        setHousehold(householdData)

        // Load all household members
        const { data: membersData, error: membersError } = await supabase
          .from('residents')
          .select('*')
          .eq('household_code', householdCode)
          .order('birthdate', { ascending: true })

        if (membersError) {
          console.error('Error loading members:', membersError)
        } else {
          setMembers(membersData || [])
        }

      } catch (err) {
        console.error('Error loading household:', err)
        setError('Failed to load household details')
      } finally {
        setLoading(false)
      }
    }

    loadHouseholdDetails()
  }, [householdCode])

  const formatFullName = (person: { first_name: string; middle_name?: string; last_name: string }) => {
    return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ')
  }

  const calculateAge = (birthdate: string) => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading household details...</p>
        </div>
      </div>
    )
  }

  if (error || !household) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Household Not Found</h1>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Link
              href="/residents"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Residents
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-neutral-300 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/residents"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-950 shadow-sm hover:bg-zinc-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Residents
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Household #{household.code}
            </h1>
            <p className="text-sm text-gray-600">
              {members.length} member{members.length !== 1 ? 's' : ''} • Created {new Date(household.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Household Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Household Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Household Number:</span>
                  <p className="text-base text-gray-900">#{household.code}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Head of Household:</span>
                  <p className="text-base text-gray-900">
                    {household.head_resident 
                      ? formatFullName(household.head_resident)
                      : 'No head assigned'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Address:</span>
                  <p className="text-base text-gray-900">
                    {[household.house_number, household.street_name, household.subdivision]
                      .filter(Boolean)
                      .join(', ') || 'No address specified'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Total Members:</span>
                  <p className="text-base text-gray-900">{members.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Household Members */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Household Members</h2>
          </div>
          
          {members.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No members found in this household.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Civil Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatFullName(member)}
                          {household.head_resident?.id === member.id && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Head
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(member.birthdate)} years old
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {member.sex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {member.civil_status.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{member.mobile_number}</div>
                        {member.email && (
                          <div className="text-xs text-gray-500">{member.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/residents/${member.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HouseholdDetailPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <HouseholdDetailContent />
    </ProtectedRoute>
  )
}