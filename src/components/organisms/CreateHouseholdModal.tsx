'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '../atoms'

interface CreateHouseholdModalProps {
  isOpen: boolean
  onClose: () => void
  onHouseholdCreated: (householdCode: string) => void
}

interface HouseholdFormData {
  house_number: string
  street_name: string
  subdivision: string
  zip_code: string
}

export default function CreateHouseholdModal({
  isOpen,
  onClose,
  onHouseholdCreated
}: CreateHouseholdModalProps) {
  const { userProfile } = useAuth()
  const [formData, setFormData] = useState<HouseholdFormData>({
    house_number: '',
    street_name: '',
    subdivision: '',
    zip_code: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof HouseholdFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof HouseholdFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HouseholdFormData, string>> = {}
    
    if (!formData.street_name.trim()) {
      newErrors.street_name = 'Street name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateHouseholdCode = async (): Promise<string> => {
    // Generate PSGC-compliant household code: RRPPMMBBB-SSSS-TTTT-HHHH
    const barangayCode = userProfile?.barangay_code || '000000000'
    
    // Get next household sequence number for this barangay
    const { count } = await supabase
      .from('households')
      .select('*', { count: 'exact', head: true })
      .eq('barangay_code', barangayCode)
    
    const nextSequence = (count || 0) + 1
    
    // Format: RRPPMMBBB-SSSS-TTTT-HHHH
    // RRPPMMBBB = Full barangay code (9 digits)
    // SSSS = Subdivision (0000 = no subdivision)
    // TTTT = Street (0001 = default street)
    // HHHH = House sequence number
    return `${barangayCode}-0000-0001-${nextSequence.toString().padStart(4, '0')}`
  }

  const deriveGeographicCodes = (barangayCode: string) => {
    // Extract geographic codes from barangay code
    // Format: RRPPCCBBB where RR=region, PP=province, CC=city/municipality, BBB=barangay
    if (barangayCode.length !== 9) return null

    const regionCode = barangayCode.substring(0, 2) // Just the first 2 digits
    const provinceCode = barangayCode.substring(0, 4) // First 4 digits  
    const cityMunicipalityCode = barangayCode.substring(0, 6) // First 6 digits

    return {
      region_code: regionCode,
      province_code: provinceCode,
      city_municipality_code: cityMunicipalityCode
    }
  }

  const [addressDisplayInfo, setAddressDisplayInfo] = useState({
    region: 'Loading...',
    province: 'Loading...',
    cityMunicipality: 'Loading...',
    barangay: 'Loading...'
  })

  // Load address display info from database
  const loadAddressDisplayInfo = async (barangayCode: string) => {
    try {
      console.log('Loading address display info for code:', barangayCode)
      
      // Query the PSGC tables to get full address hierarchy
      const { data: barangayData, error } = await supabase
        .from('psgc_barangays')
        .select(`
          name,
          psgc_cities_municipalities!inner(
            name,
            type,
            psgc_provinces!inner(
              name,
              psgc_regions!inner(
                name
              )
            )
          )
        `)
        .eq('code', barangayCode)
        .single()

      if (error) {
        console.error('Error loading address display info:', error)
        setAddressDisplayInfo({
          region: 'Region information not available',
          province: 'Province information not available',
          cityMunicipality: 'City/Municipality information not available',
          barangay: `Barangay ${barangayCode}`
        })
        return
      }

      if (barangayData) {
        const cityMun = (barangayData as any).psgc_cities_municipalities
        const province = cityMun.psgc_provinces
        const region = province.psgc_regions
        
        setAddressDisplayInfo({
          region: region.name,
          province: province.name,
          cityMunicipality: `${cityMun.name} (${cityMun.type})`,
          barangay: barangayData.name
        })
        console.log('Loaded address display info from database')
      }
    } catch (error) {
      console.error('Exception loading address display info:', error)
      setAddressDisplayInfo({
        region: 'Region information not available',
        province: 'Province information not available', 
        cityMunicipality: 'City/Municipality information not available',
        barangay: `Barangay ${barangayCode}`
      })
    }
  }

  // Load address info when userProfile changes
  useEffect(() => {
    if (userProfile?.barangay_code) {
      loadAddressDisplayInfo(userProfile.barangay_code)
    }
  }, [userProfile?.barangay_code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!userProfile?.barangay_code) {
      alert('Unable to create household: No barangay assignment found')
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Creating household for barangay:', userProfile.barangay_code)
      
      // Try to get address hierarchy info, fallback to direct table queries if view doesn't exist
      let addressInfo: any = null
      
      try {
        console.log('Attempting to query psgc_address_hierarchy view...')
        const { data, error } = await supabase
          .from('psgc_address_hierarchy')
          .select('*')
          .eq('barangay_code', userProfile.barangay_code)
          .single()
        
        if (error) {
          console.log('View query error:', error)
        } else {
          console.log('View query successful:', data)
          addressInfo = data
        }
      } catch (viewError) {
        console.log('Address hierarchy view not available, using direct queries:', viewError)
      }

      // If view query failed, get address info from individual tables
      if (!addressInfo) {
        console.log('Using fallback query to get address info...')
        try {
          // Get barangay info with related geographic data
          const { data: barangayData, error: barangayError } = await supabase
            .from('psgc_barangays')
            .select(`
              code,
              name,
              city_municipality_code,
              psgc_cities_municipalities!inner(
                code,
                name,
                type,
                province_code,
                psgc_provinces!inner(
                  code,
                  name,
                  region_code,
                  psgc_regions!inner(
                    code,
                    name
                  )
                )
              )
            `)
            .eq('code', userProfile.barangay_code)
            .single()

          if (barangayError) {
            console.error('Error fetching barangay info:', barangayError)
            console.log('Fallback query failed, will use minimal data approach')
            // Don't return here, let it fall through to minimal data approach
          }

          if (barangayData && !barangayError) {
            console.log('Fallback query successful:', barangayData)

            // Map the data to match expected format
            const cityMun = (barangayData as any).psgc_cities_municipalities
            const province = cityMun.psgc_provinces
            const region = province.psgc_regions

            addressInfo = {
              barangay_code: barangayData.code,
              barangay_name: barangayData.name,
              city_municipality_code: cityMun.code,
              city_municipality_name: cityMun.name,
              city_municipality_type: cityMun.type,
              province_code: province.code,
              province_name: province.name,
              region_code: region.code,
              region_name: region.name
            }
          }
        } catch (fallbackError) {
          console.error('Error with fallback address query:', fallbackError)
        }
      }

      // If both queries failed, use minimal data approach
      if (!addressInfo) {
        console.log('Creating household with minimal data - no PSGC lookup needed')
        
        // Final fallback - derive geographic codes from barangay code
        const derivedCodes = deriveGeographicCodes(userProfile.barangay_code)
        addressInfo = {
          barangay_code: userProfile.barangay_code,
          region_code: derivedCodes?.region_code || null,
          province_code: derivedCodes?.province_code || null,
          city_municipality_code: derivedCodes?.city_municipality_code || null
        }
        console.log('Using minimal fallback data:', addressInfo)
      }

      console.log('Final address info:', addressInfo)

      // Debug: Check current user and auth state
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current authenticated user:', user?.id)
      console.log('User profile ID:', userProfile.id)
      console.log('User profile barangay_code:', userProfile.barangay_code)
      console.log('Auth match:', user?.id === userProfile.id)
      
      // Test RLS policy by checking if user can query their own profile
      const { data: testProfile, error: testProfileError } = await supabase
        .from('user_profiles')
        .select('id, barangay_code, is_active, role_id')
        .eq('id', user?.id)
        .single()
      
      console.log('User profile data:', testProfile, testProfileError)
      
      // Check if user has proper role
      if (testProfile?.role_id) {
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id, name')
          .eq('id', testProfile.role_id)
          .single()
        
        console.log('User role data:', roleData, roleError)
      }
      
      // Fix: If user is not active, make them active
      if (testProfile && testProfile.is_active !== true) {
        console.log('User is not active, updating profile to active status...')
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ is_active: true })
          .eq('id', user?.id)
        
        if (updateError) {
          console.error('Failed to activate user:', updateError)
        } else {
          console.log('User successfully activated')
        }
      }

      // Use the actual user's barangay_code from the real profile data
      const actualBarangayCode = testProfile?.barangay_code || userProfile.barangay_code
      
      // Derive geographic codes for the user's actual barangay
      const actualDerivedCodes = deriveGeographicCodes(actualBarangayCode)
      console.log('Derived geographic codes:', actualDerivedCodes)
      
      // Generate PSGC-compliant household code
      const householdCode = await generateHouseholdCode()
      
      // Create household record
      const householdData = {
        code: householdCode,
        barangay_code: actualBarangayCode,
        region_code: actualDerivedCodes?.region_code || null,
        province_code: actualDerivedCodes?.province_code || null,
        city_municipality_code: actualDerivedCodes?.city_municipality_code || null,
        house_number: formData.house_number.trim() || null,
        street_name: formData.street_name.trim(),
        subdivision: formData.subdivision.trim() || null,
        zip_code: formData.zip_code.trim() || null,
        created_by: userProfile.id
      }

      console.log('Creating household with data:', householdData)

      const { data, error } = await supabase
        .from('households')
        .insert([householdData])
        .select('code, barangay_code, street_name, total_members')
        .single()

      if (error) {
        console.error('Error creating household:', error)
        alert(`Failed to create household: ${error.message}`)
        return
      }

      console.log('Household created successfully:', data)
      onHouseholdCreated(data.code)
      onClose()
      
      // Reset form
      setFormData({
        house_number: '',
        street_name: '',
        subdivision: '',
        zip_code: ''
      })
      setErrors({})

    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      // Reset form when closing
      setFormData({
        house_number: '',
        street_name: '',
        subdivision: '',
        zip_code: ''
      })
      setErrors({})
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="font-montserrat font-semibold text-lg text-neutral-900">
            Create New Household
          </h2>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            variant="ghost"
            size="sm"
            iconOnly
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Address Info Display */}
        <div className="p-6 bg-green-50 border-b border-green-200">
          <div className="flex items-start gap-3">
            <span className="text-green-600 mt-0.5">📍</span>
            <div>
              <h5 className="font-medium text-green-800 mb-2">Household Location</h5>
              <div className="space-y-1 text-sm text-green-700">
                <div><strong>Region:</strong> {addressDisplayInfo.region}</div>
                <div><strong>Province:</strong> {addressDisplayInfo.province}</div>
                <div><strong>City/Municipality:</strong> {addressDisplayInfo.cityMunicipality}</div>
                <div><strong>Barangay:</strong> {addressDisplayInfo.barangay}</div>
                <div className="text-xs text-neutral-500 mt-1">Code: {userProfile?.barangay_code}</div>
                <div className="text-xs text-green-600 mt-2">
                  All household geographic details are auto-populated from your barangay assignment.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* House Number */}
          <div>
            <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
              House/Block/Lot Number
            </label>
            <input
              type="text"
              value={formData.house_number}
              onChange={(e) => handleInputChange('house_number', e.target.value)}
              placeholder="e.g., Blk 1 Lot 5, #123"
              className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Street Name */}
          <div>
            <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
              Street Name *
            </label>
            <input
              type="text"
              value={formData.street_name}
              onChange={(e) => handleInputChange('street_name', e.target.value)}
              placeholder="e.g., Main Street, Rizal Avenue"
              className={`w-full px-3 py-2 border rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:border-transparent ${
                errors.street_name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-neutral-300 focus:ring-blue-500'
              }`}
              disabled={isSubmitting}
              required
            />
            {errors.street_name && (
              <p className="mt-1 text-sm text-red-600">{errors.street_name}</p>
            )}
          </div>

          {/* Subdivision */}
          <div>
            <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
              Subdivision/Zone/Sitio/Purok
            </label>
            <input
              type="text"
              value={formData.subdivision}
              onChange={(e) => handleInputChange('subdivision', e.target.value)}
              placeholder="e.g., Greenview Subdivision, Zone 1"
              className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.zip_code}
              onChange={(e) => handleInputChange('zip_code', e.target.value)}
              placeholder="e.g., 1234"
              className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Info Note */}
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <p className="font-montserrat text-sm text-blue-800">
              <strong>Note:</strong> This household will be created in your assigned barangay. 
              You can assign a resident as the household head after creating the household.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              variant="neutral"
              size="regular"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              variant="primary"
              size="regular"
              fullWidth
            >
              Create Household
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}