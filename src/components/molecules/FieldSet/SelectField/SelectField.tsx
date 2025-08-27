'use client';

import React from 'react';

import { cn } from '@/lib';
import {
  getFieldId,
  getFieldIds,
  buildAriaDescribedBy,
  buildAriaLabelledBy,
} from '@/utils/id-generators';
import type { FormMode } from '@/types';

import { Label, HelperText, ReadOnly } from '../../../atoms/Field';
import { Select, SelectProps } from '../../../atoms/Field/Select';

export interface SelectFieldProps {
  children?: React.ReactNode;
  /** Form mode - determines if field is editable or read-only */
  mode?: FormMode;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  labelWidth?: 'sm' | 'md' | 'lg';
  htmlFor?: string;
  labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  // Select component props (when used directly with Select)
  selectProps?: SelectProps;
  // Label component props
  labelProps?: Omit<
    React.ComponentProps<typeof Label>,
    'htmlFor' | 'required' | 'children' | 'size'
  >;
}

export const SelectField = ({
  children,
  mode = 'create',
  label,
  required = false,
  helperText,
  errorMessage,
  className,
  orientation = 'vertical',
  labelWidth = 'md',
  htmlFor,
  labelSize = 'sm',
  selectProps,
  labelProps,
}: SelectFieldProps) => {
  const isHorizontal = orientation === 'horizontal';

  const getLabelWidthClass = (width: 'sm' | 'md' | 'lg') => {
    const widthClasses = {
      sm: 'w-32', // 128px
      md: 'w-40', // 160px
      lg: 'w-48', // 192px
    };
    return widthClasses[width];
  };

  // Generate unique field ID using utility function
  const fieldId = getFieldId(htmlFor, selectProps?.id, 'select-field');
  const { labelId, helperTextId, errorId } = getFieldIds(fieldId);

  // Use errorMessage as the select error if provided
  const selectError = errorMessage || selectProps?.error;
  const hasHelperText = helperText || errorMessage;

  // Build ARIA attributes for accessibility
  const ariaLabelledBy = buildAriaLabelledBy(label ? labelId : undefined);
  const ariaDescribedByString = buildAriaDescribedBy(
    helperText ? helperTextId : undefined,
    selectError ? errorId : undefined
  );

  return (
    <div className={cn('w-full', isHorizontal && 'flex items-start space-x-4', className)}>
      {/* Label */}
      {label && (
        <div
          className={cn(isHorizontal ? `${getLabelWidthClass(labelWidth)} shrink-0 pt-2` : 'mb-1')}
        >
          <Label htmlFor={fieldId} required={required} size={labelSize} {...labelProps}>
            {label}
          </Label>
        </div>
      )}

      {/* Field Container */}
      <div className={cn(isHorizontal && 'flex-1')}>
        {/* Select/Field */}
        <div>
          {mode === 'view' ? (
            selectProps ? (
              <ReadOnly
                id={fieldId}
                value={(() => {
                  if (!selectProps.value) return '—';
                  // Find the matching option and return its label
                  const matchingOption = selectProps.options?.find(
                    option => option.value === selectProps.value
                  );
                  return matchingOption
                    ? matchingOption.label
                    : selectProps.value?.toString() || '—';
                })()}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedByString}
              />
            ) : React.isValidElement(children) ? (
              React.cloneElement(children as React.ReactElement<any>, {
                id: fieldId,
                'aria-labelledby': ariaLabelledBy,
                'aria-describedby': ariaDescribedByString,
                mode: 'view',
              })
            ) : (
              children
            )
          ) : selectProps ? (
            <Select {...selectProps} id={fieldId} error={selectError} />
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
          <div className="mt-1 space-y-1">
            {/* Helper Text */}
            {helperText && <HelperText id={helperTextId}>{helperText}</HelperText>}

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
