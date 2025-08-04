'use client'

/**
 * MotherMaidenName Component - RBI Mother's Maiden Name Information
 * Captures mother's maiden name information for genealogy and verification
 * Follows Philippine naming conventions and cultural considerations
 */

import React, { useState } from 'react'
import { Input, Checkbox } from '../atoms'
import { FormGroup } from '../molecules'

// Mother's Information Interface (matches database schema)
export interface MotherInformation {
  mother_first_name?: string;
  mother_middle_name?: string;
  mother_maiden_last_name?: string;
  mother_suffix?: string;
  mother_is_deceased?: boolean;
  mother_birth_year?: number;
  mother_birthplace?: string;
  is_unknown_mother: boolean;
  is_confidential: boolean;
  notes?: string;
}

interface MotherMaidenNameProps {
  value: MotherInformation;
  onChange: (motherInfo: MotherInformation) => void;
  disabled?: boolean;
  className?: string;
}

// Common Filipino suffixes
const SUFFIX_OPTIONS = [
  { value: '', label: 'No suffix' },
  { value: 'Jr.', label: 'Jr.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'II', label: 'II' },
  { value: 'III', label: 'III' },
  { value: 'IV', label: 'IV' }
]

export default function MotherMaidenName({
  value,
  onChange,
  disabled = false,
  className = ""
}: MotherMaidenNameProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (field: keyof MotherInformation, newValue: any) => {
    const updated = { ...value, [field]: newValue }

    // Clear all fields when marking as unknown mother
    if (field === 'is_unknown_mother' && newValue) {
      Object.keys(updated).forEach(key => {
        if (key !== 'is_unknown_mother' && key !== 'is_confidential' && key !== 'notes') {
          (updated as any)[key] = undefined
        }
      })
    }

    // Clear confidential flag when marking as unknown
    if (field === 'is_unknown_mother' && newValue) {
      updated.is_confidential = false
    }

    onChange(updated)
  }

  // Check if essential information is provided
  const hasEssentialInfo = value.mother_first_name && value.mother_maiden_last_name

  // Format full name for display
  const getFullMotherName = () => {
    if (value.is_unknown_mother) return 'Unknown'
    
    const parts = []
    if (value.mother_first_name) parts.push(value.mother_first_name)
    if (value.mother_middle_name) parts.push(value.mother_middle_name)
    if (value.mother_maiden_last_name) parts.push(value.mother_maiden_last_name)
    if (value.mother_suffix) parts.push(value.mother_suffix)
    
    return parts.length > 0 ? parts.join(' ') : 'Not specified'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          <span className="text-base">👩‍👧‍👦</span> Mother's Information
        </h3>
        <p className="text-sm text-gray-600">
          Mother's maiden name and related information for genealogical records and identity verification.
        </p>
      </div>

      {/* Special Status Checkboxes */}
      <div className="space-y-3">
        <Checkbox
          checked={value.is_unknown_mother}
          onChange={(e) => handleChange('is_unknown_mother', e.target.checked)}
          label="Unknown Mother"
          description="Check if mother's information is unknown or unavailable"
          disabled={disabled}
        />

        {!value.is_unknown_mother && (
          <Checkbox
            checked={value.is_confidential}
            onChange={(e) => handleChange('is_confidential', e.target.checked)}
            label="Confidential Information"
            description="Mark as confidential for privacy or security reasons"
            disabled={disabled}
          />
        )}
      </div>

      {/* Mother's Name Information */}
      {!value.is_unknown_mother && (
        <>
          <FormGroup title="Mother's Full Name">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={value.mother_first_name || ''}
                  onChange={(e) => handleChange('mother_first_name', e.target.value)}
                  placeholder="Enter first name"
                  disabled={disabled}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <Input
                  type="text"
                  value={value.mother_middle_name || ''}
                  onChange={(e) => handleChange('mother_middle_name', e.target.value)}
                  placeholder="Enter middle name"
                  disabled={disabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suffix
                </label>
                <select
                  value={value.mother_suffix || ''}
                  onChange={(e) => handleChange('mother_suffix', e.target.value || undefined)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {SUFFIX_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormGroup>

          <FormGroup title="Mother's Maiden Last Name">
            <Input
              type="text"
              value={value.mother_maiden_last_name || ''}
              onChange={(e) => handleChange('mother_maiden_last_name', e.target.value)}
              placeholder="Enter maiden last name (family name before marriage)"
              disabled={disabled}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This should be the family name your mother had before marriage
            </p>
          </FormGroup>

          {/* Advanced Information Toggle */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={disabled}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <span className={`mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
                ▶
              </span>
              {showAdvanced ? 'Hide' : 'Show'} Additional Information
            </button>
          </div>

          {/* Advanced Information */}
          {showAdvanced && (
            <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup title="Mother's Status">
                  <Checkbox
                    checked={value.mother_is_deceased || false}
                    onChange={(e) => handleChange('mother_is_deceased', e.target.checked)}
                    label="Mother is deceased"
                    description="Check if mother has passed away"
                    disabled={disabled}
                  />
                </FormGroup>

                <FormGroup title="Birth Year">
                  <Input
                    type="number"
                    value={value.mother_birth_year || ''}
                    onChange={(e) => handleChange('mother_birth_year', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="YYYY"
                    min={1900}
                    max={new Date().getFullYear()}
                    disabled={disabled}
                  />
                </FormGroup>
              </div>

              <FormGroup title="Mother's Birthplace">
                <Input
                  type="text"
                  value={value.mother_birthplace || ''}
                  onChange={(e) => handleChange('mother_birthplace', e.target.value)}
                  placeholder="Enter city/municipality and province where mother was born"
                  disabled={disabled}
                />
              </FormGroup>
            </div>
          )}
        </>
      )}

      {/* Notes Section */}
      <FormGroup title="Additional Notes">
        <textarea
          value={value.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional information or special circumstances regarding mother's information"
          disabled={disabled}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </FormGroup>

      {/* Information Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Mother's Information Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {value.is_confidential && (
            <p className="text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
              🔒 This information is marked as confidential
            </p>
          )}
          <p><strong>Mother's Name:</strong> {getFullMotherName()}</p>
          {!value.is_unknown_mother && (
            <>
              {value.mother_maiden_last_name && (
                <p><strong>Maiden Name:</strong> {value.mother_maiden_last_name}</p>
              )}
              {value.mother_birth_year && (
                <p><strong>Birth Year:</strong> {value.mother_birth_year}</p>
              )}
              {value.mother_birthplace && (
                <p><strong>Birthplace:</strong> {value.mother_birthplace}</p>
              )}
              {value.mother_is_deceased && (
                <p className="text-gray-600">📿 Mother is deceased</p>
              )}
            </>
          )}
          {!hasEssentialInfo && !value.is_unknown_mother && (
            <p className="text-orange-600">⚠️ Essential information (first name and maiden name) is required</p>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">🛡️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Privacy Protection</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Mother's maiden name is sensitive information used for identity verification. 
              This data is protected under the Data Privacy Act of 2012 and will only be used 
              for official government purposes and genealogical records.
            </p>
          </div>
        </div>
      </div>

      {/* Cultural Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-green-400">ℹ️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-800">Filipino Naming Convention</h4>
            <p className="text-sm text-green-700 mt-1">
              In Filipino culture, a woman's maiden name is the family name she had before marriage. 
              This information helps establish family lineage and is important for various legal and 
              genealogical purposes. If adoption or other special circumstances apply, please note them 
              in the additional notes section.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}