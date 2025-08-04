import React from 'react'
import { FormGroup, InputField, SelectField } from '@/components/molecules'
import PSOCSelector from './PSOCSelector'

export interface EducationEmploymentData {
  educationLevel: string
  educationStatus: string
  psocCode: string
  psocLevel: string
  positionTitleId: string
  occupationDescription: string
  employmentStatus: string
  workplace: string
}

interface EducationEmploymentProps {
  value: EducationEmploymentData
  onChange: (value: EducationEmploymentData) => void
  errors?: Partial<Record<keyof EducationEmploymentData, string>>
  className?: string
}

const EDUCATION_LEVEL_OPTIONS = [
  { value: 'no_formal_education', label: 'No Formal Education' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'post_graduate', label: 'Post-Graduate' },
  { value: 'vocational', label: 'Vocational' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'undergraduate', label: 'Undergraduate' }
]

const EDUCATION_STATUS_OPTIONS = [
  { value: 'currently_studying', label: 'Currently Studying' },
  { value: 'not_studying', label: 'Not Studying' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'dropped_out', label: 'Dropped Out' }
]

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'underemployed', label: 'Underemployed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unable_to_work', label: 'Unable to Work' },
  { value: 'looking_for_work', label: 'Looking for Work' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' }
]

export default function EducationEmployment({ 
  value, 
  onChange, 
  errors = {}, 
  className = "" 
}: EducationEmploymentProps) {
  const handleChange = (field: keyof EducationEmploymentData, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    })
  }

  const handleOccupationSelect = (option: any) => {
    if (option) {
      onChange({
        ...value,
        psocCode: option.occupation_code,
        psocLevel: option.level_type,
        occupationDescription: option.occupation_title,
        // Clear position title ID if not unit group level
        positionTitleId: option.level_type !== 'unit_group' ? '' : value.positionTitleId
      })
    } else {
      onChange({
        ...value,
        psocCode: '',
        psocLevel: '',
        occupationDescription: '',
        positionTitleId: ''
      })
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
          Education & Employment
        </h3>
        <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
          Academic background and work information.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        <SelectField
          label="Education Level"
          value={value.educationLevel}
          onChange={(e) => handleChange('educationLevel', e.target.value)}
          options={EDUCATION_LEVEL_OPTIONS}
          placeholder="Select education level"
          required
          errorMessage={errors.educationLevel}
        />
        
        <SelectField
          label="Education Status"
          value={value.educationStatus}
          onChange={(e) => handleChange('educationStatus', e.target.value)}
          options={EDUCATION_STATUS_OPTIONS}
          placeholder="Select education status"
          required
          errorMessage={errors.educationStatus}
        />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        <div>
          <label className="block text-sm/6 font-medium text-zinc-950 dark:text-white">
            Occupation <span className="text-zinc-500">(PSOC Compliant)</span>
          </label>
          <div className="mt-2">
            <PSOCSelector
              value={value.psocCode}
              onSelect={handleOccupationSelect}
              placeholder="Search for occupation (e.g., Manager, Teacher, Engineer)"
              error={errors.occupationDescription}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Search by job title or occupation category. Uses Philippine Standard Occupational Classification (PSOC).
          </p>
        </div>
        
        <SelectField
          label="Employment Status"
          value={value.employmentStatus}
          onChange={(e) => handleChange('employmentStatus', e.target.value)}
          options={EMPLOYMENT_STATUS_OPTIONS}
          placeholder="Select employment status"
        />
      </div>

      <InputField
        label="Workplace"
        value={value.workplace}
        onChange={(e) => handleChange('workplace', e.target.value)}
        placeholder="Company or workplace name"
        helperText="Optional"
      />
    </div>
  )
}