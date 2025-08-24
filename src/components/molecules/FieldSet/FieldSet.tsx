'use client';

import React from 'react';
import { cn } from '@/lib/utilities/css-utils';
import { CheckboxGroup } from '../../atoms/Field/Control/Checkbox/Checkbox';
import { RadioGroup } from '../../atoms/Field/Control/Radio/Radio';
import { ControlGroup } from './ControlField/ControlField';
import { Label } from '../../atoms/Field/Label/Label';
import { ReadOnlyField } from './ReadOnlyField/ReadOnlyField';
import type { FormMode } from '@/types/forms';

export interface ControlFieldSetProps {
  /** Type of fieldset - checkbox for multiple selections, radio for single selection */
  type: 'checkbox' | 'radio';
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  /** Field label */
  label?: string;
  /** Label size variant */
  labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Helper text */
  description?: string;
  /** Error message */
  errorMessage?: string;
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Spacing between items */
  spacing?: 'sm' | 'md' | 'lg';
  /** CSS classes */
  className?: string;
  /** Child components (Checkbox or Radio components) */
  children: React.ReactNode;
  
  // Checkbox-specific props
  /** Selected values for checkboxes */
  checkboxValue?: string[];
  /** Change handler for checkboxes */
  onCheckboxChange?: (value: string[]) => void;
  
  // Radio-specific props
  /** Selected value for radio group */
  radioValue?: string;
  /** Change handler for radio group */
  onRadioChange?: (value: string) => void;
  /** Name for radio group (required for radio type) */
  radioName?: string;
}

export const ControlFieldSet = ({
  type,
  mode = 'create',
  label,
  labelSize = 'sm',
  description,
  errorMessage,
  orientation = 'vertical',
  spacing = 'md',
  className,
  children,
  checkboxValue,
  onCheckboxChange,
  radioValue,
  onRadioChange,
  radioName,
}: ControlFieldSetProps) => {

  // Helper function to format values for display in view mode
  const formatDisplayValue = (value: string[] | string | undefined) => {
    if (!value) return '—';
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '—';
    }
    return value || '—';
  };

  // If in view mode, render as ReadOnlyField
  if (mode === 'view') {
    const displayValue = type === 'checkbox' ? checkboxValue : radioValue;
    return (
      <ReadOnlyField
        label={label}
        helperText={description}
        errorMessage={errorMessage}
        labelSize={labelSize}
        className={className}
        readOnlyProps={{
          value: formatDisplayValue(displayValue)
        }}
      />
    );
  }

  if (type === 'checkbox') {
    return (
      <div className={cn('w-full', className)}>
        <ControlGroup
          title={label}
          description={description}
          orientation={orientation}
          spacing={spacing}
        >
          <CheckboxGroup
            value={checkboxValue}
            onChange={onCheckboxChange}
            errorMessage={errorMessage}
            orientation={orientation}
          >
            {children}
          </CheckboxGroup>
        </ControlGroup>
      </div>
    );
  }

  if (type === 'radio') {
    if (!radioName) {
      console.warn('FieldSet: radioName is required for radio type');
      return null;
    }

    return (
      <div className={cn('w-full', className)}>
        {/* Label and Description */}
        {(label || description) && (
          <div className="mb-1">
            {label && (
              <Label size={labelSize}>
                {label}
              </Label>
            )}
            {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
          </div>
        )}
        
        {/* Radio Group */}
        <RadioGroup
          name={radioName}
          value={radioValue}
          onChange={onRadioChange}
          errorMessage={errorMessage}
          orientation={orientation}
        >
          {children}
        </RadioGroup>
      </div>
    );
  }

  return null;
};

export default ControlFieldSet;