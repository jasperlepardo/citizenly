'use client';

import React from 'react';

export interface LabelProps {
  /** The text content of the label */
  children: React.ReactNode;
  /** Optional secondary text displayed on a second line */
  secondaryText?: React.ReactNode;
  /** The ID of the form control this label is associated with */
  htmlFor?: string;
  /** Whether the associated form field is required */
  required?: boolean;
  /** Whether to show the required indicator (*) */
  showRequiredIndicator?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant of the main label text */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Size variant of the secondary text (defaults to one size smaller than main) */
  secondarySize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant of the label */
  variant?: 'default' | 'muted' | 'error' | 'success';
  /** Color variant of the secondary text */
  secondaryVariant?: 'default' | 'muted' | 'error' | 'success';
  /** Whether the label should be visually hidden (for screen readers only) */
  visuallyHidden?: boolean;
  /** Custom required indicator text (defaults to "*") */
  requiredIndicator?: string;
  /** Tooltip or help text */
  helpText?: string;
  /** Whether the associated field is disabled */
  disabled?: boolean;
}

const sizeClasses = {
  xs: 'text-xs leading-4',
  sm: 'text-sm leading-5', 
  md: 'text-base leading-6',
  lg: 'text-lg leading-7',
  xl: 'text-xl leading-8',
};

const variantClasses = {
  default: 'text-gray-600 dark:text-gray-400',
  muted: 'text-gray-500 dark:text-gray-400', 
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
};

const disabledClasses = 'text-gray-400 dark:text-gray-500 cursor-not-allowed';

const visuallyHiddenClasses = 'sr-only';

export const Label: React.FC<LabelProps> = ({
  children,
  secondaryText,
  htmlFor,
  required = false,
  showRequiredIndicator = true,
  className = '',
  size = 'md',
  secondarySize,
  variant = 'default',
  secondaryVariant,
  visuallyHidden = false,
  requiredIndicator = '*',
  helpText,
  disabled = false,
  ...props
}) => {
  // Default secondary size to one step smaller than main size
  const getDefaultSecondarySize = (mainSize: string): keyof typeof sizeClasses => {
    const sizeOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = sizeOrder.indexOf(mainSize);
    const secondaryIndex = Math.max(0, currentIndex - 1);
    return sizeOrder[secondaryIndex] as keyof typeof sizeClasses;
  };

  const effectiveSecondarySize = secondarySize || getDefaultSecondarySize(size);
  const effectiveSecondaryVariant = secondaryVariant || 'muted';
  
  const labelClasses = `
    block
    font-medium
    transition-colors
    duration-200
    ${visuallyHidden ? visuallyHiddenClasses : ''}
    ${className}
  `.trim();

  const mainTextClasses = `
    ${disabled ? disabledClasses : variantClasses[variant]}
    ${sizeClasses[size]}
  `.trim();

  const secondaryTextClasses = `
    block
    mt-0.5
    font-normal
    ${disabled ? disabledClasses : variantClasses[effectiveSecondaryVariant]}
    ${sizeClasses[effectiveSecondarySize]}
  `.trim();

  const requiredIndicatorClasses = `
    ml-1
    text-red-500
    dark:text-red-400
    font-medium
    ${disabled ? 'text-gray-400 dark:text-gray-500' : ''}
  `.trim();

  return (
    <label
      htmlFor={htmlFor}
      className={labelClasses}
      data-required={required}
      data-disabled={disabled}
      {...props}
    >
      {/* Main label text with required indicator */}
      <span className={`inline-flex items-baseline ${mainTextClasses}`}>
        {children}
        {required && showRequiredIndicator && (
          <abbr 
            className={`${requiredIndicatorClasses} no-underline`}
            title="required field"
            aria-label="This field is required"
          >
            {requiredIndicator}
          </abbr>
        )}
      </span>

      {/* Secondary text on new line */}
      {secondaryText && (
        <span className={secondaryTextClasses}>
          {secondaryText}
        </span>
      )}
      
      {/* Screen reader text for required fields when indicator is hidden */}
      {required && !showRequiredIndicator && (
        <span className="sr-only" aria-hidden="false">
          (This field is required)
        </span>
      )}
      
      {/* Help text for tooltips - referenced by aria-describedby on the input */}
      {helpText && htmlFor && (
        <span id={`${htmlFor}-help`} className="sr-only" role="note" aria-live="polite">
          {helpText}
        </span>
      )}
    </label>
  );
};

export default Label;