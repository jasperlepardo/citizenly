import React from 'react'
import { InputField, DropdownSelect } from '@/components/molecules'

export interface PersonalInformationData {
  firstName: string
  middleName: string
  lastName: string
  extensionName: string
  birthdate: string
  sex: 'male' | 'female' | ''
  civilStatus: string
  citizenship: string
}

interface PersonalInformationProps {
  value: PersonalInformationData
  onChange: (value: PersonalInformationData) => void
  errors?: Partial<Record<keyof PersonalInformationData, string>>
  className?: string
}

const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled', label: 'Annulled' },
  { value: 'registered_partnership', label: 'Registered Partnership' },
  { value: 'live_in', label: 'Live-in' }
]

const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreign_national', label: 'Foreign National' }
]

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
]

export default function PersonalInformation({ 
  value, 
  onChange, 
  errors = {}, 
  className = "" 
}: PersonalInformationProps) {
  const handleChange = (field: keyof PersonalInformationData, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    })
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <h3 className="text-base/7 font-semibold text-primary">
          Personal Information
        </h3>
        <p className="mt-1 text-sm/6 text-secondary">
          Basic details and identification information.
        </p>
      </div>
      
      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        <InputField
          label="First Name"
          value={value.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          placeholder="Enter first name"
          required
          errorMessage={errors.firstName}
        />
        
        <InputField
          label="Middle Name"
          value={value.middleName}
          onChange={(e) => handleChange('middleName', e.target.value)}
          placeholder="Enter middle name"
        />
        
        <InputField
          label="Last Name"
          value={value.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          placeholder="Enter last name"
          required
          errorMessage={errors.lastName}
        />
        
        <InputField
          label="Extension Name"
          value={value.extensionName}
          onChange={(e) => handleChange('extensionName', e.target.value)}
          placeholder="Jr., Sr., III, etc."
        />
      </div>

      {/* Birth Date and Basic Info */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
        <InputField
          label="Birth Date"
          type="date"
          value={value.birthdate}
          onChange={(e) => handleChange('birthdate', e.target.value)}
          required
          errorMessage={errors.birthdate}
        />
        
        <DropdownSelect
          label="Sex"
          value={value.sex}
          onChange={(val) => handleChange('sex', val)}
          options={SEX_OPTIONS}
          placeholder="Select sex"
          searchable={true}
          errorMessage={errors.sex}
        />
        
        <DropdownSelect
          label="Civil Status"
          value={value.civilStatus}
          onChange={(val) => handleChange('civilStatus', val)}
          options={CIVIL_STATUS_OPTIONS}
          placeholder="Select civil status"
          errorMessage={errors.civilStatus}
        />
      </div>

      {/* Citizenship */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        <DropdownSelect
          label="Citizenship"
          value={value.citizenship}
          onChange={(val) => handleChange('citizenship', val)}
          options={CITIZENSHIP_OPTIONS}
          errorMessage={errors.citizenship}
        />
      </div>
    </div>
  )
}