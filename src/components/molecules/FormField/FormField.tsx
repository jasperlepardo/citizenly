'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  labelWidth?: string;
}

export const FormField = ({
  children,
  label,
  required = false,
  helperText,
  errorMessage,
  className,
  orientation = 'vertical',
  labelWidth = 'w-32',
}: FormFieldProps) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn('w-full', isHorizontal && 'flex items-start space-x-4', className)}>
      {/* Label */}
      {label && (
        <div className={cn(isHorizontal ? `${labelWidth} flex-shrink-0 pt-2` : 'mb-1')}>
          <label className="block font-body text-sm font-medium text-gray-600">
            {label}
            {required && <span className="ml-1 text-red-600">*</span>}
          </label>
        </div>
      )}

      {/* Field Container */}
      <div className={cn(isHorizontal && 'flex-1')}>
        {/* Input/Field */}
        <div>{children}</div>

        {/* Helper Text / Error Message */}
        {(helperText || errorMessage) && (
          <div className="mt-1">
            {errorMessage ? (
              <p className="font-body text-xs text-red-600">{errorMessage}</p>
            ) : (
              <p className="text-muted font-body text-xs">{helperText}</p>
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
          {title && <h3 className="mb-1 font-body text-lg font-semibold text-gray-600">{title}</h3>}
          {description && <p className="text-muted font-body text-sm">{description}</p>}
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
