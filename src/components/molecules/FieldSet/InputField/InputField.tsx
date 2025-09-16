'use client';

import React from 'react';

// Simple inline utility (replacing deleted cssUtils)
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');
import type { FormMode } from '@/types/app/ui/forms';
// Simple inline ID utilities (replacing deleted idGenerators)
const getFieldId = (name: string) => `field-${name}-${Math.random().toString(36).substring(2, 9)}`;
const getFieldIds = (name: string) => ({ fieldId: getFieldId(name), helperId: `${getFieldId(name)}-helper`, errorId: `${getFieldId(name)}-error` });
const buildAriaDescribedBy = (helperId?: string, errorId?: string) => [helperId, errorId].filter(Boolean).join(' ') || undefined;
const buildAriaLabelledBy = (labelId?: string) => labelId;

import { Label, Input, HelperText, ReadOnly } from '@/components/atoms/Field';

export interface InputFieldProps {
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
  // Input component props (when used directly with Input)
  inputProps?: React.ComponentProps<typeof Input>;
  // Label component props
  labelProps?: Omit<
    React.ComponentProps<typeof Label>,
    'htmlFor' | 'required' | 'children' | 'size'
  >;
}

export const InputField = ({
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
  inputProps,
  labelProps,
}: InputFieldProps) => {
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
  const fieldId = getFieldId(htmlFor, inputProps?.id, 'input-field');
  const { labelId, helperTextId, errorId } = getFieldIds(fieldId);

  // Use errorMessage as the input error if provided
  const inputError = errorMessage || inputProps?.error;
  const hasHelperText = helperText || errorMessage;

  // Build ARIA attributes for accessibility
  const ariaLabelledBy = buildAriaLabelledBy(label ? labelId : undefined);
  const ariaDescribedByString = buildAriaDescribedBy(
    helperText ? helperTextId : undefined,
    inputError ? errorId : undefined
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
        {/* Input/Field */}
        <div>
          {mode === 'view' ? (
            inputProps ? (
              <ReadOnly
                id={fieldId}
                value={inputProps.value?.toString() || '—'}
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
          ) : inputProps ? (
            <Input
              id={fieldId}
              error={inputError}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedByString}
              {...inputProps}
            />
          ) : React.isValidElement(children) ? (
            React.cloneElement(children as React.ReactElement<any>, {
              id: fieldId,
              'aria-labelledby': ariaLabelledBy,
              'aria-describedby': ariaDescribedByString,
              error: inputError,
            })
          ) : (
            children
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

// Form Group for organizing multiple fields
export interface FormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const FormGroup = ({
  children,
  title,
  description,
  className,
  spacing = 'md',
}: FormGroupProps) => {
  const spacingClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Title and Description */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-body mb-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
              {title}
            </h3>
          )}
          {description && (
            <p className="font-body text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Fields */}
      <div className={spacingClasses[spacing]}>{children}</div>
    </div>
  );
};

// Form Container for the entire form
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}

export const Form = ({ children, className, spacing = 'md', ...props }: FormProps) => {
  const spacingClasses = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  };

  return (
    <form className={cn('w-full', spacingClasses[spacing], className)} {...props}>
      {children}
    </form>
  );
};
