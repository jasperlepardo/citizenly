'use client';

/**
 * SectoralClassifications Component - RBI Sectoral Group Classification
 * Manages sectoral flags with auto-calculation and manual overrides
 * Integrates with age, employment status, and education data
 */

import React, { useEffect, useState } from 'react';
import { ControlField } from '@/components/molecules';
import { isIndigenousPeople } from '@/services/business-rules/sectoral-classification';
import type { FormMode } from '@/types/forms';

// Sectoral Information Interface (matches database schema exactly)
export interface SectoralInformation {
  is_labor_force: boolean; // Auto from employment_status (in labor force)
  is_labor_force_employed: boolean; // Auto from employment_status
  is_unemployed: boolean; // Auto from employment_status
  is_overseas_filipino_worker: boolean; // Manual - Overseas Filipino Worker
  is_person_with_disability: boolean; // Manual - Person with Disability
  is_out_of_school_children: boolean; // Auto from age + education (5-17)
  is_out_of_school_youth: boolean; // Auto from age + education + employment (18-30)
  is_senior_citizen: boolean; // Auto from age (60+)
  is_registered_senior_citizen: boolean; // Manual, conditional on is_senior_citizen
  is_solo_parent: boolean; // Manual
  is_indigenous_people: boolean; // Auto from ethnicity
  is_migrant: boolean; // Manual
}

// Context data needed for auto-calculations
export interface SectoralContext {
  age?: number;
  birthdate?: string;
  employment_status?: string;
  highest_educational_attainment?: string;
  marital_status?: string;
  ethnicity?: string;
}

interface SectoralClassificationsProps {
  readonly value: SectoralInformation;
  readonly onChange: (sectoral: SectoralInformation) => void;
  readonly context: SectoralContext;
  readonly mode?: FormMode;
  readonly disabled?: boolean;
}

// Employment statuses that qualify as labor force (aligned with database)
const LABOR_FORCE_STATUSES = [
  'employed',
  'self_employed',
  'unemployed',
  'looking_for_work',
  'underemployed',
];

const EMPLOYED_STATUSES = ['employed', 'self_employed'];

const UNEMPLOYED_STATUSES = ['unemployed', 'looking_for_work'];

export default function SectoralClassifications({
  value,
  onChange,
  context,
  mode = 'create',
  disabled = false,
}: SectoralClassificationsProps) {
  const [autoCalculated, setAutoCalculated] = useState({
    is_labor_force: false,
    is_labor_force_employed: false,
    is_unemployed: false,
    is_out_of_school_children: false,
    is_out_of_school_youth: false,
    is_senior_citizen: false,
    is_indigenous_people: false,
  });

  // Auto-calculate sectoral flags based on context
  useEffect(() => {
    const age = context.age || (context.birthdate ? calculateAge(context.birthdate) : 0);
    const employment = context.employment_status || '';
    const ethnicity = context.ethnicity || '';

    const calculated = {
      is_labor_force: LABOR_FORCE_STATUSES.includes(employment),
      is_labor_force_employed: EMPLOYED_STATUSES.includes(employment),
      is_unemployed: UNEMPLOYED_STATUSES.includes(employment),
      is_out_of_school_children: isOutOfSchoolChildren(age, context.highest_educational_attainment),
      is_out_of_school_youth: isOutOfSchoolYouth(
        age,
        context.highest_educational_attainment,
        employment
      ),
      is_senior_citizen: age >= 60,
      is_indigenous_people: isIndigenousPeople(ethnicity),
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
    context.ethnicity,
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
      <div className="space-y-6">

        {/* Auto-Calculated Flags (Read-only) */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Auto-Calculated Classifications</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Classifications automatically determined by system based on age, employment, and education data
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ControlField
              label="Labor Force"
              helperText="Part of the labor force (employed, unemployed, looking for work)"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: autoCalculated.is_labor_force,
                disabled: true,
                size: 'md',
                description: autoCalculated.is_labor_force ? "Member of workforce" : "Not in workforce"
              }}
            />
            <ControlField
              label="Labor Force Employed"
              helperText="Currently employed (employed, self-employed)"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: autoCalculated.is_labor_force_employed,
                disabled: true,
                size: 'md',
                description: autoCalculated.is_labor_force_employed ? "Currently employed" : "Not employed"
              }}
            />
            <ControlField
              label="Unemployed"
              helperText="Unemployed but looking for work"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: autoCalculated.is_unemployed,
                disabled: true,
                size: 'md',
                description: autoCalculated.is_unemployed ? "Seeking employment" : "Not job hunting"
              }}
            />
            <ControlField
              label="Out-of-School Children"
              helperText="Ages 5-17, not attending school"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: autoCalculated.is_out_of_school_children,
                disabled: true,
                size: 'md',
                description: autoCalculated.is_out_of_school_children ? "Not enrolled in school" : "Attending school"
              }}
            />
            <ControlField
              label="Out-of-School Youth"
              helperText="Ages 18-30, not in school/employed"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: autoCalculated.is_out_of_school_youth,
                disabled: true,
                size: 'md',
                description: autoCalculated.is_out_of_school_youth ? "Neither studying nor working" : "In school or employed"
              }}
            />
            <ControlField
              label="Senior Citizen"
              helperText="Age 60 and above"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: autoCalculated.is_senior_citizen,
                disabled: true,
                size: 'md',
                description: autoCalculated.is_senior_citizen ? "60+ years old" : "Below 60 years old"
              }}
            />
            <ControlField
              label="Indigenous People"
              helperText="Based on ethnicity selection"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: autoCalculated.is_indigenous_people,
                disabled: true,
                size: 'md',
                description: autoCalculated.is_indigenous_people ? "Indigenous community member" : "Non-indigenous"
              }}
            />
          </div>
        </div>

        {/* Manual Classifications */}
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Manual Classifications</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Classifications that require manual verification or input
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ControlField
              label="Overseas Filipino Worker (OFW)"
              helperText="Currently working abroad"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: value.is_overseas_filipino_worker,
                onChange: handleFlagChange('is_overseas_filipino_worker'),
                disabled: disabled,
                size: 'md',
                description: value.is_overseas_filipino_worker ? "Working abroad" : "Working locally"
              }}
            />
            <ControlField
              label="Person with Disability (PWD)"
              helperText="Has physical, mental, or sensory disability"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: value.is_person_with_disability,
                onChange: handleFlagChange('is_person_with_disability'),
                disabled: disabled,
                size: 'md',
                description: value.is_person_with_disability ? "Has disability" : "No disability"
              }}
            />
            <ControlField
              label="Solo Parent"
              helperText="Single parent raising children alone"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: value.is_solo_parent,
                onChange: handleFlagChange('is_solo_parent'),
                disabled: disabled,
                size: 'md',
                description: value.is_solo_parent ? "Single parent" : "Not solo parent"
              }}
            />
            <ControlField
              label="Migrant"
              helperText="Recently moved to this barangay"
              mode={mode}
              controlProps={{
                type: 'checkbox',
                checked: value.is_migrant,
                onChange: handleFlagChange('is_migrant'),
                disabled: disabled,
                size: 'md',
                description: value.is_migrant ? "New barangay resident" : "Long-time resident"
              }}
            />
            {/* Conditional: Registered Senior Citizen */}
            {value.is_senior_citizen && (
              <ControlField
                label="Registered Senior Citizen"
                helperText="Officially registered with OSCA"
                mode={mode}
                controlProps={{
                  type: 'checkbox',
                  checked: value.is_registered_senior_citizen,
                  onChange: handleFlagChange('is_registered_senior_citizen'),
                  disabled: disabled,
                  size: 'md',
                  description: value.is_registered_senior_citizen ? "Has OSCA registration" : "Not registered with OSCA"
                }}
              />
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Classification Summary</h4>
          <div className="text-xs text-gray-700 dark:text-gray-300">
            <span className="font-medium">Active Classifications:</span>{' '}
            {(() => {
              const allClassifications = { ...autoCalculated, ...value };
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

// Types already exported in index.ts to avoid conflicts