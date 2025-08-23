'use client';

import React from 'react';
import { cn } from '@/lib/utilities/css-utils';
import { Label, HelperText } from '../../../atoms/Field';
import { Control } from '../../../atoms/Field/Control/Control';
import { getFieldId, getFieldIds, buildAriaDescribedBy, buildAriaLabelledBy } from '@/lib/utilities/id-generators';

export interface ControlFieldProps {
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
  // Control component props (when used directly with Control)
  controlProps?: React.ComponentProps<typeof Control>;
  // Label component props
  labelProps?: Omit<React.ComponentProps<typeof Label>, 'htmlFor' | 'required' | 'children' | 'size'>;
  // Toggle-specific props
  toggleText?: {
    checked: string;
    unchecked: string;
  };
}

export const ControlField = ({
  children,
  label,
  required = false,
  helperText,
  errorMessage,
  className,
  orientation = 'vertical',
  labelWidth = 'md',
  htmlFor,
  labelSize = 'md',
  controlProps,
  labelProps,
  toggleText,
}: ControlFieldProps) => {
  const isHorizontal = orientation === 'horizontal';
  
  // Generate unique field ID using utility function
  const fieldId = getFieldId(htmlFor, controlProps?.id, 'control-field');
  const { labelId, helperTextId, errorId } = getFieldIds(fieldId);
  
  // Use errorMessage as the control error if provided (errorMessage takes precedence)
  const controlError = errorMessage || controlProps?.errorMessage;
  const hasHelperText = helperText || errorMessage;
  
  // Build ARIA attributes for accessibility
  const ariaLabelledBy = buildAriaLabelledBy(label ? labelId : undefined);
  const ariaDescribedBy = buildAriaDescribedBy(
    helperText ? helperTextId : undefined,
    controlError ? errorId : undefined
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
    <div className={cn('w-full', isHorizontal ? 'flex items-start gap-3' : 'flex flex-col', className)}>
      {/* Label */}
      {label && (
        <div className={cn(
          'flex items-start',
          isHorizontal ? `${getLabelWidthClass(labelWidth)} shrink-0 pt-1.5` : 'mb-2'
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
      <div className={cn('flex-1', isHorizontal ? 'min-w-0' : 'flex flex-col')}>
        {/* Control/Field */}
        <div>
          {controlProps ? (
            <Control
              id={fieldId}
              errorMessage={controlError}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy || (toggleText ? `${fieldId}-description` : undefined)}
              description={
                controlProps.type === 'toggle' && toggleText
                  ? (controlProps.checked ? toggleText.checked : toggleText.unchecked)
                  : controlProps.description
              }
              {...controlProps}
            />
          ) : (
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  id: fieldId,
                  'aria-labelledby': ariaLabelledBy,
                  'aria-describedby': ariaDescribedBy,
                });
              }
              return child;
            })
          )}
        </div>

        {/* Helper Text and Error Messages */}
        {hasHelperText && (
          <div className="flex flex-col gap-2 mt-1">
            {/* Helper Text */}
            {helperText && (
              <HelperText id={helperTextId}>
                {helperText}
              </HelperText>
            )}
            
            {/* Error Message with aria-live for screen reader announcements */}
            {errorMessage && (
              <HelperText id={errorId} error aria-live="polite" aria-atomic="true">
                {errorMessage}
              </HelperText>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Control Group for organizing multiple controls
export interface ControlGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
}

export const ControlGroup = ({
  children,
  title,
  description,
  className,
  spacing = 'md',
  orientation = 'vertical',
}: ControlGroupProps) => {
  const getSpacingClass = (spacing: 'sm' | 'md' | 'lg') => {
    const spacingMap = {
      sm: '2',
      md: '4', 
      lg: '6'
    };
    return spacingMap[spacing];
  };

  const spacingClass = getSpacingClass(spacing);
  const orientationClass = orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap';

  return (
    <div className={cn('w-full', className)}>
      {/* Title and Description */}
      {(title || description) && (
        <div className="mb-3">
          {title && <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      )}

      {/* Controls */}
      <div className={cn('flex', orientationClass, `gap-${spacingClass}`)}>{children}</div>
    </div>
  );
};