'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Label, Input, HelperText } from '../../../atoms/Field';

export interface InputFieldProps {
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
  // Input component props (when used directly with Input)
  inputProps?: React.ComponentProps<typeof Input>;
  // Label component props
  labelProps?: Omit<React.ComponentProps<typeof Label>, 'htmlFor' | 'required' | 'children' | 'size'>;
}

export const InputField = ({
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
  inputProps,
  labelProps,
}: InputFieldProps) => {
  const isHorizontal = orientation === 'horizontal';
  
  // Generate unique ID if not provided
  const fieldId = htmlFor || inputProps?.id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = `${fieldId}-label`;
  const helperTextId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  
  // Use errorMessage as the input error if provided
  const inputError = errorMessage || inputProps?.error;
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
            id={labelId}
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
        {/* Input/Field */}
        <div>
          {inputProps ? (
            <Input
              id={fieldId}
              error={inputError}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedByString}
              {...inputProps}
            />
          ) : (
            React.isValidElement(children) 
              ? React.cloneElement(children as React.ReactElement, {
                  id: fieldId,
                  'aria-labelledby': ariaLabelledBy,
                  'aria-describedby': ariaDescribedByString,
                  error: inputError,
                })
              : children
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
          {title && <h3 className="mb-1 font-body text-lg font-semibold text-gray-600 dark:text-gray-400">{title}</h3>}
          {description && <p className="text-gray-500 dark:text-gray-400 font-body text-sm">{description}</p>}
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
