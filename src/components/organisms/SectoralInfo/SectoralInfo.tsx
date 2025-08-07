'use client';

/**
 * SectoralInfo Component - RBI Sectoral Group Classification
 * Manages sectoral flags with auto-calculation and manual overrides
 * Integrates with age, employment status, and education data
 */

import React, { useEffect, useState } from 'react';
import { Checkbox } from '../../atoms';
import { FormGroup } from '../../molecules';

// Sectoral Information Interface (matches database schema)
export interface SectoralInformation {
  is_labor_force: boolean; // Auto from employment_status
  is_employed: boolean; // Auto from employment_status
  is_unemployed: boolean; // Auto from employment_status
  is_ofw: boolean; // Manual - Overseas Filipino Worker
  is_pwd: boolean; // Manual - Person with Disability
  is_out_of_school_children: boolean; // Auto from age + education (5-17)
  is_out_of_school_youth: boolean; // Auto from age + education + employment (18-30)
  is_senior_citizen: boolean; // Auto from age (60+)
  is_registered_senior_citizen: boolean; // Manual, conditional on is_senior_citizen
  is_solo_parent: boolean; // Manual
  is_indigenous_people: boolean; // Manual
  is_migrant: boolean; // Manual
}

// Context data needed for auto-calculations
export interface SectoralContext {
  age?: number;
  birthdate?: string;
  employment_status?: string;
  highest_educational_attainment?: string;
  marital_status?: string;
}

interface SectoralInfoProps {
  value: SectoralInformation;
  onChange: (sectoral: SectoralInformation) => void;
  context: SectoralContext;
  disabled?: boolean;
  className?: string;
}

// Employment statuses that qualify as labor force
const LABOR_FORCE_STATUSES = [
  'employed_full_time',
  'employed_part_time',
  'self_employed',
  'unemployed_looking',
  'underemployed',
];

const EMPLOYED_STATUSES = ['employed_full_time', 'employed_part_time', 'self_employed'];

const UNEMPLOYED_STATUSES = ['unemployed_looking', 'underemployed'];

export default function SectoralInfo({
  value,
  onChange,
  context,
  disabled = false,
  className = '',
}: SectoralInfoProps) {
  const [_autoCalculated, setAutoCalculated] = useState({
    is_labor_force: false,
    is_employed: false,
    is_unemployed: false,
    is_out_of_school_children: false,
    is_out_of_school_youth: false,
    is_senior_citizen: false,
  });

  // Auto-calculate sectoral flags based on context
  useEffect(() => {
    const age = context.age || (context.birthdate ? calculateAge(context.birthdate) : 0);
    const employment = context.employment_status || '';

    const calculated = {
      is_labor_force: LABOR_FORCE_STATUSES.includes(employment),
      is_employed: EMPLOYED_STATUSES.includes(employment),
      is_unemployed: UNEMPLOYED_STATUSES.includes(employment),
      is_out_of_school_children: isOutOfSchoolChildren(age, context.highest_educational_attainment),
      is_out_of_school_youth: isOutOfSchoolYouth(
        age,
        context.highest_educational_attainment,
        employment
      ),
      is_senior_citizen: age >= 60,
    };

    setAutoCalculated(calculated);

    // Update the sectoral information with auto-calculated values
    const updatedSectoral = {
      ...value,
      ...calculated,
      // Reset registered senior citizen if no longer senior
      is_registered_senior_citizen: calculated.is_senior_citizen
        ? value.is_registered_senior_citizen
        : false,
    };

    // Only trigger onChange if values actually changed
    if (JSON.stringify(updatedSectoral) !== JSON.stringify(value)) {
      onChange(updatedSectoral);
    }
  }, [
    context.age,
    context.birthdate,
    context.employment_status,
    context.highest_educational_attainment,
    onChange,
    value,
  ]);

  // Calculate age from birthdate
  function calculateAge(birthdate: string): number {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // Check if person qualifies as out-of-school children (5-17 years old, not in school)
  function isOutOfSchoolChildren(age: number, education?: string): boolean {
    if (age < 5 || age > 17) return false;

    // If still in elementary/high school, not out-of-school
    const inSchoolEducation = [
      'elementary_graduate',
      'high_school_graduate',
      'senior_high_graduate',
    ];
    return !inSchoolEducation.some(level => education?.includes(level));
  }

  // Check if person qualifies as out-of-school youth (18-30 years old, not in school, not employed)
  function isOutOfSchoolYouth(age: number, education?: string, employment?: string): boolean {
    if (age < 18 || age > 30) return false;

    // Must not be in tertiary education
    const inTertiaryEducation = [
      'college_undergraduate',
      'college_graduate',
      'vocational_graduate',
    ];
    const isInSchool = inTertiaryEducation.some(level => education?.includes(level));

    // Must not be employed
    const isEmployed = EMPLOYED_STATUSES.includes(employment || '');

    return !isInSchool && !isEmployed;
  }

  // Handle manual flag changes
  const handleFlagChange =
    (flag: keyof SectoralInformation) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      const updatedSectoral = {
        ...value,
        [flag]: checked,
      };

      // Handle conditional logic for registered senior citizen
      if (flag === 'is_senior_citizen' && !checked) {
        updatedSectoral.is_registered_senior_citizen = false;
      }

      onChange(updatedSectoral);
    };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-b border-gray-200 pb-4">
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          <span className="text-base">👥</span> Sectoral Group Classification
        </h3>
        <p className="text-sm text-gray-600">
          Some flags are automatically calculated based on age, employment, and education data.
        </p>
      </div>

      {/* Auto-Calculated Flags (Read-only) */}
      <FormGroup title="Auto-Calculated Classifications" className="rounded-lg bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Checkbox
            label="Labor Force"
            description="Based on employment status"
            checked={_autoCalculated.is_labor_force}
            disabled={true}
            size="md"
          />

          <Checkbox
            label="Employed"
            description="Currently employed (full/part-time, self-employed)"
            checked={_autoCalculated.is_employed}
            disabled={true}
            size="md"
          />

          <Checkbox
            label="Unemployed"
            description="Unemployed but looking for work"
            checked={_autoCalculated.is_unemployed}
            disabled={true}
            size="md"
          />

          <Checkbox
            label="Out-of-School Children"
            description="Ages 5-17, not attending school"
            checked={_autoCalculated.is_out_of_school_children}
            disabled={true}
            size="md"
          />

          <Checkbox
            label="Out-of-School Youth"
            description="Ages 18-30, not in school/employed"
            checked={_autoCalculated.is_out_of_school_youth}
            disabled={true}
            size="md"
          />

          <Checkbox
            label="Senior Citizen"
            description="Age 60 and above"
            checked={_autoCalculated.is_senior_citizen}
            disabled={true}
            size="md"
          />
        </div>
      </FormGroup>

      {/* Manual Flags */}
      <FormGroup title="Manual Classifications">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Checkbox
            label="Overseas Filipino Worker (OFW)"
            description="Currently working abroad"
            checked={value.is_ofw}
            onChange={handleFlagChange('is_ofw')}
            disabled={disabled}
            size="md"
          />

          <Checkbox
            label="Person with Disability (PWD)"
            description="Has physical, mental, or sensory disability"
            checked={value.is_pwd}
            onChange={handleFlagChange('is_pwd')}
            disabled={disabled}
            size="md"
          />

          <Checkbox
            label="Solo Parent"
            description="Single parent raising children alone"
            checked={value.is_solo_parent}
            onChange={handleFlagChange('is_solo_parent')}
            disabled={disabled}
            size="md"
          />

          <Checkbox
            label="Indigenous People"
            description="Belongs to indigenous cultural community"
            checked={value.is_indigenous_people}
            onChange={handleFlagChange('is_indigenous_people')}
            disabled={disabled}
            size="md"
          />

          <Checkbox
            label="Migrant"
            description="Recently moved to this barangay"
            checked={value.is_migrant}
            onChange={handleFlagChange('is_migrant')}
            disabled={disabled}
            size="md"
          />

          {/* Conditional: Registered Senior Citizen */}
          {value.is_senior_citizen && (
            <Checkbox
              label="Registered Senior Citizen"
              description="Officially registered with OSCA"
              checked={value.is_registered_senior_citizen}
              onChange={handleFlagChange('is_registered_senior_citizen')}
              disabled={disabled}
              size="md"
            />
          )}
        </div>
      </FormGroup>

      {/* Summary */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-medium text-blue-900">Classification Summary</h4>
        <div className="text-xs text-blue-700">
          <span className="font-medium">Active Classifications:</span>{' '}
          {(() => {
            const allClassifications = { ..._autoCalculated, ...value };
            return (
              Object.entries(allClassifications)
                .filter(([, val]) => val === true)
                .map(([key]) => key.replace('is_', '').replace(/_/g, ' '))
                .join(', ') || 'None'
            );
          })()}
        </div>
      </div>
    </div>
  );
}
