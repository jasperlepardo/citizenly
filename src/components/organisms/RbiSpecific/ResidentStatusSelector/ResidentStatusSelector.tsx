'use client';

/**
 * ResidentStatusSelector Component - RBI Resident Status Classification
 * Determines resident classification based on Philippine legal framework
 * Handles voting eligibility, length of residency, and legal status
 */

import { Radio, RadioGroup, Textarea } from '../../../atoms';
import { FormGroup, InputField } from '../../../molecules';

// Resident Status Interface (matches database schema)
export interface ResidentStatus {
  status_type: 'permanent' | 'temporary' | 'transient' | 'visitor' | null;
  length_of_residency_years?: number;
  length_of_residency_months?: number;
  is_registered_voter: boolean;
  voter_id_number?: string;
  precinct_number?: string;
  is_indigenous_member: boolean;
  tribal_affiliation?: string;
  indigenous_community?: string;
  legal_status:
    | 'citizen'
    | 'dual_citizen'
    | 'permanent_resident'
    | 'temporary_resident'
    | 'visitor'
    | null;
  documentation_status: 'complete' | 'incomplete' | 'pending' | 'not_required' | null;
  special_circumstances?: string;
}

interface ResidentStatusSelectorProps {
  value: ResidentStatus;
  onChange: (status: ResidentStatus) => void;
  disabled?: boolean;
  className?: string;
  residentAge?: number; // For voting eligibility checks
}

// Status type options with descriptions
const STATUS_TYPE_OPTIONS = [
  {
    value: 'permanent',
    label: 'Permanent Resident',
    description: 'Lives in the barangay permanently, intends to stay long-term',
  },
  {
    value: 'temporary',
    label: 'Temporary Resident',
    description: 'Lives in the barangay temporarily, for work, study, or other purposes',
  },
  {
    value: 'transient',
    label: 'Transient',
    description: 'Staying temporarily with no fixed address, less than 6 months',
  },
  {
    value: 'visitor',
    label: 'Visitor',
    description: 'Visiting resident or tourist, not a permanent resident',
  },
] as const;

// Legal status options
const LEGAL_STATUS_OPTIONS = [
  {
    value: 'citizen',
    label: 'Filipino Citizen',
    description: 'Born Filipino or naturalized citizen',
  },
  {
    value: 'dual_citizen',
    label: 'Dual Citizen',
    description: 'Filipino citizen who also holds another citizenship',
  },
  {
    value: 'permanent_resident',
    label: 'Permanent Resident Alien',
    description: 'Foreign national with permanent residence status',
  },
  {
    value: 'temporary_resident',
    label: 'Temporary Resident',
    description: 'Foreign national with temporary residence status',
  },
  {
    value: 'visitor',
    label: 'Visitor/Tourist',
    description: 'Foreign national visiting temporarily',
  },
] as const;

// Documentation status options
const DOCUMENTATION_STATUS_OPTIONS = [
  {
    value: 'complete',
    label: 'Complete Documentation',
    description: 'All required documents are available and valid',
  },
  {
    value: 'incomplete',
    label: 'Incomplete Documentation',
    description: 'Missing some required documents',
  },
  {
    value: 'pending',
    label: 'Pending Documentation',
    description: 'Documents are being processed or renewed',
  },
  {
    value: 'not_required',
    label: 'Not Required',
    description: 'No special documentation required for this status',
  },
] as const;

export default function ResidentStatusSelector({
  value,
  onChange,
  disabled = false,
  className = '',
  residentAge,
}: ResidentStatusSelectorProps) {
  const handleChange = (
    field: keyof ResidentStatus,
    newValue: ResidentStatus[keyof ResidentStatus]
  ) => {
    const updated = { ...value, [field]: newValue };

    // Auto-reset dependent fields based on status changes
    if (field === 'status_type') {
      // Visitors typically can't be registered voters
      if (newValue === 'visitor') {
        updated.is_registered_voter = false;
        updated.voter_id_number = undefined;
        updated.precinct_number = undefined;
      }

      // Reset documentation status based on new status type
      if (newValue === 'permanent' || newValue === 'temporary') {
        if (!updated.documentation_status) {
          updated.documentation_status = 'complete';
        }
      }
    }

    // Clear voter details when not a registered voter
    if (field === 'is_registered_voter' && !newValue) {
      updated.voter_id_number = undefined;
      updated.precinct_number = undefined;
    }

    // Clear indigenous details when not indigenous
    if (field === 'is_indigenous_member' && !newValue) {
      updated.tribal_affiliation = undefined;
      updated.indigenous_community = undefined;
    }

    // Auto-set documentation status based on legal status
    if (field === 'legal_status') {
      if (newValue === 'citizen' || newValue === 'dual_citizen') {
        updated.documentation_status = 'not_required';
      } else if (newValue === 'visitor') {
        updated.documentation_status = 'complete'; // Tourists need complete docs
      }
    }

    onChange(updated);
  };

  // Calculate total residency in readable format
  const getResidencyDisplay = () => {
    const years = value.length_of_residency_years || 0;
    const months = value.length_of_residency_months || 0;

    if (years === 0 && months === 0) return 'Not specified';

    const parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);

    return parts.join(' and ');
  };

  // Check voting eligibility
  const isVotingEligible = () => {
    if (!residentAge) return null;
    if (residentAge < 18) return false;
    if (!value.legal_status) return null;
    return ['citizen', 'dual_citizen'].includes(value.legal_status);
  };

  const votingEligibility = isVotingEligible();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="mb-2 text-lg font-medium text-primary">
          <span className="text-base">🏠</span> Resident Status Classification
        </h3>
        <p className="text-sm text-secondary">
          Legal and administrative classification of the resident&apos;s status in the barangay.
        </p>
      </div>

      {/* Resident Status Type */}
      <FormGroup title="Resident Status Type">
        <RadioGroup
          name="status_type"
          value={value.status_type || ''}
          onChange={newValue => handleChange('status_type', newValue || null)}
        >
          {STATUS_TYPE_OPTIONS.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
            />
          ))}
        </RadioGroup>
      </FormGroup>

      {/* Length of Residency */}
      {(value.status_type === 'permanent' || value.status_type === 'temporary') && (
        <FormGroup title="Length of Residency in this Barangay">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Years"
              type="number"
              value={value.length_of_residency_years || ''}
              onChange={e =>
                handleChange(
                  'length_of_residency_years',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="0"
              min={0}
              max={100}
              disabled={disabled}
            />

            <InputField
              label="Additional Months"
              type="number"
              value={value.length_of_residency_months || ''}
              onChange={e =>
                handleChange(
                  'length_of_residency_months',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="0"
              min={0}
              max={11}
              disabled={disabled}
            />
          </div>

          <div className="mt-2 text-sm text-secondary">
            <strong>Total residency:</strong> {getResidencyDisplay()}
          </div>
        </FormGroup>
      )}

      {/* Legal Status */}
      <FormGroup title="Legal Status">
        <RadioGroup
          name="legal_status"
          value={value.legal_status || ''}
          onChange={newValue => handleChange('legal_status', newValue || null)}
        >
          {LEGAL_STATUS_OPTIONS.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
            />
          ))}
        </RadioGroup>
      </FormGroup>

      {/* Voting Registration */}
      <FormGroup title="Voter Registration">
        <div className="space-y-4">
          {/* Voting eligibility notice */}
          {votingEligibility !== null && (
            <div
              className={`rounded-lg p-3 ${votingEligibility ? 'border border-green-200 bg-green-50' : 'border border-yellow-200 bg-yellow-50'}`}
            >
              <p className={`text-sm ${votingEligibility ? 'text-green-800' : 'text-yellow-800'}`}>
                {votingEligibility
                  ? '✅ Eligible to register as voter (18+ years old, Filipino citizen)'
                  : '⚠️ Not eligible to register as voter (must be 18+ years old Filipino citizen)'}
              </p>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="is_registered_voter"
              checked={value.is_registered_voter}
              onChange={e => handleChange('is_registered_voter', e.target.checked)}
              disabled={disabled || votingEligibility === false}
              className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="is_registered_voter" className="text-sm font-medium text-primary">
                Registered Voter
              </label>
              <p className="text-muted text-xs">
                Check if resident is registered to vote in this barangay
              </p>
            </div>
          </div>

          {/* Voter Details */}
          {value.is_registered_voter && (
            <div className="ml-7 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Voter ID Number"
                type="text"
                value={value.voter_id_number || ''}
                onChange={e => handleChange('voter_id_number', e.target.value)}
                placeholder="Enter voter ID number"
                disabled={disabled}
              />

              <InputField
                label="Precinct Number"
                type="text"
                value={value.precinct_number || ''}
                onChange={e => handleChange('precinct_number', e.target.value)}
                placeholder="Enter precinct number"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </FormGroup>

      {/* Indigenous Peoples Identification */}
      <FormGroup title="Indigenous Peoples Identification">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="is_indigenous_member"
              checked={value.is_indigenous_member}
              onChange={e => handleChange('is_indigenous_member', e.target.checked)}
              disabled={disabled}
              className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="is_indigenous_member" className="text-sm font-medium text-primary">
                Member of Indigenous Cultural Community
              </label>
              <p className="text-muted text-xs">
                Check if resident belongs to an Indigenous Cultural Community (ICC) or Indigenous
                Peoples (IP) group
              </p>
            </div>
          </div>

          {/* Indigenous Details */}
          {value.is_indigenous_member && (
            <div className="ml-7 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Tribal Affiliation"
                type="text"
                value={value.tribal_affiliation || ''}
                onChange={e => handleChange('tribal_affiliation', e.target.value)}
                placeholder="e.g., Igorot, Lumad, Mangyan"
                disabled={disabled}
              />

              <InputField
                label="Indigenous Community"
                type="text"
                value={value.indigenous_community || ''}
                onChange={e => handleChange('indigenous_community', e.target.value)}
                placeholder="e.g., Bontoc, T&rsquo;boli, Hanunuo"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </FormGroup>

      {/* Documentation Status */}
      <FormGroup title="Documentation Status">
        <RadioGroup
          name="documentation_status"
          value={value.documentation_status || ''}
          onChange={newValue => handleChange('documentation_status', newValue || null)}
        >
          {DOCUMENTATION_STATUS_OPTIONS.map(option => (
            <Radio
              key={option.value}
              value={option.value}
              label={option.label}
              description={option.description}
            />
          ))}
        </RadioGroup>
      </FormGroup>

      {/* Special Circumstances */}
      <FormGroup title="Special Circumstances">
        <Textarea
          value={value.special_circumstances || ''}
          onChange={e => handleChange('special_circumstances', e.target.value)}
          placeholder="Any special circumstances affecting resident status (e.g., refugee status, asylum seeker, etc.)"
          disabled={disabled}
          rows={3}
        />
      </FormGroup>

      {/* Status Summary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-blue-900">Resident Status Summary</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>
            <strong>Status:</strong>{' '}
            {value.status_type
              ? STATUS_TYPE_OPTIONS.find(s => s.value === value.status_type)?.label
              : 'Not specified'}
          </p>
          <p>
            <strong>Legal Status:</strong>{' '}
            {value.legal_status
              ? LEGAL_STATUS_OPTIONS.find(s => s.value === value.legal_status)?.label
              : 'Not specified'}
          </p>
          {(value.length_of_residency_years || value.length_of_residency_months) && (
            <p>
              <strong>Residency:</strong> {getResidencyDisplay()}
            </p>
          )}
          <p>
            <strong>Voter Status:</strong>{' '}
            {value.is_registered_voter
              ? `Registered${value.precinct_number ? ` (Precinct ${value.precinct_number})` : ''}`
              : 'Not registered'}
          </p>
          {value.is_indigenous_member && (
            <p>
              <strong>Indigenous:</strong>{' '}
              {value.tribal_affiliation || 'Indigenous community member'}
            </p>
          )}
          <p>
            <strong>Documentation:</strong>{' '}
            {value.documentation_status
              ? DOCUMENTATION_STATUS_OPTIONS.find(d => d.value === value.documentation_status)
                  ?.label
              : 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
}
