'use client';

/**
 * SectoralClassifications Component - RBI Sectoral Group Classification
 * Manages sectoral flags with auto-calculation and manual overrides
 * Integrates with age, employment status, and education data
 */

import React, { useEffect, useMemo, useRef } from 'react';

import { ControlField } from '@/components';
import { calculateSectoralFlags } from '@/services/domain/residents/residentClassification';
import type { FormMode, SectoralInformation, SectoralContext } from '@/types';

interface SectoralClassificationsProps {
  readonly value: SectoralInformation;
  readonly onChange: (sectoral: SectoralInformation) => void;
  readonly context: SectoralContext;
  readonly mode?: FormMode;
  readonly disabled?: boolean;
}

export default function SectoralClassifications({
  value,
  onChange,
  context,
  mode = 'create',
  disabled = false,
}: SectoralClassificationsProps) {
  console.log('🔍 SectoralClassifications: Rendering with value:', value);
  console.log('🔍 SectoralClassifications: Context:', context);
  console.log('🔍 SectoralClassifications: Props check:', {
    mode,
    disabled,
    hasOnChange: typeof onChange === 'function',
    onChangeType: typeof onChange
  });

  // Special debug for indigenous people
  console.log('🎯 SectoralClassifications: Indigenous People status:', {
    current_value: value.is_indigenous_people,
    context_ethnicity: context.ethnicity,
    should_be_indigenous: context.ethnicity === 'badjao' ? 'YES' : 'NO'
  });
  
  // Calculate the expected sectoral flags based on context
  const calculatedFlags = useMemo(() => {
    const flags = calculateSectoralFlags(context);
    console.log('🔍 SectoralClassifications: Calculated flags:', flags);
    return flags;
  }, [context]);

  // Use a ref to track if we've already updated for these calculated flags
  const lastUpdateRef = useRef<string>('');

  // Auto-update sectoral flags in edit mode only
  useEffect(() => {
    // Only auto-update in edit mode when user is actively editing
    if (mode === 'edit' && !disabled) {
      console.log('🔍 SectoralClassifications: Auto-update checking - edit mode');

      // Check if calculated values differ from current values
      const needsUpdate =
        value.is_labor_force_employed !== calculatedFlags.is_labor_force_employed ||
        value.is_unemployed !== calculatedFlags.is_unemployed ||
        value.is_out_of_school_children !== calculatedFlags.is_out_of_school_children ||
        value.is_out_of_school_youth !== calculatedFlags.is_out_of_school_youth ||
        value.is_senior_citizen !== calculatedFlags.is_senior_citizen ||
        value.is_indigenous_people !== calculatedFlags.is_indigenous_people;

      console.log('🔍 SectoralClassifications: needsUpdate:', needsUpdate);

      if (needsUpdate) {
        console.log('🔍 SectoralClassifications: Auto-updating for edit mode');
        const updatedSectoral = {
          ...value,
          ...calculatedFlags,
          // Keep registered senior citizen if still senior
          is_registered_senior_citizen: calculatedFlags.is_senior_citizen
            ? value.is_registered_senior_citizen
            : false,
        };
        onChange(updatedSectoral);
      }
    }
  }, [calculatedFlags, value, mode, disabled, onChange]);

  // Auto-calculation logic delegated to centralized business rules

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
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Auto-Calculated Classifications
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Classifications automatically determined by system based on age, employment, and
            education data
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ControlField
            label="Labor Force Employed"
            helperText="Currently employed (employed, self-employed)"
            mode={mode}
            controlProps={{
              type: 'checkbox',
              checked: value.is_labor_force_employed,
              disabled: true,
              size: 'md',
              description: value.is_labor_force_employed ? 'Currently employed' : 'Not employed',
            }}
          />
          <ControlField
            label="Unemployed"
            helperText="Unemployed but looking for work"
            mode={mode}
            controlProps={{
              type: 'checkbox',
              checked: value.is_unemployed,
              disabled: true,
              size: 'md',
              description: value.is_unemployed ? 'Seeking employment' : 'Not job hunting',
            }}
          />
          <ControlField
            label="Out-of-School Children"
            helperText="Ages 5-17, not attending school"
            mode={mode}
            controlProps={{
              type: 'checkbox',
              checked: value.is_out_of_school_children,
              disabled: true,
              size: 'md',
              description: value.is_out_of_school_children
                ? 'Not enrolled in school'
                : 'Attending school',
            }}
          />
          <ControlField
            label="Out-of-School Youth"
            helperText="Ages 18-30, not in school/employed"
            mode={mode}
            controlProps={{
              type: 'checkbox',
              checked: value.is_out_of_school_youth,
              disabled: true,
              size: 'md',
              description: value.is_out_of_school_youth
                ? 'Neither studying nor working'
                : 'In school or employed',
            }}
          />
          <ControlField
            label="Senior Citizen"
            helperText="Age 60 and above"
            mode={mode}
            controlProps={{
              type: 'checkbox',
              checked: value.is_senior_citizen,
              disabled: true,
              size: 'md',
              description: value.is_senior_citizen ? '60+ years old' : 'Below 60 years old',
            }}
          />
          <ControlField
            label="Indigenous People"
            helperText="Based on ethnicity selection"
            mode={mode}
            controlProps={{
              type: 'checkbox',
              checked: value.is_indigenous_people,
              disabled: true,
              size: 'md',
              description: value.is_indigenous_people
                ? 'Indigenous community member'
                : 'Non-indigenous',
            }}
          />
        </div>
      </div>

      {/* Manual Classifications */}
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Manual Classifications
          </h4>
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
              description: value.is_overseas_filipino_worker ? 'Working abroad' : 'Working locally',
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
              description: value.is_person_with_disability ? 'Has disability' : 'No disability',
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
              description: value.is_solo_parent ? 'Single parent' : 'Not solo parent',
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
              description: value.is_migrant ? 'New barangay resident' : 'Long-time resident',
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
                description: value.is_registered_senior_citizen
                  ? 'Has OSCA registration'
                  : 'Not registered with OSCA',
              }}
            />
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          Classification Summary
        </h4>
        <div className="text-xs text-gray-700 dark:text-gray-300">
          <span className="font-medium">Active Classifications:</span>{' '}
          {(() => {
            return (
              Object.entries(value)
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
