'use client';

/**
 * HouseholdTypeSelector Component - RBI Household Composition Type
 * Allows selection of household structure based on family composition
 * Matches database enum household_type_enum
 */

import React from 'react';
import { Radio, RadioGroup } from '../atoms';

// Household types (matches database enum)
export type HouseholdType =
  | 'nuclear' // Parents with children
  | 'single_parent' // Single parent with children
  | 'extended' // Multiple generations/relatives
  | 'childless' // Couple without children
  | 'grandparents' // Grandparents with grandchildren
  | 'stepfamily'; // Blended family

interface HouseholdTypeOption {
  value: HouseholdType;
  label: string;
  description: string;
  icon: string;
}

const HOUSEHOLD_TYPE_OPTIONS: HouseholdTypeOption[] = [
  {
    value: 'nuclear',
    label: 'Nuclear Family',
    description: 'Parents living with their biological or adopted children',
    icon: '👪',
  },
  {
    value: 'single_parent',
    label: 'Single Parent Family',
    description: 'One parent living with their children (divorced, widowed, or unmarried)',
    icon: '👩‍👧‍👦',
  },
  {
    value: 'extended',
    label: 'Extended Family',
    description:
      'Multiple generations or relatives living together (grandparents, aunts, uncles, cousins)',
    icon: '🏠',
  },
  {
    value: 'childless',
    label: 'Childless Couple',
    description: 'Married or cohabiting couple without children',
    icon: '👫',
  },
  {
    value: 'grandparents',
    label: 'Grandparent Family',
    description: 'Grandparents as primary caregivers for grandchildren',
    icon: '👴👵',
  },
  {
    value: 'stepfamily',
    label: 'Stepfamily/Blended Family',
    description: 'Couple with children from previous relationships',
    icon: '👨‍👩‍👧‍👧',
  },
];

interface HouseholdTypeSelectorProps {
  value?: HouseholdType;
  onChange: (type: HouseholdType) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export default function HouseholdTypeSelector({
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
  orientation = 'vertical',
}: HouseholdTypeSelectorProps) {
  const handleTypeChange = (selectedValue: string) => {
    onChange(selectedValue as HouseholdType);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-gray-200 pb-3">
        <h3 className="mb-1 text-lg font-medium text-primary">
          <span className="text-base">🏠</span> Household Type
          {required && <span className="ml-1 text-red-500">*</span>}
        </h3>
        <p className="text-sm text-secondary">
          Select the household composition that best describes this family structure.
        </p>
      </div>

      <RadioGroup
        name="household_type"
        value={value || ''}
        onChange={handleTypeChange}
        orientation={orientation}
        errorMessage={error}
        className="space-y-3"
      >
        {HOUSEHOLD_TYPE_OPTIONS.map(option => (
          <div
            key={option.value}
            className={`relative rounded-lg border p-4 transition-all duration-200 ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
          >
            <Radio
              value={option.value}
              disabled={disabled}
              variant={value === option.value ? 'primary' : 'default'}
              className="absolute right-4 top-4"
            />

            <div className="pr-8">
              <div className="mb-2 flex items-center space-x-3">
                <span className="text-xl" role="img" aria-label={option.label}>
                  {option.icon}
                </span>
                <h4
                  className={`text-base font-medium ${value === option.value ? 'text-blue-900' : 'text-primary'} `}
                >
                  {option.label}
                </h4>
              </div>

              <p
                className={`text-sm leading-relaxed ${value === option.value ? 'text-blue-700' : 'text-secondary'} `}
              >
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>

      {/* Validation Summary */}
      {value && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm font-medium text-green-800">
              Selected: {HOUSEHOLD_TYPE_OPTIONS.find(opt => opt.value === value)?.label}
            </span>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="rounded-lg p-3 text-xs text-muted bg-background-muted">
        <span className="font-medium">📋 Note:</span> This classification helps determine household
        demographics and social services eligibility. You can change this selection later if the
        family composition changes.
      </div>
    </div>
  );
}
