'use client';

import React from 'react';


import { CheckboxGroup } from '@/components/atoms/Field/Control/Checkbox/Checkbox';
import { RadioGroup } from '@/components/atoms/Field/Control/Radio/Radio';
import { Label } from '@/components/atoms/Field/Label/Label';
import { SkeletonInput } from '@/components/atoms/Skeleton/SkeletonVariants';
import { cn } from '@/components/shared/utils';
import type { FormMode } from '@/types/app/ui/forms';

import { ControlGroup } from './ControlField/ControlField';
import { ReadOnlyField } from './ReadOnlyField/ReadOnlyField';

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

  // Loading states
  /** Loading state for skeleton display */
  loading?: boolean;

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
  loading = false,
  checkboxValue,
  onCheckboxChange,
  radioValue,
  onRadioChange,
  radioName,
}: ControlFieldSetProps) => {
  // Debug logging for sex field
  if (label?.includes('Sex')) {
    console.log('🔍 ControlFieldSet Loading for', label, {
      loading,
      mode,
      type
    });
  }

  // Show skeleton loading if loading is true
  if (loading) {
    // Use horizontal orientation in view mode, otherwise use the specified orientation
    const loadingOrientation = mode === 'view' ? 'horizontal' : orientation;
    const isHorizontal = loadingOrientation === 'horizontal';

    return (
      <div className={cn('w-full', isHorizontal ? 'flex items-start space-x-4' : '', className)}>
        {/* Label */}
        {label && (
          <div className={cn(isHorizontal ? 'w-56 shrink-0 pt-2' : 'mb-1')}>
            <Label size={labelSize}>{label}</Label>
            {description && !isHorizontal && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}

        {/* Field Container */}
        <div className={cn(isHorizontal ? 'flex-1 min-w-0' : '')}>
          {/* Skeleton Input */}
          <SkeletonInput />
          {description && isHorizontal && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    );
  }
  // Helper function to format values for display in view mode
  const formatDisplayValue = (value: string[] | string | undefined) => {
    if (!value) return '—';
    
    // Extract labels from children to show proper display values instead of raw values
    const childLabels = new Map<string, string>();
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as any;
        const childValue = childProps.value;
        const childLabel = childProps.label;
        if (childValue && childLabel) {
          childLabels.set(childValue, childLabel);
        }
      }
    });
    
    if (Array.isArray(value)) {
      if (value.length === 0) return '—';
      // Map checkbox values to their labels
      const labels = value.map(val => childLabels.get(val) || val);
      return labels.join(', ');
    }
    
    // Map single radio value to its label
    return childLabels.get(value) || value || '—';
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
        orientation="horizontal"
        className={className}
        readOnlyProps={{
          value: formatDisplayValue(displayValue),
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
            {label && <Label size={labelSize}>{label}</Label>}
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}
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
