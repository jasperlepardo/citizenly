'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PSOCSelector from '@/components/ui/PSOCSelector'
import HouseholdSelector from '@/components/ui/HouseholdSelector'
import { useUserBarangay } from '@/hooks/useUserBarangay'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const dynamic = 'force-dynamic'

interface ResidentFormData {
  // Personal Information
  firstName: string
  middleName: string
  lastName: string
  extensionName: string
  birthdate: string
  sex: 'male' | 'female' | ''
  civilStatus: string
  citizenship: string
  
  // Education & Employment
  educationLevel: string
  educationStatus: string
  psocCode: string
  psocLevel: string
  positionTitleId: string
  occupationDescription: string
  employmentStatus: string
  workplace: string
  
  // Contact & Documentation
  email: string
  mobileNumber: string
  telephoneNumber: string
  philsysCardNumber: string
  
  // Physical & Identity Information
  bloodType: string
  height: string
  weight: string
  complexion: string
  ethnicity: string
  religion: string
  
  // Voting Information
  voterRegistrationStatus: boolean
  residentVoterStatus: boolean
  lastVotedYear: string
  
  // Family Information
  motherMaidenFirstName: string
  motherMaidenMiddleName: string
  motherMaidenLastName: string
  
  // Address Information (PSGC Codes) - auto-populated from user profile
  regionCode: string
  provinceCode: string
  cityMunicipalityCode: string
  barangayCode: string
  
  // Household Assignment
  householdCode: string
  householdRole: 'Head' | 'Member'
}

function CreateResidentForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Partial<Record<keyof ResidentFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ResidentFormData>({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    birthdate: '',
    sex: '',
    civilStatus: '',
    citizenship: 'filipino',
    
    // Education & Employment
    educationLevel: '',
    educationStatus: '',
    psocCode: '',
    psocLevel: '',
    positionTitleId: '',
    occupationDescription: '',
    employmentStatus: '',
    workplace: '',
    
    // Contact & Documentation
    email: '',
    mobileNumber: '',
    telephoneNumber: '',
    philsysCardNumber: '',
    
    // Physical & Identity Information
    bloodType: '',
    height: '',
    weight: '',
    complexion: '',
    ethnicity: '',
    religion: '',
    
    // Voting Information
    voterRegistrationStatus: false,
    residentVoterStatus: false,
    lastVotedYear: '',
    
    // Family Information
    motherMaidenFirstName: '',
    motherMaidenMiddleName: '',
    motherMaidenLastName: '',
    
    // Address Information (PSGC Codes)
    regionCode: '',
    provinceCode: '',
    cityMunicipalityCode: '',
    barangayCode: '',
    
    // Household Assignment
    householdCode: '',
    householdRole: 'Member'
  })

  // User's assigned barangay address (auto-populated)
  const { barangayCode, address: userAddress, loading: loadingAddress, error: addressError } = useUserBarangay()

  // Auto-populate form data when user address is loaded
  React.useEffect(() => {
    if (userAddress && barangayCode) {
      setFormData(prev => ({
        ...prev,
        regionCode: userAddress.region_code,
        provinceCode: userAddress.province_code || '',
        cityMunicipalityCode: userAddress.city_municipality_code,
        barangayCode: userAddress.barangay_code
      }))
    }
  }, [userAddress, barangayCode])

  // Error component
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <p className="mt-2 text-sm/6 text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    )
  }

  // Step error summary component
  const StepErrorSummary = ({ step }: { step: number }) => {
    const stepFieldsMap: Record<number, string[]> = {
      1: ['firstName', 'lastName', 'birthdate', 'sex', 'civilStatus', 'citizenship'],
      2: ['educationLevel', 'educationStatus'],
      3: ['mobileNumber', 'email'],
      4: ['street']
    }

    const stepFields = stepFieldsMap[step] || []
    const stepErrors = stepFields
      .map(field => errors[field as keyof ResidentFormData])
      .filter(Boolean)

    if (stepErrors.length === 0) return null

    return (
      <div className="rounded-lg bg-red-50 p-4 ring-1 ring-red-900/10 dark:bg-red-400/10 dark:ring-red-400/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Please fix the following errors:
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <ul className="list-disc pl-5 space-y-1">
                {stepErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic details and identification' },
    { id: 2, title: 'Education & Employment', description: 'Academic and work information' },
    { id: 3, title: 'Contact & Physical', description: 'Contact details and physical attributes' },
    { id: 4, title: 'Address & Household', description: 'Location and household assignment' },
    { id: 5, title: 'Review & Submit', description: 'Confirm all information' }
  ]

  // Database enum mappings - UI display values to database values
  const civilStatusOptions = [
    { display: 'Single', value: 'single' },
    { display: 'Married', value: 'married' },
    { display: 'Widowed', value: 'widowed' },
    { display: 'Divorced', value: 'divorced' },
    { display: 'Separated', value: 'separated' },
    { display: 'Annulled', value: 'annulled' },
    { display: 'Registered Partnership', value: 'registered_partnership' },
    { display: 'Live-in', value: 'live_in' }
  ]

  const educationLevelOptions = [
    { display: 'No Formal Education', value: 'no_formal_education' },
    { display: 'Elementary', value: 'elementary' },
    { display: 'High School', value: 'high_school' },
    { display: 'College', value: 'college' },
    { display: 'Post-Graduate', value: 'post_graduate' },
    { display: 'Vocational', value: 'vocational' },
    { display: 'Graduate', value: 'graduate' },
    { display: 'Undergraduate', value: 'undergraduate' }
  ]

  const educationStatusOptions = [
    { display: 'Currently Studying', value: 'currently_studying' },
    { display: 'Not Studying', value: 'not_studying' },
    { display: 'Graduated', value: 'graduated' },
    { display: 'Dropped Out', value: 'dropped_out' }
  ]

  const employmentStatusOptions = [
    { display: 'Employed', value: 'employed' },
    { display: 'Unemployed', value: 'unemployed' },
    { display: 'Underemployed', value: 'underemployed' },
    { display: 'Self-Employed', value: 'self_employed' },
    { display: 'Student', value: 'student' },
    { display: 'Retired', value: 'retired' },
    { display: 'Homemaker', value: 'homemaker' },
    { display: 'Unable to Work', value: 'unable_to_work' },
    { display: 'Looking for Work', value: 'looking_for_work' },
    { display: 'Not in Labor Force', value: 'not_in_labor_force' }
  ]

  const bloodTypeOptions = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'
  ]

  const ethnicityOptions = [
    { display: 'Tagalog', value: 'tagalog' },
    { display: 'Cebuano', value: 'cebuano' },
    { display: 'Ilocano', value: 'ilocano' },
    { display: 'Bisaya/Visaya', value: 'bisaya_visaya' },
    { display: 'Hiligaynon', value: 'hiligaynon' },
    { display: 'Bicolano', value: 'bikol' },
    { display: 'Waray', value: 'waray' },
    { display: 'Kapampangan', value: 'kapampangan' },
    { display: 'Indigenous', value: 'other_indigenous' },
    { display: 'Mixed Heritage', value: 'other' }
  ]

  const religionOptions = [
    { display: 'Roman Catholic', value: 'roman_catholic' },
    { display: 'Protestant', value: 'protestant' },
    { display: 'Islam', value: 'islam' },
    { display: 'Iglesia ni Cristo', value: 'iglesia_ni_cristo' },
    { display: 'Buddhist', value: 'buddhism' },
    { display: 'Indigenous beliefs', value: 'indigenous_beliefs' },
    { display: 'Others', value: 'others' }
  ]

  const citizenshipOptions = [
    { display: 'Filipino', value: 'filipino' },
    { display: 'Dual Citizen', value: 'dual_citizen' },
    { display: 'Foreign National', value: 'foreign_national' }
  ]

  const handleInputChange = (field: keyof ResidentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }


  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof ResidentFormData, string>> = {}
    
    try {
      if (step === 1) {
        // Step 1: Personal Information
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.birthdate) newErrors.birthdate = 'Birth date is required'
        if (!formData.sex) newErrors.sex = 'Sex is required'
        if (!formData.civilStatus) newErrors.civilStatus = 'Civil status is required'
        if (!formData.citizenship) newErrors.citizenship = 'Citizenship is required'
      }
      
      if (step === 2) {
        // Step 2: Education Information
        if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required'
        if (!formData.educationStatus) newErrors.educationStatus = 'Education status is required'
      }
      
      if (step === 3) {
        // Step 3: Contact Information
        if (!formData.mobileNumber?.trim()) newErrors.mobileNumber = 'Mobile number is required'
        if (formData.mobileNumber && !/^09\d{9}$/.test(formData.mobileNumber)) {
          newErrors.mobileNumber = 'Please enter a valid mobile number (09XXXXXXXXX)'
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address'
        }
      }
      
      if (step === 4) {
        // Step 4: Address & Household Information
        // Only household assignment is required, no address fields
        // Household ID is optional, so no validation needed
      }
      
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Validate all steps before submitting
    const allStepsValid = [1, 2, 3, 4].every(step => validateStep(step))
    
    if (!allStepsValid) {
      alert('Please fill in all required fields correctly')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Convert form data to match database schema
      // Geographic hierarchy is auto-populated from user's barangay assignment
      console.log('Creating resident with household assignment:', formData.householdCode)
      
      const residentData = {
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        extension_name: formData.extensionName || null,
        birthdate: formData.birthdate,
        sex: formData.sex as 'male' | 'female',
        civil_status: formData.civilStatus as any,
        citizenship: formData.citizenship as any,
        education_level: formData.educationLevel as any,
        education_status: formData.educationStatus as any,
        psoc_code: formData.psocCode || null,
        psoc_level: formData.psocLevel || null,
        occupation_title: formData.occupationDescription || null,
        employment_status: (formData.employmentStatus as any) || 'not_in_labor_force',
        mobile_number: formData.mobileNumber,
        email: formData.email || null,
        // For PhilSys card number - create a proper hash as BYTEA expects
        philsys_card_number_hash: formData.philsysCardNumber ? new TextEncoder().encode(formData.philsysCardNumber) : null,
        philsys_last4: formData.philsysCardNumber ? formData.philsysCardNumber.slice(-4) : null,
        // Physical information
        blood_type: (formData.bloodType as any) || 'unknown',
        ethnicity: (formData.ethnicity as any) || 'not_reported', 
        religion: (formData.religion as any) || 'other',
        // Voting information
        is_voter: formData.voterRegistrationStatus,
        is_resident_voter: formData.residentVoterStatus,
        // Geographic hierarchy - auto-populated from user's assigned barangay
        region_code: userAddress?.region_code || null,
        province_code: userAddress?.province_code || null,
        city_municipality_code: userAddress?.city_municipality_code || null,
        barangay_code: barangayCode || null,
        // Household assignment
        household_code: formData.householdCode || null,
        // Address details will be populated from household assignment
        street_name: null,
        house_number: null,
        subdivision: null,
      }

      const { data, error } = await supabase
        .from('residents')
        .insert([residentData])
        .select()

      if (error) {
        console.error('Error creating resident:', error)
        alert(`Failed to create resident: ${error.message}`)
        return
      }

      console.log('Resident created successfully:', data)
      
      // If this resident is assigned as household head, update the household
      if (formData.householdRole === 'Head' && formData.householdCode && data?.[0]?.id) {
        console.log('Updating household head assignment...')
        const { error: householdUpdateError } = await supabase
          .from('households')
          .update({ household_head_id: data[0].id })
          .eq('code', formData.householdCode)
        
        if (householdUpdateError) {
          console.error('Error updating household head:', householdUpdateError)
          alert(`Resident created but failed to assign as household head: ${householdUpdateError.message}`)
        } else {
          console.log('Household head updated successfully')
        }
      }
      
      alert('Resident created successfully!')
      
      // Navigate to residents list using Next.js router
      router.push('/residents')
      
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                Personal Information
              </h3>
              <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
                Basic details and identification information.
              </p>
            </div>
            
            <StepErrorSummary step={1} />
            
            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  First Name *
                </label>
                <div className="mt-2">
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset placeholder:text-zinc-500 focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-400 ${
                      errors.firstName 
                        ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                        : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                    }`}
                    placeholder="Enter first name"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  <FieldError error={errors.firstName} />
                </div>
              </div>
              
              <div>
                <label htmlFor="middleName" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Middle Name
                </label>
                <div className="mt-2">
                  <input
                    id="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    className="block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset ring-zinc-950/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-zinc-950 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-zinc-400 dark:focus:ring-white"
                    placeholder="Enter middle name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Last Name *
                </label>
                <div className="mt-2">
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset placeholder:text-zinc-500 focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-400 ${
                      errors.lastName 
                        ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                        : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                    }`}
                    placeholder="Enter last name"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                  />
                  <FieldError error={errors.lastName} />
                </div>
              </div>
              
              <div>
                <label htmlFor="extensionName" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Extension Name
                </label>
                <div className="mt-2">
                  <input
                    id="extensionName"
                    type="text"
                    value={formData.extensionName}
                    onChange={(e) => handleInputChange('extensionName', e.target.value)}
                    className="block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset ring-zinc-950/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-zinc-950 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-zinc-400 dark:focus:ring-white"
                    placeholder="Jr., Sr., III, etc."
                  />
                </div>
              </div>
            </div>

            {/* Birth Date and Basic Info */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
              <div>
                <label htmlFor="birthdate" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Birth Date *
                </label>
                <div className="mt-2">
                  <input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => handleInputChange('birthdate', e.target.value)}
                    required
                    className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset placeholder:text-zinc-500 focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-400 ${
                      errors.birthdate 
                        ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                        : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                    }`}
                    aria-invalid={errors.birthdate ? 'true' : 'false'}
                  />
                  <FieldError error={errors.birthdate} />
                </div>
              </div>
              
              <div>
                <label htmlFor="sex" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Sex *
                </label>
                <div className="mt-2">
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) => handleInputChange('sex', e.target.value)}
                    required
                    className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white ${
                      errors.sex 
                        ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                        : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                    }`}
                    aria-invalid={errors.sex ? 'true' : 'false'}
                  >
                    <option value="">Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <FieldError error={errors.sex} />
                </div>
              </div>
              
              <div>
                <label htmlFor="civilStatus" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Civil Status *
                </label>
                <div className="mt-2">
                  <select
                    id="civilStatus"
                    value={formData.civilStatus}
                    onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                    required
                    className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white ${
                      errors.civilStatus 
                        ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                        : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                    }`}
                    aria-invalid={errors.civilStatus ? 'true' : 'false'}
                  >
                    <option value="">Select civil status</option>
                    {civilStatusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.display}</option>
                    ))}
                  </select>
                  <FieldError error={errors.civilStatus} />
                </div>
              </div>
            </div>

            {/* Citizenship */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <label htmlFor="citizenship" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Citizenship *
                </label>
                <div className="mt-2">
                  <select
                    id="citizenship"
                    value={formData.citizenship}
                    onChange={(e) => handleInputChange('citizenship', e.target.value)}
                    required
                    className="block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset ring-zinc-950/10 focus:ring-2 focus:ring-inset focus:ring-zinc-950 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-white"
                  >
                    {citizenshipOptions.map(citizenship => (
                      <option key={citizenship.value} value={citizenship.value}>{citizenship.display}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                Education & Employment
              </h3>
              <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
                Academic background and work information.
              </p>
            </div>
            
            <StepErrorSummary step={2} />
            
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <label htmlFor="educationLevel" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Education Level *
                </label>
                <div className="mt-2">
                  <select
                    id="educationLevel"
                    value={formData.educationLevel}
                    onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                    className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white ${
                      errors.educationLevel 
                        ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                        : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                    }`}
                    aria-invalid={errors.educationLevel ? 'true' : 'false'}
                  >
                    <option value="">Select education level</option>
                    {educationLevelOptions.map(level => (
                      <option key={level.value} value={level.value}>{level.display}</option>
                    ))}
                  </select>
                  <FieldError error={errors.educationLevel} />
                </div>
              </div>
              
              <div>
                <label htmlFor="educationStatus" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Education Status *
                </label>
                <div className="mt-2">
                  <select
                    id="educationStatus"
                    value={formData.educationStatus}
                    onChange={(e) => handleInputChange('educationStatus', e.target.value)}
                    className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white ${
                      errors.educationStatus 
                        ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                        : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                    }`}
                    aria-invalid={errors.educationStatus ? 'true' : 'false'}
                  >
                    <option value="">Select education status</option>
                    {educationStatusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.display}</option>
                    ))}
                  </select>
                  <FieldError error={errors.educationStatus} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div>
                <label htmlFor="occupation" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Occupation <span className="text-zinc-500">(PSOC Compliant)</span>
                </label>
                <div className="mt-2">
                  <PSOCSelector
                    value={formData.psocCode}
                    onSelect={(option) => {
                      if (option) {
                        handleInputChange('psocCode', option.occupation_code)
                        handleInputChange('psocLevel', option.level_type)
                        handleInputChange('occupationDescription', option.occupation_title)
                        // Clear position title ID if not unit group level
                        if (option.level_type !== 'unit_group') {
                          handleInputChange('positionTitleId', '')
                        }
                      } else {
                        handleInputChange('psocCode', '')
                        handleInputChange('psocLevel', '')
                        handleInputChange('occupationDescription', '')
                        handleInputChange('positionTitleId', '')
                      }
                    }}
                    placeholder="Search for occupation (e.g., Manager, Teacher, Engineer)"
                    error={errors.occupationDescription}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Search by job title or occupation category. Uses Philippine Standard Occupational Classification (PSOC).
                </p>
              </div>
              
              <div>
                <label htmlFor="employmentStatus" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                  Employment Status
                </label>
                <div className="mt-2">
                  <select
                    id="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    className="block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset ring-zinc-950/10 focus:ring-2 focus:ring-inset focus:ring-zinc-950 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-white"
                  >
                    <option value="">Select employment status</option>
                    {employmentStatusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.display}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="workplace" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                Workplace <span className="text-zinc-500">(Optional)</span>
              </label>
              <div className="mt-2">
                <input
                  id="workplace"
                  type="text"
                  value={formData.workplace}
                  onChange={(e) => handleInputChange('workplace', e.target.value)}
                  className="block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset ring-zinc-950/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-zinc-950 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-zinc-400 dark:focus:ring-white"
                  placeholder="Company or workplace name"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                Contact & Physical Information
              </h3>
              <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
                Contact details and physical attributes.
              </p>
            </div>
            
            <StepErrorSummary step={3} />
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">Contact Details</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                    Mobile Number *
                  </label>
                  <div className="mt-2">
                    <input
                      id="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      required
                      className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset placeholder:text-zinc-500 focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-400 ${
                        errors.mobileNumber 
                          ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                          : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                      }`}
                      placeholder="09XXXXXXXXX"
                      aria-invalid={errors.mobileNumber ? 'true' : 'false'}
                    />
                    <FieldError error={errors.mobileNumber} />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="telephoneNumber" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                    Telephone Number
                  </label>
                  <div className="mt-2">
                    <input
                      id="telephoneNumber"
                      type="tel"
                      value={formData.telephoneNumber}
                      onChange={(e) => handleInputChange('telephoneNumber', e.target.value)}
                      className="block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset ring-zinc-950/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-zinc-950 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-zinc-400 dark:focus:ring-white"
                      placeholder="(02) XXX-XXXX"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                    Email Address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset placeholder:text-zinc-500 focus:ring-2 focus:ring-inset dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-400 ${
                        errors.email 
                          ? 'ring-red-500 focus:ring-red-500 dark:ring-red-400 dark:focus:ring-red-400' 
                          : 'ring-zinc-950/10 focus:ring-zinc-950 dark:ring-white/10 dark:focus:ring-white'
                      }`}
                      placeholder="email@example.com"
                      aria-invalid={errors.email ? 'true' : 'false'}
                    />
                    <FieldError error={errors.email} />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="philsysCardNumber" className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
                    PhilSys Card Number
                  </label>
                  <div className="mt-2">
                    <input
                      id="philsysCardNumber"
                      type="text"
                      value={formData.philsysCardNumber}
                      onChange={(e) => handleInputChange('philsysCardNumber', e.target.value)}
                      className="block w-full rounded-lg border-none bg-white/5 px-3 py-2 text-sm/6 text-zinc-950 ring-1 ring-inset ring-zinc-950/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-zinc-950 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-zinc-400 dark:focus:ring-white"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Information */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-medium text-base text-neutral-800">Physical Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Height (meters)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="1.70"
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="65"
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Blood Type
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select blood type</option>
                    {bloodTypeOptions.map(type => (
                      <option key={type} value={type}>{type === 'unknown' ? 'Unknown' : type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Ethnicity
                  </label>
                  <select
                    value={formData.ethnicity}
                    onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select ethnicity</option>
                    {ethnicityOptions.map(ethnicity => (
                      <option key={ethnicity.value} value={ethnicity.value}>{ethnicity.display}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Religion
                  </label>
                  <select
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select religion</option>
                    {religionOptions.map(religion => (
                      <option key={religion.value} value={religion.value}>{religion.display}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Complexion
                  </label>
                  <input
                    type="text"
                    value={formData.complexion}
                    onChange={(e) => handleInputChange('complexion', e.target.value)}
                    placeholder="Fair, Medium, Dark"
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Mother's Maiden Name */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-medium text-base text-neutral-800">Mother's Maiden Name</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.motherMaidenFirstName}
                    onChange={(e) => handleInputChange('motherMaidenFirstName', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.motherMaidenMiddleName}
                    onChange={(e) => handleInputChange('motherMaidenMiddleName', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.motherMaidenLastName}
                    onChange={(e) => handleInputChange('motherMaidenLastName', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Voting Information */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-medium text-base text-neutral-800">Voting Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="voterRegistration"
                    checked={formData.voterRegistrationStatus}
                    onChange={(e) => handleInputChange('voterRegistrationStatus', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="voterRegistration" className="font-montserrat text-sm text-neutral-700">
                    Registered Voter
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="residentVoter"
                    checked={formData.residentVoterStatus}
                    onChange={(e) => handleInputChange('residentVoterStatus', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="residentVoter" className="font-montserrat text-sm text-neutral-700">
                    Resident Voter
                  </label>
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Last Voted Year
                  </label>
                  <input
                    type="number"
                    value={formData.lastVotedYear}
                    onChange={(e) => handleInputChange('lastVotedYear', e.target.value)}
                    placeholder="2022"
                    min="1900"
                    max="2024"
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="font-montserrat font-semibold text-lg text-neutral-900 mb-4">
              Address & Household Information
            </h3>
            
            <StepErrorSummary step={4} />
            
            {/* Address Information */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-medium text-base text-neutral-800">Address Information</h4>
              
              {loadingAddress ? (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <svg className="h-5 w-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-700 text-sm font-medium">Loading your assigned barangay...</span>
                </div>
              ) : userAddress ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 mt-0.5">📍</span>
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">Auto-populated from your assigned barangay</h5>
                      <div className="space-y-1 text-sm text-green-700">
                        <div><strong>Region:</strong> {userAddress.region_name}</div>
                        {userAddress.province_name && (
                          <div><strong>Province:</strong> {userAddress.province_name}</div>
                        )}
                        <div><strong>City/Municipality:</strong> {userAddress.city_municipality_name} ({userAddress.city_municipality_type})</div>
                        <div><strong>Barangay:</strong> {userAddress.barangay_name}</div>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        All residents you register will be assigned to this barangay automatically.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 mt-0.5">⚠️</span>
                    <div>
                      <h5 className="font-medium text-red-800 mb-1">
                        {addressError || 'No barangay assignment found'}
                      </h5>
                      <p className="text-sm text-red-700">
                        {addressError 
                          ? 'There was an error loading your barangay information. Please try refreshing the page.'
                          : 'Please contact your system administrator to assign you to a barangay.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Household Assignment */}
            <div className="space-y-4">
              <h4 className="font-montserrat font-medium text-base text-neutral-800">Household Assignment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Household Assignment
                  </label>
                  <HouseholdSelector
                    value={formData.householdCode}
                    onSelect={(householdCode) => handleInputChange('householdCode', householdCode || '')}
                    error={errors.householdCode}
                    placeholder="Select existing household or leave blank for new"
                  />
                </div>
                <div>
                  <label className="block font-montserrat font-medium text-sm text-neutral-700 mb-2">
                    Role in Household
                  </label>
                  <select
                    value={formData.householdRole}
                    onChange={(e) => handleInputChange('householdRole', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-montserrat text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Member">Member</option>
                    <option value="Head">Head of Household</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="font-montserrat text-sm text-blue-800">
                  <strong>Household Assignment:</strong> 
                  {formData.householdCode ? (
                    <span> This resident will be added to the selected existing household.</span>
                  ) : (
                    <span> A new household will be created automatically for this resident. If they are the head of household, they will be assigned as the household head.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                Review & Submit
              </h3>
              <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
                Please review all information before submitting.
              </p>
            </div>
            
            <div className="rounded-lg bg-zinc-50 p-6 ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
              <div className="space-y-6">
                {/* Personal Information Summary */}
                <div>
                  <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white mb-3">Personal Information</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Name</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">
                        {`${formData.firstName} ${formData.middleName} ${formData.lastName} ${formData.extensionName}`.trim()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Birth Date</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.birthdate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Sex</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.sex}</dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Civil Status</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.civilStatus}</dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Citizenship</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.citizenship}</dd>
                    </div>
                  </dl>
                </div>

                {/* Education & Employment Summary */}
                <div>
                  <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white mb-3">Education & Employment</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Education Level</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.educationLevel || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Education Status</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.educationStatus || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Employment Status</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.employmentStatus || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Occupation</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">
                        {formData.occupationDescription || 'Not specified'}
                        {formData.psocCode && (
                          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                            PSOC Code: {formData.psocCode} ({formData.psocLevel?.replace('_', ' ')})
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Contact Information Summary */}
                <div>
                  <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white mb-3">Contact Information</h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Mobile</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.mobileNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
                      <dd className="text-sm/6 text-zinc-950 dark:text-white">{formData.email || 'Not provided'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 ring-1 ring-amber-900/10 dark:bg-amber-400/10 dark:ring-amber-400/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm/6 font-medium text-amber-800 dark:text-amber-200">
                    Please review carefully
                  </h3>
                  <div className="mt-2 text-sm/6 text-amber-700 dark:text-amber-300">
                    <p>
                      Once submitted, this resident profile will be created and a unique resident ID will be generated. 
                      You can edit the information later if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-neutral-50 border-r border-neutral-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-300">
            <h1 className="font-montserrat font-semibold text-xl text-neutral-900">Citizenly</h1>
            <div className="flex gap-1">
              <div className="bg-neutral-200 p-0.5 rounded">
                <div className="w-5 h-5 bg-neutral-400 rounded"></div>
              </div>
              <div className="bg-neutral-200 p-0.5 rounded">
                <div className="w-5 h-5 bg-neutral-400 rounded"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-1 py-4">
            <div className="space-y-1">
              <Link href="/dashboard" className="block bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Dashboard</div>
              </Link>
              <div className="bg-blue-100 rounded p-2">
                <div className="font-montserrat font-semibold text-base text-neutral-800">Residents</div>
              </div>
              <Link href="/household" className="block bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Household</div>
              </Link>
              <Link href="/business" className="block bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Business</div>
              </Link>
              <Link href="/judiciary" className="block bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Judiciary</div>
              </Link>
              <Link href="/certification" className="block bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Certification</div>
              </Link>
              <Link href="/reports" className="block bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Reports</div>
              </Link>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="px-2 py-4 border-t border-neutral-300">
            <div className="space-y-1">
              <div className="bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Help</div>
              </div>
              <div className="bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Notifications</div>
              </div>
              <div className="bg-neutral-50 rounded p-2">
                <div className="font-montserrat font-medium text-base text-neutral-700">Settings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-56">
        {/* Top Header */}
        <div className="bg-white border-b border-neutral-300 px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="w-[497px]">
              <div className="bg-neutral-100 rounded p-2 flex items-center gap-2">
                <div className="w-4 h-4 text-neutral-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1 font-montserrat font-normal text-sm text-neutral-400">
                  Search Citizenly
                </div>
                <div className="w-4 h-4 text-neutral-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-2">
              <div className="bg-neutral-200 p-2 rounded-full">
                <div className="w-5 h-5 text-neutral-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="bg-neutral-200 p-2 rounded-full">
                <div className="w-5 h-5 text-neutral-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="w-6 h-0 border-l border-neutral-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-center bg-cover bg-no-repeat" style={{backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face')"}}></div>
                <div className="font-montserrat font-medium text-sm text-neutral-800">Jasper Lepardo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <Link 
                href="/residents"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-950 shadow-sm hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back
              </Link>
              <div>
                <h1 className="text-2xl/8 font-semibold text-zinc-950 dark:text-white">
                  Add New Resident
                </h1>
                <p className="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
                  Complete the form to register a new resident in the system
                </p>
              </div>
            </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={stepIdx !== steps.length - 1 ? 'relative pr-8 sm:pr-20' : 'relative'}>
                  {currentStep > step.id ? (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-zinc-600" />
                      </div>
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-600">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </>
                  ) : currentStep === step.id ? (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-zinc-200" />
                      </div>
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-600 bg-white">
                        <span className="text-sm font-medium text-zinc-600">{step.id}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-zinc-200" />
                      </div>
                      <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-300 bg-white">
                        <span className="text-sm font-medium text-zinc-500">{step.id}</span>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-6">
            <h2 className="text-lg/8 font-semibold text-zinc-950 dark:text-white">
              {steps[currentStep - 1].title}
            </h2>
            <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="px-6 py-8">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-4 py-2 text-sm/6 font-medium text-zinc-950 shadow-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/15 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Continue
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Registration
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateResidentPage() {
  return (
    <ProtectedRoute requirePermission="residents_create">
      <CreateResidentForm />
    </ProtectedRoute>
  )
}