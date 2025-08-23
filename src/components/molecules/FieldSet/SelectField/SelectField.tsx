'use client';

import React from 'react';
import { cn } from '@/lib/utilities/css-utils';
import { Label, HelperText } from '../../../atoms/Field';
import { Select, SelectProps } from '../../../atoms/Field/Select';

export interface SelectFieldProps {
  children?: React.ReactNode;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  labelWidth?: string;
  htmlFor?: string;
  labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  // Select component props (when used directly with Select)
  selectProps?: SelectProps;
  // Label component props
  labelProps?: Omit<React.ComponentProps<typeof Label>, 'htmlFor' | 'required' | 'children' | 'size'>;
}

export const SelectField = ({
  children,
  label,
  required = false,
  helperText,
  errorMessage,
  className,
  orientation = 'vertical',
  labelWidth = 'w-32',
  htmlFor,
  labelSize = 'md',
  selectProps,
  labelProps,
}: SelectFieldProps) => {
  const isHorizontal = orientation === 'horizontal';
  
  // Generate unique ID if not provided
  const fieldId = htmlFor || selectProps?.id || `field-${Math.random().toString(36).substring(2, 11)}`;
  const labelId = `${fieldId}-label`;
  const helperTextId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  
  // Use errorMessage as the select error if provided
  const selectError = errorMessage || selectProps?.error;
  const hasHelperText = helperText || errorMessage;
  
  // Build aria-labelledby and aria-describedby for accessibility
  const ariaLabelledBy = label ? labelId : undefined;
  
  const ariaDescribedBy = [];
  if (helperText) ariaDescribedBy.push(helperTextId);
  if (errorMessage) ariaDescribedBy.push(errorId);
  const ariaDescribedByString = ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined;

  return (
    <div className={cn('w-full', isHorizontal && 'flex items-start space-x-4', className)}>
      {/* Label */}
      {label && (
        <div className={cn(isHorizontal ? `${labelWidth} shrink-0 pt-2` : 'mb-1')}>
          <Label
            htmlFor={fieldId}
            required={required}
            size={labelSize}
            {...labelProps}
          >
            {label}
          </Label>
        </div>
      )}

      {/* Field Container */}
      <div className={cn(isHorizontal && 'flex-1')}>
        {/* Select/Field */}
        <div>
          {selectProps ? (
            <Select
              {...selectProps}
              id={fieldId}
              error={selectError}
            />
          ) : (
            (() => {
              if (React.isValidElement(children)) {
                return React.cloneElement(children as React.ReactElement<any>, {
                  id: fieldId,
                  'aria-labelledby': ariaLabelledBy,
                  'aria-describedby': ariaDescribedByString,
                  error: selectError,
                });
              }
              return children;
            })()
          )}
        </div>

        {/* Helper Text and Error Messages */}
        {hasHelperText && (
          <div className="space-y-1">
            {/* Helper Text */}
            {helperText && (
              <HelperText id={helperTextId}>
                {helperText}
              </HelperText>
            )}
            
            {/* Error Message */}
            {errorMessage && (
              <HelperText id={errorId} error>
                {errorMessage}
              </HelperText>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Note: Form and FormGroup are exported from InputField to avoid conflicts