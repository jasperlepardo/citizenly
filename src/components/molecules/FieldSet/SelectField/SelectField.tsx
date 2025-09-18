'use client';

import React from 'react';

// Simple inline utility (replacing deleted cssUtils)
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');
import type { FormMode } from '@/types/app/ui/forms';
// Simple inline ID utilities (replacing deleted idGenerators)
const getFieldId = (base: string = 'select-field') => `field-${base.replace(/[^a-zA-Z0-9]/g, '-')}`;
const getFieldIds = (fieldId: string) => ({
  fieldId,
  helperTextId: `${fieldId}-helper`,
  errorId: `${fieldId}-error`
});
const buildAriaDescribedBy = (helperId?: string, errorId?: string) => [helperId, errorId].filter(Boolean).join(' ') || undefined;
const buildAriaLabelledBy = (labelId?: string) => labelId;

import { Label, HelperText, ReadOnly } from '@/components/atoms/Field';
import { Select, SelectProps } from '@/components/atoms/Field/Select';
import { SkeletonInput } from '@/components/atoms/Skeleton';
import { Spinner } from '@/components/atoms/Spinner';

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
  /** Enable multiline display in view mode for long text */
  multiline?: boolean;
  // Loading states
  loading?: boolean;           // Field data loading
  optionsLoading?: boolean;    // Options list loading
  globalLoading?: boolean;
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
  multiline = false,
  loading = false,
  optionsLoading = false,
  globalLoading = false,
  selectProps,
  labelProps,
}: SelectFieldProps) => {
  const isHorizontal = orientation === 'horizontal';
  const isLoading = loading || globalLoading;

  if (label?.includes('Civil Status')) {
    console.log('🔍 SelectField Loading for', label, {
      loading,
      globalLoading,
      isLoading,
      mode
    });
  }
  const hasOptions = selectProps?.options && selectProps.options.length > 0;

  const getLabelWidthClass = (width: 'sm' | 'md' | 'lg') => {
    const widthClasses = {
      sm: 'w-48', // 192px (increased from 128px)
      md: 'w-56', // 224px (increased from 160px)
      lg: 'w-64', // 256px (increased from 192px)
    };
    return widthClasses[width];
  };

  // Generate deterministic field ID
  const baseId = htmlFor || selectProps?.id || label?.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-') || 'select-field';
  const fieldId = getFieldId(baseId);
  const { helperTextId, errorId } = getFieldIds(fieldId);

  // Use errorMessage as the select error if provided
  const selectError = errorMessage || selectProps?.error;
  const hasHelperText = helperText || errorMessage;

  // Build ARIA attributes for accessibility
  const labelId = `${fieldId}-label`;
  const ariaLabelledBy = buildAriaLabelledBy(label ? labelId : undefined);
  const ariaDescribedByString = buildAriaDescribedBy(
    helperText ? helperTextId : undefined,
    selectError ? errorId : undefined
  );

  return (
    <div className={cn('w-full', isHorizontal ? 'flex items-start space-x-4' : '', className)}>
      {/* Label */}
      {label && (
        <div
          className={cn(isHorizontal ? `${getLabelWidthClass(labelWidth)} shrink-0 pt-2` : 'mb-1')}
        >
          <Label htmlFor={fieldId} required={required} size={labelSize} {...labelProps} id={labelId}>
            {label}
          </Label>
        </div>
      )}

      {/* Field Container */}
      <div className={cn(isHorizontal ? 'flex-1' : '')}>
        {/* Select/Field */}
        <div>
          {isLoading ? (
            <SkeletonInput />
          ) : mode === 'view' ? (
            selectProps ? (
              <ReadOnly
                id={fieldId}
                multiline={multiline}
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
            <div className="relative">
              <Select
                {...selectProps}
                id={fieldId}
                error={selectError}
                disabled={optionsLoading || loading}
                placeholder={
                  optionsLoading
                    ? "Loading options..."
                    : selectProps.placeholder || "Select an option..."
                }
              />
              {optionsLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
          ) : (
            (() => {
              if (React.isValidElement(children)) {
                return React.cloneElement(children as React.ReactElement<any>, {
                  id: fieldId,
                  'aria-labelledby': ariaLabelledBy,
                  'aria-describedby': ariaDescribedByString,
                  error: selectError,
                  disabled: optionsLoading || loading,
                });
              }
              return children;
            })()
          )}
        </div>

        {/* Helper Text and Error Messages */}
        {hasHelperText && !isLoading && (
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
