'use client';

import React from 'react';
import { cn } from '@/lib';
import { getFieldId, getFieldIds, buildAriaDescribedBy, buildAriaLabelledBy } from '@/lib/utilities/id-generators';
import { Label, ReadOnly, HelperText } from '../../../atoms/Field';

export interface ReadOnlyFieldProps {
  children?: React.ReactNode;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  labelWidth?: 'sm' | 'md' | 'lg';
  htmlFor?: string;
  labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  // ReadOnly component props (when used directly with ReadOnly)
  readOnlyProps?: React.ComponentProps<typeof ReadOnly>;
  // Label component props
  labelProps?: Omit<React.ComponentProps<typeof Label>, 'htmlFor' | 'required' | 'children' | 'size'>;
}

export const ReadOnlyField = ({
  children,
  label,
  required = false,
  helperText,
  errorMessage,
  className,
  orientation = 'vertical',
  labelWidth = 'md',
  htmlFor,
  labelSize = 'sm',
  readOnlyProps,
  labelProps,
}: ReadOnlyFieldProps) => {
  const isHorizontal = orientation === 'horizontal';
  
  // Generate secure unique ID if not provided
  const fieldId = getFieldId(htmlFor, readOnlyProps?.id, 'readonly-field');
  const { labelId, helperTextId, errorId } = getFieldIds(fieldId);
  
  const hasHelperText = helperText || errorMessage;
  
  // Build ARIA attributes for accessibility
  const ariaLabelledBy = buildAriaLabelledBy(label ? labelId : undefined);
  const ariaDescribedByString = buildAriaDescribedBy(
    helperText ? helperTextId : undefined,
    errorMessage ? errorId : undefined
  );

  const getLabelWidthClass = (width: 'sm' | 'md' | 'lg') => {
    const widthClasses = {
      sm: 'w-32', // 128px
      md: 'w-40', // 160px  
      lg: 'w-48', // 192px
    };
    return widthClasses[width];
  };

  return (
    <div className={cn('w-full', isHorizontal && 'flex items-start space-x-4', className)}>
      {/* Label */}
      {label && (
        <div className={cn(
          isHorizontal ? `${getLabelWidthClass(labelWidth)} shrink-0 pt-2` : 'mb-1'
        )}>
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
      <div className={cn(isHorizontal && 'flex-1 min-w-0')}>
        {/* ReadOnly Field */}
        <div>
          {readOnlyProps ? (
            <ReadOnly
              id={fieldId}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedByString}
              {...readOnlyProps}
            />
          ) : (
            (() => {
              if (React.isValidElement(children)) {
                return React.cloneElement(children as React.ReactElement<any>, {
                  id: fieldId,
                  'aria-labelledby': ariaLabelledBy,
                  'aria-describedby': ariaDescribedByString,
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

export default ReadOnlyField;