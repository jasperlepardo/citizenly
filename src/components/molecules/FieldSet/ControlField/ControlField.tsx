'use client';

import React from 'react';

// Simple inline utility (replacing deleted cssUtils)
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');
// Simple inline ID utilities (replacing deleted idGenerators)
const getFieldId = (base: string = 'control-field') => `field-${base.replace(/[^a-zA-Z0-9]/g, '-')}`;
const getFieldIds = (fieldId: string) => ({
  fieldId,
  helperTextId: `${fieldId}-helper`,
  errorId: `${fieldId}-error`
});
const buildAriaDescribedBy = (helperId?: string, errorId?: string) => [helperId, errorId].filter(Boolean).join(' ') || undefined;
const buildAriaLabelledBy = (labelId?: string) => labelId;

import { Control } from '@/components/atoms/Field/Control/Control';
import { HelperText } from '@/components/atoms/Field/HelperText/HelperText';
import { Label } from '@/components/atoms/Field/Label/Label';
import { ReadOnly } from '@/components/atoms/Field/ReadOnly/ReadOnly';
import { SkeletonInput } from '@/components/atoms/Skeleton/SkeletonVariants';
import type { FormMode } from '@/types/app/ui/forms';

export interface ControlFieldProps {
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
  // Control component props (when used directly with Control)
  controlProps?: React.ComponentProps<typeof Control>;
  // Label component props
  labelProps?: Omit<
    React.ComponentProps<typeof Label>,
    'htmlFor' | 'required' | 'children' | 'size'
  >;
  // Toggle-specific props
  toggleText?: {
    checked: string;
    unchecked: string;
  };
  // Loading state
  loading?: boolean;
}

export const ControlField = ({
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
  controlProps,
  labelProps,
  toggleText,
  loading = false,
}: ControlFieldProps) => {
  const isHorizontal = orientation === 'horizontal';

  // Generate deterministic field ID
  const baseId = htmlFor || controlProps?.id || label?.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-') || 'control-field';
  const fieldId = getFieldId(baseId);
  const { helperTextId, errorId } = getFieldIds(fieldId);

  // Use errorMessage as the control error if provided (errorMessage takes precedence)
  const controlError = errorMessage || controlProps?.errorMessage;
  const hasHelperText = helperText || errorMessage;

  // Build ARIA attributes for accessibility
  const labelId = `${fieldId}-label`;
  const ariaLabelledBy = buildAriaLabelledBy(label ? labelId : undefined);
  const ariaDescribedBy = buildAriaDescribedBy(
    helperText ? helperTextId : undefined,
    controlError ? errorId : undefined
  );

  const getLabelWidthClass = (width: 'sm' | 'md' | 'lg') => {
    const widthClasses = {
      sm: 'w-48', // 192px (increased from 128px)
      md: 'w-56', // 224px (increased from 160px)
      lg: 'w-64', // 256px (increased from 192px)
    };
    return widthClasses[width];
  };

  // Show skeleton loading if loading is true
  if (loading) {
    return (
      <div className={cn('w-full', isHorizontal ? 'flex items-start space-x-4' : '', className)}>
        {/* Label */}
        {label && (
          <div
            className={cn(isHorizontal ? `${getLabelWidthClass(labelWidth)} shrink-0 pt-2` : 'mb-1')}
          >
            <Label size={labelSize}>{label}</Label>
            {helperText && !isHorizontal && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
            )}
          </div>
        )}

        {/* Field Container */}
        <div className={cn('flex-1', isHorizontal ? 'min-w-0' : 'flex flex-col')}>
          {/* Skeleton Input */}
          <SkeletonInput />
          {helperText && isHorizontal && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      </div>
    );
  }

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
      <div className={cn('flex-1', isHorizontal ? 'min-w-0' : 'flex flex-col')}>
        {/* Control/Field */}
        <div>
          {mode === 'view' ? (
            controlProps ? (
              <ReadOnly
                id={fieldId}
                value={
                  controlProps.type === 'toggle' && toggleText
                    ? controlProps.checked
                      ? toggleText.checked
                      : toggleText.unchecked
                    : controlProps.checked
                      ? 'Yes'
                      : 'No'
                }
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
              />
            ) : (
              React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    id: fieldId,
                    'aria-labelledby': ariaLabelledBy,
                    'aria-describedby': ariaDescribedBy,
                    mode: 'view',
                  });
                }
                return child;
              })
            )
          ) : controlProps ? (
            <Control
              id={fieldId}
              errorMessage={controlError}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={
                ariaDescribedBy || (toggleText ? `${fieldId}-description` : undefined)
              }
              description={
                controlProps.type === 'toggle' && toggleText
                  ? controlProps.checked
                    ? toggleText.checked
                    : toggleText.unchecked
                  : controlProps.description || label
              }
              {...controlProps}
            />
          ) : (
            React.Children.map(children, child => {
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
      lg: '6',
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
          {title && (
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className={cn('flex', orientationClass, `gap-${spacingClass}`)}>{children}</div>
    </div>
  );
};
