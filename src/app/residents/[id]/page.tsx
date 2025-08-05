'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/templates'
import { DropdownSelect } from '@/components/molecules'

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm font-medium text-inverse bg-neutral-800 rounded-lg shadow-sm tooltip bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 whitespace-nowrap">
          {content}
          <div className="tooltip-arrow absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'

interface Resident {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  extension_name?: string
  birthdate: string
  sex: 'male' | 'female'
  civil_status: string
  citizenship?: string
  mobile_number?: string
  email?: string
  education_level?: string
  education_status?: string
  employment_status?: string
  psoc_code?: string
  psoc_level?: string
  occupation_title?: string
  occupation_details?: string
  blood_type?: string
  ethnicity?: string
  religion?: string
  is_voter?: boolean
  is_resident_voter?: boolean
  voter_id_number?: string
  philsys_last4?: string
  philsys_card_number_hash?: string
  is_labor_force?: boolean
  is_employed?: boolean
  is_unemployed?: boolean
  is_ofw?: boolean
  is_pwd?: boolean
  is_out_of_school_children?: boolean
  is_out_of_school_youth?: boolean
  is_senior_citizen?: boolean
  is_registered_senior_citizen?: boolean
  is_solo_parent?: boolean
  is_indigenous_people?: boolean
  is_migrant?: boolean
  household_id?: string
  household_code?: string
  barangay_code: string
  is_active?: boolean
  created_at: string
  updated_at?: string
  created_by?: string
  search_text?: string
  // Related data
  household?: {
    id?: string
    household_number?: string
    code: string
    street_name?: string
    house_number?: string
    subdivision?: string
    zip_code?: string
    barangay_code: string
    region_code?: string
    province_code?: string
    city_municipality_code?: string
    total_members?: number
    created_at?: string
    updated_at?: string
    head_resident?: {
      id: string
      first_name: string
      middle_name?: string
      last_name: string
    }
  }
  psoc_info?: {
    code: string
    title: string
    level: string
  }
  address_info?: {
    barangay_name: string
    city_municipality_name: string
    province_name?: string
    region_name: string
    full_address: string
  }
}

function ResidentDetailContent() {
  const params = useParams()
  const residentId = params.id as string
  const [resident, setResident] = useState<Resident | null>(null)
  const [editedResident, setEditedResident] = useState<Resident | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const loadResidentDetails = async () => {
      if (!residentId) return

      try {
        setLoading(true)
        
        console.log('Loading resident with ID:', residentId)
        
        // First, let's check if we can access the residents table at all
        const { data: allResidents, error: listError } = await supabase
          .from('residents')
          .select('id, first_name, last_name')
          .limit(5)
        
        console.log('Sample residents in database:', allResidents)
        console.log('List error:', listError)
        
        // Load resident details first without relationships
        const { data: residentData, error: residentError } = await supabase
          .from('residents')
          .select('*')
          .eq('id', residentId)
          .single()
        
        console.log('Query result:', { residentData, residentError })

        if (residentError) {
          console.error('Resident error details:', residentError)
          if (residentError.code === 'PGRST116') {
            setError(`Resident with ID "${residentId}" not found`)
          } else {
            setError(`Database error: ${residentError.message || 'Failed to load resident details'}`)
          }
          return
        }

        if (!residentData) {
          setError('No data returned for resident')
          return
        }

        console.log('Resident data loaded:', residentData)

        // Load address information for the resident's barangay
        try {
          console.log('Loading address for barangay code:', residentData.barangay_code)
          
          // Try to use the address hierarchy view first (if it exists)
          const { data: addressViewData, error: viewError } = await supabase
            .from('psgc_address_hierarchy')
            .select('barangay_name, city_municipality_name, province_name, region_name, full_address')
            .eq('barangay_code', residentData.barangay_code)
            .single()
          
          if (addressViewData && !viewError) {
            residentData.address_info = {
              barangay_name: addressViewData.barangay_name,
              city_municipality_name: addressViewData.city_municipality_name,
              province_name: addressViewData.province_name,
              region_name: addressViewData.region_name,
              full_address: addressViewData.full_address
            }
          } else {
            // Fallback: Try individual table queries
            console.log('Address view not available, trying individual tables')
            
            const { data: barangayData, error: barangayError } = await supabase
              .from('psgc_barangays')
              .select('name, city_municipality_code')
              .eq('code', residentData.barangay_code)
              .single()
            
            console.log('Barangay query result:', { barangayData, barangayError })
            
            if (barangayData && !barangayError) {
              // Initialize with barangay data only - no fallback values
              residentData.address_info = {
                barangay_name: barangayData.name,
                city_municipality_name: undefined,
                province_name: undefined,
                region_name: undefined,
                full_address: barangayData.name
              }
              
              // Try to get city info and trace back to region
              const { data: cityData } = await supabase
                .from('psgc_cities_municipalities')
                .select('name, province_code, is_independent')
                .eq('code', barangayData.city_municipality_code)
                .single()
              
              if (cityData) {
                residentData.address_info.city_municipality_name = cityData.name
                residentData.address_info.full_address = `${barangayData.name}, ${cityData.name}`
                
                // Try to get province and region info
                if (!cityData.is_independent && cityData.province_code) {
                  const { data: provinceData } = await supabase
                    .from('psgc_provinces')
                    .select('name, region_code')
                    .eq('code', cityData.province_code)
                    .single()
                  
                  if (provinceData) {
                    residentData.address_info.province_name = provinceData.name
                    
                    // Get region name
                    const { data: regionData } = await supabase
                      .from('psgc_regions')
                      .select('name')
                      .eq('code', provinceData.region_code)
                      .single()
                    
                    if (regionData) {
                      residentData.address_info.region_name = regionData.name
                    }
                    // No fallback mapping - only use actual database data
                  }
                }
                // No assumptions for independent cities - only use database data
              }
            }
            // No fallback creation - if no barangay data, leave address_info undefined
          }
        } catch (addressError) {
          console.warn('Address data not available:', addressError)
          // No fallback data - leave address_info undefined if query fails
        }

        // Try to load household information if resident has household_code or household_id
        console.log('Checking household links:', { 
          household_code: residentData.household_code, 
          household_id: residentData.household_id 
        })
        
        if (residentData.household_code || residentData.household_id) {
          try {
            // Query by household_code or household_id directly
            console.log('Attempting to query household with code:', residentData.household_code)
            let householdQuery = supabase
              .from('households')
              .select('*')
            
            if (residentData.household_code) {
              householdQuery = householdQuery.eq('code', residentData.household_code)
            } else if (residentData.household_id) {
              householdQuery = householdQuery.eq('id', residentData.household_id)
            }
            
            const { data: householdData, error: householdError } = await householdQuery.single()
            
            console.log('Household query result:', { householdData, householdError })
            console.log('Household error details:', householdError)
            
            if (householdData && !householdError) {
              residentData.household = householdData

              // Load household head information if available
              if (householdData.household_head_id) {
                const { data: headData } = await supabase
                  .from('residents')
                  .select('id, first_name, middle_name, last_name')
                  .eq('id', householdData.household_head_id)
                  .single()
                
                if (headData) {
                  residentData.household.head_resident = headData
                }
              }
            }
          } catch (householdError) {
            console.warn('Household data not available:', householdError)
          }
        } else {
          console.log('No household_code or household_id found for resident')
        }

        // Try to load PSOC information if available
        if (residentData.psoc_code) {
          try {
            const { data: psocData } = await supabase
              .from('psoc_codes')
              .select('code, title, level')
              .eq('code', residentData.psoc_code)
              .single()
            
            if (psocData) {
              residentData.psoc_info = psocData
            }
          } catch (psocError) {
            console.warn('PSOC data not available:', psocError)
          }
        }

        setResident(residentData)
        setEditedResident(updateComputedFields({ ...residentData }))

      } catch (err) {
        console.error('Error loading resident:', err)
        setError('Failed to load resident details')
      } finally {
        setLoading(false)
      }
    }

    loadResidentDetails()
  }, [residentId])

  const formatFullName = (person: { first_name: string; middle_name?: string; last_name: string; extension_name?: string }) => {
    return [person.first_name, person.middle_name, person.last_name, person.extension_name].filter(Boolean).join(' ')
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

  const formatAddress = (household?: Resident['household']) => {
    if (!household) return 'No household assigned'
    const parts = [household.house_number, household.street_name, household.subdivision].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  const formatEnumValue = (value: string | undefined) => {
    if (!value) return 'N/A'
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatBoolean = (value: boolean | undefined) => {
    if (value === undefined || value === null) return 'N/A'
    return value ? 'Yes' : 'No'
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSaveError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedResident(resident) // Reset to original data
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!editedResident) return
    
    try {
      setIsSaving(true)
      setSaveError(null)
      
      const { error: updateError } = await supabase
        .from('residents')
        .update({
          first_name: editedResident.first_name,
          middle_name: editedResident.middle_name,
          last_name: editedResident.last_name,
          extension_name: editedResident.extension_name,
          birthdate: editedResident.birthdate,
          sex: editedResident.sex,
          civil_status: editedResident.civil_status,
          citizenship: editedResident.citizenship,
          mobile_number: editedResident.mobile_number,
          email: editedResident.email,
          education_level: editedResident.education_level,
          education_status: editedResident.education_status,
          employment_status: editedResident.employment_status,
          occupation_title: editedResident.occupation_title,
          occupation_details: editedResident.occupation_details,
          blood_type: editedResident.blood_type,
          ethnicity: editedResident.ethnicity,
          religion: editedResident.religion,
          is_voter: editedResident.is_voter,
          is_resident_voter: editedResident.is_resident_voter,
          voter_id_number: editedResident.voter_id_number,
          is_ofw: editedResident.is_ofw,
          is_pwd: editedResident.is_pwd,
          is_solo_parent: editedResident.is_solo_parent,
          is_indigenous_people: editedResident.is_indigenous_people,
          is_migrant: editedResident.is_migrant,
          updated_at: new Date().toISOString()
        })
        .eq('id', residentId)
      
      if (updateError) {
        throw updateError
      }
      
      setResident(editedResident)
      setIsEditing(false)
      
    } catch (err) {
      console.error('Error saving resident:', err)
      setSaveError('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateComputedFields = (updatedResident: Resident) => {
    // Update employment-related flags based on employment_status
    const employmentStatus = updatedResident.employment_status
    
    updatedResident.is_employed = ['employed', 'self_employed'].includes(employmentStatus || '')
    updatedResident.is_unemployed = employmentStatus === 'unemployed'
    updatedResident.is_labor_force = ['employed', 'unemployed', 'underemployed', 'self_employed', 'looking_for_work'].includes(employmentStatus || '')
    
    // Update senior citizen flag based on birthdate
    if (updatedResident.birthdate) {
      const age = new Date().getFullYear() - new Date(updatedResident.birthdate).getFullYear()
      updatedResident.is_senior_citizen = age >= 60
    }
    
    return updatedResident
  }

  const handleFieldChange = (field: keyof Resident, value: any) => {
    if (!editedResident) return
    
    let updatedResident = {
      ...editedResident,
      [field]: value
    }
    
    // Update computed fields when employment status or birthdate changes
    if (field === 'employment_status' || field === 'birthdate') {
      updatedResident = updateComputedFields(updatedResident)
    }
    
    setEditedResident(updatedResident)
  }

  const getComputedFieldTooltip = (field: keyof Resident) => {
    switch (field) {
      case 'is_labor_force':
        return `Automatically calculated from Employment Status. Includes: employed, unemployed, underemployed, self-employed, looking for work`
      case 'is_employed':
        return `Automatically calculated from Employment Status. Includes: employed, self-employed`
      case 'is_unemployed':
        return `Automatically calculated from Employment Status. Only when status is 'unemployed'`
      case 'is_senior_citizen':
        return `Automatically calculated from Date of Birth. Senior citizen when age is 60 or above`
      default:
        return 'This field is automatically calculated'
    }
  }

  const renderEditableField = (label: string, field: keyof Resident, type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'checkbox' = 'text', options?: string[], isComputed = false) => {
    const currentResident = isEditing ? editedResident : resident
    if (!currentResident) return null
    
    const value = currentResident[field] as string | boolean | undefined
    
    if (isEditing && !isComputed) {
      if (type === 'checkbox') {
        return (
          <div>
            <dt className="text-sm font-medium text-secondary">{label}</dt>
            <dd className="mt-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleFieldChange(field, e.target.checked)}
                  className="rounded border-default text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-primary">{value ? 'Yes' : 'No'}</span>
              </label>
            </dd>
          </div>
        )
      }
      
      if (type === 'select' && options) {
        return (
          <div>
            <dt className="text-sm font-medium text-secondary">{label}</dt>
            <dd className="mt-1">
              <DropdownSelect
                options={[
                  { value: '', label: 'Select...' },
                  ...options.map(option => ({ value: option, label: formatEnumValue(option) }))
                ]}
                value={(value as string) || ''}
                onChange={(val) => handleFieldChange(field, val)}
                size="sm"
              />
            </dd>
          </div>
        )
      }
      
      return (
        <div>
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1">
            <input
              type={type}
              value={(value as string) || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="block w-full rounded-md border-default shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-surface text-primary"
            />
          </dd>
        </div>
      )
    }
    
    // Display mode
    if (type === 'checkbox') {
      return (
        <div className="flex justify-between items-center">
          <dt className={`text-sm font-medium ${isComputed ? 'text-muted' : 'text-secondary'}`}>
            {label}
            {isComputed && (
              <Tooltip content={getComputedFieldTooltip(field)}>
                <span className="ml-1 text-xs text-blue-600 underline cursor-help">(auto)</span>
              </Tooltip>
            )}
          </dt>
          <dd className={`text-sm font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
            {formatBoolean(value as boolean)}
          </dd>
        </div>
      )
    }
    
    if (type === 'date') {
      return (
        <div>
          <dt className="text-sm font-medium text-secondary">{label}</dt>
          <dd className="mt-1 text-sm text-primary">
            {value ? (
              `${new Date(value as string).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} (${calculateAge(value as string)} y/o)`
            ) : 'N/A'}
          </dd>
        </div>
      )
    }
    
    return (
      <div>
        <dt className="text-sm font-medium text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-primary">{formatEnumValue(value as string)}</dd>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout 
          searchTerm={globalSearchTerm}
        onSearchChange={setGlobalSearchTerm}
      >
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-secondary">Loading resident details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !resident) {
    return (
      <DashboardLayout 
          searchTerm={globalSearchTerm}
        onSearchChange={setGlobalSearchTerm}
      >
        <div className="p-6">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-surface rounded-lg shadow-md border border-default p-6">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="font-montserrat font-semibold text-lg text-primary mb-2">Resident Not Found</h1>
              <p className="font-montserrat text-secondary text-sm mb-4">{error}</p>
              <Link
                href="/residents"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary border border-default rounded-md hover:bg-surface-hover"
              >
                Back to Residents
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      searchTerm={globalSearchTerm}
      onSearchChange={setGlobalSearchTerm}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-surface shadow-sm border-b border-default -mx-6 px-6 py-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/residents"
                className="inline-flex items-center px-3 py-2 border border-default shadow-sm text-sm font-medium rounded-md text-secondary bg-surface hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Residents
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">{formatFullName(resident)}</h1>
                  <p className="text-sm text-secondary">
                    {calculateAge(resident.birthdate)} years old • Member since {new Date(resident.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              resident.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                resident.is_active ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {resident.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Personal Information</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {renderEditableField('First Name', 'first_name', 'text')}
                  {renderEditableField('Middle Name', 'middle_name', 'text')}
                  {renderEditableField('Last Name', 'last_name', 'text')}
                  {renderEditableField('Extension Name', 'extension_name', 'text')}
                  {renderEditableField('Date of Birth', 'birthdate', 'date')}
                  {renderEditableField('Sex', 'sex', 'select', ['male', 'female'])}
                  {renderEditableField('Civil Status', 'civil_status', 'select', ['single', 'married', 'widowed', 'divorced', 'separated', 'annulled', 'registered_partnership', 'live_in'])}
                  {renderEditableField('Citizenship', 'citizenship', 'select', ['filipino', 'dual_citizen', 'foreign_national'])}
                  {renderEditableField('Mobile Number', 'mobile_number', 'tel')}
                  {renderEditableField('Email Address', 'email', 'email')}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-secondary">Address</dt>
                    <dd className="mt-1 text-sm text-primary">
                      {resident.household ? (
                        <div>
                          <Link 
                            href={`/households/${resident.household.code}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            <div className="font-medium">
                              {[
                                formatAddress(resident.household),
                                resident.address_info?.barangay_name,
                                resident.address_info?.city_municipality_name && (
                                  resident.address_info.city_municipality_name + 
                                  (resident.address_info.province_name ? `, ${resident.address_info.province_name}` : '')
                                ),
                                resident.address_info?.region_name
                              ].filter(Boolean).join(', ')}
                            </div>
                          </Link>
                        </div>
                      ) : (
                        <div>
                          <div className="text-secondary">
                            {resident.address_info ? (
                              [
                                'No household assigned',
                                resident.address_info.barangay_name,
                                resident.address_info.city_municipality_name && (
                                  resident.address_info.city_municipality_name + 
                                  (resident.address_info.province_name ? `, ${resident.address_info.province_name}` : '')
                                ),
                                resident.address_info.region_name
                              ].filter(Boolean).join(', ')
                            ) : (
                              `No household assigned, Barangay Code: ${resident.barangay_code}`
                            )}
                          </div>
                        </div>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Education & Employment Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Education & Employment</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {renderEditableField('Education Level', 'education_level', 'select', ['no_formal_education', 'elementary', 'high_school', 'college', 'post_graduate', 'vocational', 'graduate', 'undergraduate'])}
                  {renderEditableField('Education Status', 'education_status', 'select', ['currently_studying', 'not_studying', 'graduated', 'dropped_out'])}
                  {renderEditableField('Employment Status', 'employment_status', 'select', ['employed', 'unemployed', 'underemployed', 'self_employed', 'student', 'retired', 'homemaker', 'unable_to_work', 'looking_for_work', 'not_in_labor_force'])}
                  {renderEditableField('Occupation Title', 'occupation_title', 'text')}
                  {resident.psoc_code && (
                    <div>
                      <dt className="text-sm font-medium text-secondary">PSOC Code</dt>
                      <dd className="mt-1 text-sm text-primary font-mono">{resident.psoc_code}</dd>
                    </div>
                  )}
                  {resident.psoc_level && (
                    <div>
                      <dt className="text-sm font-medium text-secondary">PSOC Level</dt>
                      <dd className="mt-1 text-sm text-primary">{formatEnumValue(resident.psoc_level)}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    {renderEditableField('Occupation Details', 'occupation_details', 'text')}
                  </div>
                </dl>
              </div>
            </div>

            {/* Household Information Card */}
            {resident.household && (
              <div className="bg-surface shadow rounded-lg border border-default">
                <div className="px-6 py-4 border-b border-default">
                  <h3 className="text-lg font-medium text-primary">Household Information</h3>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-secondary">Household Code</dt>
                      <dd className="mt-1">
                        <Link 
                          href={`/households/${resident.household.code}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          #{resident.household.code}
                        </Link>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary">Address</dt>
                      <dd className="mt-1 text-sm text-primary">
                        <Link 
                          href={`/households/${resident.household.code}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <div className="font-medium">
                            {[
                              formatAddress(resident.household),
                              resident.address_info?.barangay_name,
                              resident.address_info?.city_municipality_name && (
                                resident.address_info.city_municipality_name + 
                                (resident.address_info.province_name ? `, ${resident.address_info.province_name}` : '')
                              ),
                              resident.address_info?.region_name
                            ].filter(Boolean).join(', ')}
                          </div>
                        </Link>
                      </dd>
                    </div>
                    {resident.household.household_number && (
                      <div>
                        <dt className="text-sm font-medium text-secondary">Household Number</dt>
                        <dd className="mt-1 text-sm text-primary font-mono">{resident.household.household_number}</dd>
                      </div>
                    )}
                    {resident.household.zip_code && (
                      <div>
                        <dt className="text-sm font-medium text-secondary">ZIP Code</dt>
                        <dd className="mt-1 text-sm text-primary font-mono">{resident.household.zip_code}</dd>
                      </div>
                    )}
                    {resident.household.total_members && (
                      <div>
                        <dt className="text-sm font-medium text-secondary">Total Members</dt>
                        <dd className="mt-1 text-sm text-primary">{resident.household.total_members}</dd>
                      </div>
                    )}
                    {resident.household.head_resident && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-secondary">Household Head</dt>
                        <dd className="mt-1 text-sm text-primary">
                          {formatFullName(resident.household.head_resident)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Side Information */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Quick Actions</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-full bg-neutral-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    {saveError && (
                      <div className="text-red-600 text-sm text-center mt-2">
                        {saveError}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleEdit}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit Information
                    </button>
                    <button className="w-full bg-surface border border-default text-secondary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Generate Certificate
                    </button>
                    <button className="w-full bg-surface border border-default text-secondary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Export Data
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Classifications Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Classifications</h3>
                <p className="text-xs text-muted mt-1">Fields marked with <span className="text-blue-600 underline">(auto)</span> are calculated automatically. Hover for details.</p>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  {renderEditableField('Registered Voter', 'is_voter', 'checkbox')}
                  {renderEditableField('Resident Voter', 'is_resident_voter', 'checkbox')}
                  {renderEditableField('Labor Force', 'is_labor_force', 'checkbox', undefined, true)}
                  {renderEditableField('Employed', 'is_employed', 'checkbox', undefined, true)}
                  {renderEditableField('Unemployed', 'is_unemployed', 'checkbox', undefined, true)}
                  {renderEditableField('Senior Citizen', 'is_senior_citizen', 'checkbox', undefined, true)}
                  {renderEditableField('Registered Senior Citizen', 'is_registered_senior_citizen', 'checkbox')}
                  {renderEditableField('PWD', 'is_pwd', 'checkbox')}
                  {renderEditableField('Solo Parent', 'is_solo_parent', 'checkbox')}
                  {renderEditableField('OFW', 'is_ofw', 'checkbox')}
                  {renderEditableField('Indigenous People', 'is_indigenous_people', 'checkbox')}
                  {renderEditableField('Migrant', 'is_migrant', 'checkbox')}
                  {renderEditableField('Out of School Children', 'is_out_of_school_children', 'checkbox')}
                  {renderEditableField('Out of School Youth', 'is_out_of_school_youth', 'checkbox')}
                </dl>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">Additional Information</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  {renderEditableField('Blood Type', 'blood_type', 'select', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])}
                  {renderEditableField('Religion', 'religion', 'select', ['roman_catholic', 'protestant', 'iglesia_ni_cristo', 'islam', 'buddhism', 'judaism', 'hinduism', 'indigenous_beliefs', 'other', 'none'])}
                  {renderEditableField('Ethnicity', 'ethnicity', 'select', ['tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bicolano', 'waray', 'kapampangan', 'pangasinan', 'maranao', 'maguindanao', 'tausug', 'indigenous_group', 'mixed_heritage', 'other', 'not_reported'])}
                  {renderEditableField('Voter ID Number', 'voter_id_number', 'text')}
                  {resident.philsys_last4 && (
                    <div>
                      <dt className="text-sm font-medium text-secondary">PhilSys ID</dt>
                      <dd className="mt-1 text-sm text-primary font-mono">****-****-****-{resident.philsys_last4}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* System Information Card */}
            <div className="bg-surface shadow rounded-lg border border-default">
              <div className="px-6 py-4 border-b border-default">
                <h3 className="text-lg font-medium text-primary">System Information</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-secondary">Record ID</dt>
                    <dd className="mt-1 text-xs text-primary font-mono">{resident.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-secondary">Created Date</dt>
                    <dd className="mt-1 text-sm text-primary">
                      {new Date(resident.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                  {resident.updated_at && (
                    <div>
                      <dt className="text-sm font-medium text-secondary">Last Updated</dt>
                      <dd className="mt-1 text-sm text-primary">
                        {new Date(resident.updated_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  )}
                  {resident.household_id && (
                    <div>
                      <dt className="text-sm font-medium text-secondary">Household ID</dt>
                      <dd className="mt-1 text-xs text-primary font-mono">{resident.household_id}</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-secondary">Active Status</dt>
                    <dd className={`text-sm font-medium ${
                      resident.is_active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatBoolean(resident.is_active)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function ResidentDetailPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <ResidentDetailContent />
    </ProtectedRoute>
  )
}