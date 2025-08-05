'use client'

/**
 * MigrantInformation Component - RBI Migration Status and History
 * Captures migration details for residents who moved to the barangay
 * Supports both internal (domestic) and international migration tracking
 */

import React, { useState } from 'react'
import { Select, Textarea, Radio, RadioGroup } from '../atoms'
import { FormGroup, InputField } from '../molecules'

// Migration Information Interface (matches database schema)
export interface MigrationInformation {
  is_migrant: boolean;
  migration_type: 'domestic' | 'international' | null;
  previous_address: string;
  previous_country?: string;
  migration_reason: 'economic' | 'family_reunification' | 'education' | 'displacement' | 'other' | null;
  migration_reason_details?: string;
  year_of_migration?: number;
  length_of_stay_months?: number;
  registration_status: 'documented' | 'undocumented' | 'pending' | 'not_applicable';
  origin_region_code?: string;
  origin_province_code?: string;
  origin_city_code?: string;
}

interface MigrantInformationProps {
  value: MigrationInformation;
  onChange: (migration: MigrationInformation) => void;
  disabled?: boolean;
  className?: string;
}

// Migration reason options
const MIGRATION_REASONS = [
  { value: 'economic', label: 'Economic Opportunities', description: 'Employment, business, or livelihood' },
  { value: 'family_reunification', label: 'Family Reunification', description: 'To join family members' },
  { value: 'education', label: 'Education', description: 'Study or training purposes' },
  { value: 'displacement', label: 'Displacement', description: 'Conflict, disaster, or forced migration' },
  { value: 'other', label: 'Other', description: 'Please specify in details' }
] as const

// Registration status options
const REGISTRATION_STATUS_OPTIONS = [
  { value: 'documented', label: 'Documented', description: 'Has proper migration documents' },
  { value: 'undocumented', label: 'Undocumented', description: 'Lacks proper documentation' },
  { value: 'pending', label: 'Pending', description: 'Documentation in process' },
  { value: 'not_applicable', label: 'Not Applicable', description: 'Domestic migration or born locally' }
] as const

export default function MigrantInformation({
  value,
  onChange,
  disabled = false,
  className = ""
}: MigrantInformationProps) {
  const [showDetails, setShowDetails] = useState(value.migration_reason === 'other')

  const handleChange = (field: keyof MigrationInformation, newValue: any) => {
    const updated = { ...value, [field]: newValue }
    
    // Auto-reset dependent fields when migration type changes
    if (field === 'migration_type') {
      if (newValue === 'domestic') {
        updated.previous_country = undefined
        updated.registration_status = 'not_applicable'
      } else if (newValue === 'international') {
        updated.origin_region_code = undefined
        updated.origin_province_code = undefined
        updated.origin_city_code = undefined
      }
    }
    
    // Show/hide details field based on reason
    if (field === 'migration_reason') {
      setShowDetails(newValue === 'other')
      if (newValue !== 'other') {
        updated.migration_reason_details = undefined
      }
    }
    
    // Reset all fields when is_migrant becomes false
    if (field === 'is_migrant' && !newValue) {
      Object.keys(updated).forEach(key => {
        if (key !== 'is_migrant') {
          (updated as any)[key] = key.includes('registration_status') ? 'not_applicable' : 
                                  key.includes('type') ? null : undefined
        }
      })
    }
    
    onChange(updated)
  }

  if (!value.is_migrant) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="border-b border-default pb-4">
          <h3 className="text-lg font-medium text-primary mb-2">
            <span className="text-base">🧳</span> Migration Information
          </h3>
          <p className="text-sm text-secondary">
            This resident is not classified as a migrant. Enable migration status to collect details.
          </p>
        </div>
        
        <div className="bg-background-muted p-4 rounded-lg">
          <p className="text-sm text-secondary italic">
            Migration information is automatically collected when a resident is marked as a migrant in sectoral classifications.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-default pb-4">
        <h3 className="text-lg font-medium text-primary mb-2">
          <span className="text-base">🧳</span> Migration Information
        </h3>
        <p className="text-sm text-secondary">
          Details about migration history and current status for this resident.
        </p>
      </div>

      {/* Migration Type */}
      <FormGroup title="Migration Type">
        <RadioGroup
          name="migration_type"
          value={value.migration_type || ''}
          onChange={(newValue) => handleChange('migration_type', newValue || null)}
        >
          <Radio
            value="domestic"
            label="Domestic Migration"
            description="Moved from another location within the Philippines"
          />
          <Radio
            value="international"
            label="International Migration"
            description="Moved from another country"
          />
        </RadioGroup>
      </FormGroup>

      {/* Previous Address */}
      <FormGroup title="Previous Address">
        <Textarea
          value={value.previous_address || ''}
          onChange={(e) => handleChange('previous_address', e.target.value)}
          placeholder={
            value.migration_type === 'international' 
              ? "Enter complete address including city and country"
              : "Enter complete address including barangay, city/municipality, and province"
          }
          disabled={disabled}
          rows={3}
        />
      </FormGroup>

      {/* Previous Country (International only) */}
      {value.migration_type === 'international' && (
        <FormGroup title="Previous Country">
          <InputField
            type="text"
            value={value.previous_country || ''}
            onChange={(e) => handleChange('previous_country', e.target.value)}
            placeholder="Enter country name"
            disabled={disabled}
          />
        </FormGroup>
      )}

      {/* Migration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Year of Migration */}
        <FormGroup title="Year of Migration">
          <InputField
            type="number"
            value={value.year_of_migration || ''}
            onChange={(e) => handleChange('year_of_migration', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="YYYY"
            min={1900}
            max={new Date().getFullYear()}
            disabled={disabled}
          />
        </FormGroup>

        {/* Length of Stay */}
        <FormGroup title="Length of Stay (Months)">
          <InputField
            type="number"
            value={value.length_of_stay_months || ''}
            onChange={(e) => handleChange('length_of_stay_months', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Number of months"
            min={0}
            disabled={disabled}
          />
        </FormGroup>
      </div>

      {/* Migration Reason */}
      <FormGroup title="Reason for Migration">
        <RadioGroup
          name="migration_reason"
          value={value.migration_reason || ''}
          onChange={(newValue) => handleChange('migration_reason', newValue || null)}
        >
          {MIGRATION_REASONS.map(reason => (
            <Radio
              key={reason.value}
              value={reason.value}
              label={reason.label}
              description={reason.description}
            />
          ))}
        </RadioGroup>
      </FormGroup>

      {/* Migration Reason Details (if Other selected) */}
      {showDetails && (
        <FormGroup title="Migration Reason Details">
          <Textarea
            value={value.migration_reason_details || ''}
            onChange={(e) => handleChange('migration_reason_details', e.target.value)}
            placeholder="Please provide specific details about the reason for migration"
            disabled={disabled}
            rows={3}
          />
        </FormGroup>
      )}

      {/* Registration Status (International only) */}
      {value.migration_type === 'international' && (
        <FormGroup title="Registration/Documentation Status">
          <RadioGroup
            name="registration_status"
            value={value.registration_status}
            onChange={(newValue) => handleChange('registration_status', newValue)}
          >
            {REGISTRATION_STATUS_OPTIONS.map(status => (
              <Radio
                key={status.value}
                value={status.value}
                label={status.label}
                description={status.description}
              />
            ))}
          </RadioGroup>
        </FormGroup>
      )}

      {/* Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Migration Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Type:</strong> {value.migration_type ? value.migration_type.replace('_', ' ').toUpperCase() : 'Not specified'}</p>
          {value.year_of_migration && (
            <p><strong>Migrated:</strong> {value.year_of_migration} ({value.length_of_stay_months ? `${value.length_of_stay_months} months ago` : 'duration not specified'})</p>
          )}
          {value.migration_reason && (
            <p><strong>Reason:</strong> {MIGRATION_REASONS.find(r => r.value === value.migration_reason)?.label}</p>
          )}
          {value.previous_country && (
            <p><strong>From:</strong> {value.previous_country}</p>
          )}
          {value.migration_type === 'international' && (
            <p><strong>Status:</strong> {REGISTRATION_STATUS_OPTIONS.find(s => s.value === value.registration_status)?.label}</p>
          )}
        </div>
      </div>
    </div>
  )
}