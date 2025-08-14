'use client';

/**
 * PhilSysNumberInput Component - Secure PhilSys Card Number Input
 * Handles Philippine National ID card number with proper masking and validation
 * Integrates with crypto utilities for secure handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { InputField } from '../InputField';
import { hashPhilSysNumber, maskPhilSysNumber } from '@/lib/crypto';
import { logError } from '@/lib/secure-logger';

interface PhilSysNumberInputProps {
  value?: string;
  onChange: (value: string, hashedValue?: string) => void;
  onValidation?: (isValid: boolean, error?: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  label?: string;
  placeholder?: string;
  showLastFourDigits?: boolean;
  autoHash?: boolean;
}

// PhilSys number format: XXXX-XXXX-XXXX (12 digits)
const PHILSYS_REGEX = /^\d{4}-\d{4}-\d{4}$/;
// const PHILSYS_DIGITS_ONLY = /^\d{12}$/;

export default function PhilSysNumberInput({
  value = '',
  onChange,
  onValidation,
  disabled = false,
  required = false,
  error,
  className = '',
  label = 'PhilSys Card Number',
  placeholder = 'XXXX-XXXX-XXXX',
  showLastFourDigits = true,
  autoHash = true,
}: PhilSysNumberInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [maskedDisplay, setMaskedDisplay] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Validate PhilSys number format
  const validatePhilSysNumber = useCallback(
    (philsysNumber: string): boolean => {
      let error = '';
      let valid = false;

      if (!philsysNumber && required) {
        error = 'PhilSys card number is required';
      } else if (philsysNumber && !PHILSYS_REGEX.test(philsysNumber)) {
        if (philsysNumber.replace(/\D/g, '').length < 12) {
          error = 'PhilSys number must be 12 digits';
        } else {
          error = 'Invalid PhilSys number format (XXXX-XXXX-XXXX)';
        }
      } else if (philsysNumber) {
        // Additional validation logic can be added here
        // For now, just check format
        valid = true;
      }

      setIsValid(valid);
      setValidationError(error);

      if (onValidation) {
        onValidation(valid, error || undefined);
      }

      return valid;
    },
    [required, onValidation]
  );

  // Initialize display value
  useEffect(() => {
    if (value) {
      const formatted = formatPhilSysNumber(value);
      setDisplayValue(formatted);
      setMaskedDisplay(maskPhilSysNumber(formatted));
      validatePhilSysNumber(formatted);
    }
  }, [value, validatePhilSysNumber]);

  // Format PhilSys number with dashes
  const formatPhilSysNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');

    // Limit to 12 digits
    const limited = digits.substring(0, 12);

    // Add dashes: XXXX-XXXX-XXXX
    if (limited.length >= 8) {
      return `${limited.substring(0, 4)}-${limited.substring(4, 8)}-${limited.substring(8)}`;
    } else if (limited.length >= 4) {
      return `${limited.substring(0, 4)}-${limited.substring(4)}`;
    } else {
      return limited;
    }
  };

  // Handle input change
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatPhilSysNumber(rawValue);

    setDisplayValue(formatted);

    // Update masked display for when not focused
    if (formatted.length === 13) {
      // Full format XXXX-XXXX-XXXX
      setMaskedDisplay(maskPhilSysNumber(formatted));
    }

    // Validate
    const isValidNumber = validatePhilSysNumber(formatted);

    // Hash and send to parent if valid and auto-hash is enabled
    if (isValidNumber && autoHash && formatted.length === 13) {
      try {
        const hashedValue = await hashPhilSysNumber(formatted);
        onChange(formatted, hashedValue);
      } catch (error) {
        logError(error as Error, 'PHILSYS_HASH_ERROR');
        onChange(formatted);
      }
    } else {
      onChange(formatted);
    }
  };

  // Handle focus events for masking
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Determine what to show in input
  const inputValue = isFocused
    ? displayValue
    : showLastFourDigits && maskedDisplay
      ? maskedDisplay
      : displayValue;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-primary block text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <InputField
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          errorMessage={error || validationError}
          className={`font-mono ${isValid ? 'border-green-500' : ''}`}
          maxLength={14} // XXXX-XXXX-XXXX + potential extra char
        />

        {/* Security Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <span className="text-green-500" title="Valid PhilSys number">
              🔒
            </span>
          ) : displayValue.length > 0 ? (
            <span className="text-yellow-500" title="Invalid format">
              ⚠️
            </span>
          ) : (
            <span className="text-muted" title="PhilSys number">
              🆔
            </span>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="text-muted text-xs">
        {!isFocused && displayValue && showLastFourDigits ? (
          <span>
            Number is masked for security. Click to edit. Last 4 digits: {displayValue.slice(-4)}
          </span>
        ) : (
          <span>Enter 12-digit PhilSys card number. Format: XXXX-XXXX-XXXX</span>
        )}
      </div>

      {/* Validation Status */}
      {displayValue && !validationError && isValid && (
        <div className="flex items-center space-x-2 text-green-600">
          <span className="text-xs">✓</span>
          <span className="text-xs">Valid PhilSys number format</span>
          {autoHash && (
            <span className="rounded bg-green-100 px-2 py-1 text-xs dark:bg-green-900/20">
              🔐 Auto-encrypted
            </span>
          )}
        </div>
      )}

      {/* Security Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 dark:text-blue-400">🔐</span>
          <div className="text-blue-700 dark:text-blue-300">
            <strong>Security Notice:</strong> PhilSys numbers are automatically encrypted and masked
            for protection. Only the last 4 digits are shown when not editing.
            {autoHash && ' Data is hashed before storage.'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export utilities for external use
export { maskPhilSysNumber, hashPhilSysNumber };
