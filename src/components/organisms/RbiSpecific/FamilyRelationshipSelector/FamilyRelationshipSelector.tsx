'use client';

/**
 * FamilyRelationshipSelector Component - RBI Family Position/Relationship
 * Manages family relationships within household with validation logic
 * Handles relationship to household head and position in family
 */

import { DropdownSelect } from '../../../molecules';
import { FormGroup } from '../../../molecules';

// Family position types (matches database enum)
export type FamilyPosition =
  | 'head' // Household Head (only one per household)
  | 'spouse' // Spouse of head
  | 'father' // Father
  | 'mother' // Mother
  | 'son' // Son
  | 'daughter' // Daughter
  | 'grandfather' // Grandfather
  | 'grandmother' // Grandmother
  | 'grandson' // Grandson
  | 'granddaughter' // Granddaughter
  | 'father_in_law' // Father-in-law
  | 'mother_in_law' // Mother-in-law
  | 'son_in_law' // Son-in-law
  | 'daughter_in_law' // Daughter-in-law
  | 'brother' // Brother
  | 'sister' // Sister
  | 'uncle' // Uncle
  | 'aunt' // Aunt
  | 'nephew' // Nephew
  | 'niece' // Niece
  | 'cousin' // Cousin
  | 'other_relative' // Other relative
  | 'non_relative'; // Non-relative/Boarder

interface FamilyPositionOption {
  value: FamilyPosition;
  label: string;
  category: 'immediate' | 'extended' | 'in_law' | 'other';
  minAge?: number;
  maxAge?: number;
  gender?: 'male' | 'female';
  description?: string;
}

const FAMILY_POSITION_OPTIONS: FamilyPositionOption[] = [
  // Immediate Family
  {
    value: 'head',
    label: 'Household Head',
    category: 'immediate',
    minAge: 18,
    description: 'Primary decision maker of the household',
  },
  {
    value: 'spouse',
    label: 'Spouse',
    category: 'immediate',
    minAge: 18,
    description: 'Husband or wife of household head',
  },
  { value: 'father', label: 'Father', category: 'immediate', gender: 'male', minAge: 18 },
  { value: 'mother', label: 'Mother', category: 'immediate', gender: 'female', minAge: 18 },
  { value: 'son', label: 'Son', category: 'immediate', gender: 'male' },
  { value: 'daughter', label: 'Daughter', category: 'immediate', gender: 'female' },

  // Grandparents/Grandchildren
  { value: 'grandfather', label: 'Grandfather', category: 'extended', gender: 'male', minAge: 45 },
  {
    value: 'grandmother',
    label: 'Grandmother',
    category: 'extended',
    gender: 'female',
    minAge: 45,
  },
  { value: 'grandson', label: 'Grandson', category: 'extended', gender: 'male', maxAge: 25 },
  {
    value: 'granddaughter',
    label: 'Granddaughter',
    category: 'extended',
    gender: 'female',
    maxAge: 25,
  },

  // In-laws
  {
    value: 'father_in_law',
    label: 'Father-in-law',
    category: 'in_law',
    gender: 'male',
    minAge: 35,
  },
  {
    value: 'mother_in_law',
    label: 'Mother-in-law',
    category: 'in_law',
    gender: 'female',
    minAge: 35,
  },
  { value: 'son_in_law', label: 'Son-in-law', category: 'in_law', gender: 'male', minAge: 18 },
  {
    value: 'daughter_in_law',
    label: 'Daughter-in-law',
    category: 'in_law',
    gender: 'female',
    minAge: 18,
  },

  // Siblings and Extended
  { value: 'brother', label: 'Brother', category: 'extended', gender: 'male' },
  { value: 'sister', label: 'Sister', category: 'extended', gender: 'female' },
  { value: 'uncle', label: 'Uncle', category: 'extended', gender: 'male', minAge: 18 },
  { value: 'aunt', label: 'Aunt', category: 'extended', gender: 'female', minAge: 18 },
  { value: 'nephew', label: 'Nephew', category: 'extended', gender: 'male', maxAge: 30 },
  { value: 'niece', label: 'Niece', category: 'extended', gender: 'female', maxAge: 30 },
  { value: 'cousin', label: 'Cousin', category: 'extended' },

  // Other
  {
    value: 'other_relative',
    label: 'Other Relative',
    category: 'other',
    description: 'Related by blood or marriage',
  },
  {
    value: 'non_relative',
    label: 'Non-relative/Boarder',
    category: 'other',
    description: 'Not related, e.g., boarder, helper',
  },
];

// Context for validation
export interface PersonContext {
  age?: number;
  gender?: 'male' | 'female';
  marital_status?: string;
}

export interface HouseholdContext {
  existingPositions: FamilyPosition[];
  householdHeadAge?: number;
  householdHeadGender?: 'male' | 'female';
}

interface FamilyRelationshipSelectorProps {
  value?: FamilyPosition;
  onChange: (position: FamilyPosition) => void;
  personContext?: PersonContext;
  householdContext?: HouseholdContext;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function FamilyRelationshipSelector({
  value,
  onChange,
  personContext = {},
  householdContext = { existingPositions: [] },
  disabled = false,
  required = false,
  error,
  className = '',
}: FamilyRelationshipSelectorProps) {
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState<FamilyPositionOption[]>([]);

  // Filter and validate available options
  useEffect(() => {
    let filtered = [...FAMILY_POSITION_OPTIONS];
    const warnings: string[] = [];

    // Filter by age constraints
    if (personContext.age !== undefined) {
      filtered = filtered.filter(option => {
        if (option.minAge && personContext.age! < option.minAge) {
          return false;
        }
        if (option.maxAge && personContext.age! > option.maxAge) {
          return false;
        }
        return true;
      });
    }

    // Filter by gender constraints
    if (personContext.gender) {
      filtered = filtered.filter(option => {
        return !option.gender || option.gender === personContext.gender;
      });
    }

    // Filter out positions that already exist (except for some that can have multiple)
    const uniquePositions = ['head', 'spouse'];
    filtered = filtered.filter(option => {
      if (
        uniquePositions.includes(option.value) &&
        householdContext.existingPositions.includes(option.value) &&
        value !== option.value
      ) {
        return false;
      }
      return true;
    });

    // Add warnings for potentially problematic selections
    if (value) {
      const selectedOption = FAMILY_POSITION_OPTIONS.find(opt => opt.value === value);
      if (selectedOption) {
        // Age warnings
        if (
          selectedOption.minAge &&
          personContext.age &&
          personContext.age < selectedOption.minAge
        ) {
          warnings.push(
            `Age ${personContext.age} is younger than typical for ${selectedOption.label} (min ${selectedOption.minAge})`
          );
        }
        if (
          selectedOption.maxAge &&
          personContext.age &&
          personContext.age > selectedOption.maxAge
        ) {
          warnings.push(
            `Age ${personContext.age} is older than typical for ${selectedOption.label} (max ${selectedOption.maxAge})`
          );
        }

        // Gender warnings
        if (
          selectedOption.gender &&
          personContext.gender &&
          selectedOption.gender !== personContext.gender
        ) {
          warnings.push(
            `Gender mismatch: ${selectedOption.label} typically refers to ${selectedOption.gender}`
          );
        }

        // Logical warnings
        if (
          value === 'spouse' &&
          householdContext.existingPositions.includes('head') &&
          personContext.age &&
          householdContext.householdHeadAge
        ) {
          const ageDiff = Math.abs(personContext.age - householdContext.householdHeadAge);
          if (ageDiff > 20) {
            warnings.push(
              `Large age difference (${ageDiff} years) between spouse and household head`
            );
          }
        }
      }
    }

    setAvailableOptions(filtered);
    setValidationWarnings(warnings);
  }, [personContext, householdContext, value]);

  // Group options by category
  const groupedOptions = availableOptions.reduce(
    (groups, option) => {
      const category = option.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
      return groups;
    },
    {} as Record<string, FamilyPositionOption[]>
  );

  const categoryLabels = {
    immediate: 'Immediate Family',
    extended: 'Extended Family',
    in_law: 'In-laws',
    other: 'Other',
  };

  // Create select options with categories
  const selectOptions = Object.entries(groupedOptions).flatMap(([category, options]) => [
    // Category header (disabled option)
    {
      value: `header_${category}`,
      label: `— ${categoryLabels[category as keyof typeof categoryLabels]} —`,
      disabled: true,
    },
    // Category options
    ...options.map(option => ({
      value: option.value,
      label: option.label + (option.description ? ` - ${option.description}` : ''),
    })),
  ]);

  const handlePositionChange = (position: string) => {
    if (!position.startsWith('header_')) {
      onChange(position as FamilyPosition);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-gray-200 pb-3">
        <h3 className="mb-1 text-lg font-medium text-primary">
          <span className="text-base">👨‍👩‍👧‍👦</span> Family Position
          {required && <span className="ml-1 text-red-500">*</span>}
        </h3>
        <p className="text-sm text-secondary">
          Select this person&apos;s relationship to the household head and position in the family.
        </p>
      </div>

      <FormGroup>
        <DropdownSelect
          options={selectOptions}
          value={value || ''}
          onChange={val => handlePositionChange(val)}
          placeholder="Select family position..."
          disabled={disabled}
          errorMessage={error}
        />
      </FormGroup>

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-start space-x-2">
            <span className="mt-0.5 text-yellow-600">⚠️</span>
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-medium text-yellow-800">Validation Warnings</h4>
              <ul className="space-y-1 text-xs text-yellow-700">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {value && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">✓</span>
            <div className="flex-1">
              <span className="text-sm font-medium text-blue-800">
                Position: {FAMILY_POSITION_OPTIONS.find(opt => opt.value === value)?.label}
              </span>
              {FAMILY_POSITION_OPTIONS.find(opt => opt.value === value)?.description && (
                <p className="mt-1 text-xs text-blue-600">
                  {FAMILY_POSITION_OPTIONS.find(opt => opt.value === value)?.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Information */}
      {(personContext.age || personContext.gender) && (
        <div className="rounded-lg p-3 text-xs text-muted bg-background-muted">
          <span className="font-medium">📋 Person Context:</span>
          {personContext.age && ` Age: ${personContext.age}`}
          {personContext.gender && ` • Gender: ${personContext.gender}`}
          {householdContext.existingPositions.length > 0 &&
            ` • Existing positions: ${householdContext.existingPositions.join(', ')}`}
        </div>
      )}
    </div>
  );
}
