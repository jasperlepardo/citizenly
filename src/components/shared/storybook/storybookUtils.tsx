/**
 * Consolidated Storybook Story Utilities
 *
 * @fileoverview Eliminates duplicate reset/validate patterns across Storybook stories.
 * Provides standardized interactive story components, validation patterns, and
 * progressive data filling utilities for consistent story development.
 *
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

'use client';

import React, { useState, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Base form data interface
 */
export interface FormData {
  [key: string]: any;
}

/**
 * Validation error map
 */
export interface ValidationErrors {
  [fieldName: string]: string;
}

/**
 * Validation function type
 */
export type ValidationFunction<T extends FormData> = (value: T) => ValidationErrors;

/**
 * Interactive story props
 */
export interface InteractiveStoryProps<T extends FormData> {
  initialValue: T;
  sampleData?: T;
  validationRules?: ValidationFunction<T>;
  className?: string;
  children: (props: InteractiveStoryState<T>) => React.ReactNode;
}

/**
 * Interactive story state
 */
export interface InteractiveStoryState<T extends FormData> {
  value: T;
  errors: ValidationErrors;
  onChange: (newValue: T) => void;
  validate: () => boolean;
  reset: () => void;
  fillSample: () => void;
  hasErrors: boolean;
  isValid: boolean;
}

/**
 * Progressive step configuration
 */
export interface ProgressiveStep<T extends FormData> {
  label: string;
  data: T;
  description?: string;
}

/**
 * Validation pattern example
 */
export interface ValidationExample<T extends FormData> {
  label: string;
  data: T;
  errors: ValidationErrors;
  description?: string;
}

/**
 * Story control configuration
 */
export interface StoryControls {
  showValidationButton?: boolean;
  showResetButton?: boolean;
  showSampleButton?: boolean;
  showCurrentValues?: boolean;
  showErrorState?: boolean;
  customButtons?: Array<{
    label: string;
    onClick: () => void;
    className?: string;
  }>;
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Creates a standardized validation function for email fields
 */
export function createEmailValidator(fieldName: string = 'email'): ValidationFunction<any> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (value: any) => {
    const errors: ValidationErrors = {};
    const email = value[fieldName];

    if (email && !emailRegex.test(email)) {
      errors[fieldName] = 'Please enter a valid email address';
    }

    return errors;
  };
}

/**
 * Creates a standardized validation function for phone fields
 */
export function createPhoneValidator(fieldName: string = 'phoneNumber'): ValidationFunction<any> {
  const phoneRegex = /^[\+]?[\d\s\(\)\-]{7,}$/;

  return (value: any) => {
    const errors: ValidationErrors = {};
    const phone = value[fieldName];

    if (phone && !phoneRegex.test(phone)) {
      errors[fieldName] = 'Please enter a valid phone number';
    }

    return errors;
  };
}

/**
 * Creates a standardized validation function for required fields
 */
export function createRequiredValidator(fieldNames: string[]): ValidationFunction<any> {
  return (value: any) => {
    const errors: ValidationErrors = {};

    fieldNames.forEach(fieldName => {
      if (!value[fieldName] || (typeof value[fieldName] === 'string' && !value[fieldName].trim())) {
        errors[fieldName] = `${fieldName} is required`;
      }
    });

    return errors;
  };
}

/**
 * Combines multiple validation functions into one
 */
export function combineValidators<T extends FormData>(
  ...validators: ValidationFunction<T>[]
): ValidationFunction<T> {
  return (value: T) => {
    const combinedErrors: ValidationErrors = {};

    validators.forEach(validator => {
      const errors = validator(value);
      Object.assign(combinedErrors, errors);
    });

    return combinedErrors;
  };
}

// =============================================================================
// INTERACTIVE STORY COMPONENT
// =============================================================================

/**
 * Consolidated interactive story component with standardized reset/validate patterns
 */
export function InteractiveStory<T extends FormData>({
  initialValue,
  sampleData,
  validationRules,
  className = '',
  children,
}: InteractiveStoryProps<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const onChange = useCallback(
    (newValue: T) => {
      setValue(newValue);

      // Clear errors for fields that now have values
      const newErrors = { ...errors };
      Object.keys(newValue).forEach(key => {
        if (newValue[key] && errors[key]) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    },
    [errors]
  );

  const validate = useCallback(() => {
    if (!validationRules) return true;

    const validationErrors = validationRules(value);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [value, validationRules]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setErrors({});
  }, [initialValue]);

  const fillSample = useCallback(() => {
    if (sampleData) {
      setValue(sampleData);
      setErrors({});
    }
  }, [sampleData]);

  const storyState: InteractiveStoryState<T> = {
    value,
    errors,
    onChange,
    validate,
    reset,
    fillSample,
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0,
  };

  return <div className={`interactive-story ${className}`}>{children(storyState)}</div>;
}

// =============================================================================
// STORY CONTROL COMPONENTS
// =============================================================================

/**
 * Standard story control buttons
 */
export function StoryControlButtons<T extends FormData>({
  storyState,
  controls = {},
  sampleData,
}: {
  storyState: InteractiveStoryState<T>;
  controls?: StoryControls;
  sampleData?: T;
}) {
  const {
    showValidationButton = true,
    showResetButton = true,
    showSampleButton = !!sampleData,
    customButtons = [],
  } = controls;

  if (
    !showValidationButton &&
    !showResetButton &&
    !showSampleButton &&
    customButtons.length === 0
  ) {
    return null;
  }

  return (
    <div className="flex space-x-4">
      {showValidationButton && (
        <button
          onClick={storyState.validate}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Validate
        </button>
      )}

      {showSampleButton && (
        <button
          onClick={storyState.fillSample}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Fill Sample
        </button>
      )}

      {showResetButton && (
        <button
          onClick={storyState.reset}
          className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          Reset
        </button>
      )}

      {customButtons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className={
            button.className || 'rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700'
          }
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Value display component for debugging
 */
export function StoryValueDisplay<T extends FormData>({
  value,
  errors,
  title = 'Current Values',
}: {
  value: T;
  errors: ValidationErrors;
  title?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded bg-gray-100 p-4">
        <h4 className="font-medium">{title}:</h4>
        <pre className="mt-2 text-sm">{JSON.stringify(value, null, 2)}</pre>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded bg-red-100 p-4">
          <h4 className="font-medium text-red-800">Validation Errors:</h4>
          <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PROGRESSIVE STORY COMPONENT
// =============================================================================

/**
 * Progressive data filling story component
 */
export function ProgressiveStory<T extends FormData>({
  steps,
  className = '',
  children,
}: {
  steps: ProgressiveStep<T>[];
  className?: string;
  children: (props: {
    currentStep: number;
    currentData: T;
    stepLabel: string;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
    isFirstStep: boolean;
    isLastStep: boolean;
  }) => React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStep(index);
      }
    },
    [steps.length]
  );

  const currentStepData = steps[currentStep];

  return (
    <div className={`progressive-story ${className}`}>
      {children({
        currentStep,
        currentData: currentStepData?.data,
        stepLabel: currentStepData?.label || '',
        nextStep,
        prevStep,
        goToStep,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === steps.length - 1,
      })}
    </div>
  );
}

/**
 * Progressive story navigation controls
 */
export function ProgressiveStoryControls({
  steps,
  currentStep,
  onStepChange,
}: {
  steps: ProgressiveStep<any>[];
  currentStep: number;
  onStepChange: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => onStepChange(index)}
            className={`rounded px-3 py-1 text-sm ${
              currentStep === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {index}: {step.label}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
        {steps[currentStep]?.description && (
          <div className="mt-1 text-xs text-gray-500">{steps[currentStep].description}</div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// VALIDATION PATTERN STORY COMPONENT
// =============================================================================

/**
 * Validation pattern demonstration story
 */
export function ValidationPatternStory<T extends FormData>({
  examples,
  className = '',
  children,
}: {
  examples: ValidationExample<T>[];
  className?: string;
  children: (props: {
    currentExample: ValidationExample<T>;
    exampleIndex: number;
    nextExample: () => void;
    prevExample: () => void;
    goToExample: (index: number) => void;
  }) => React.ReactNode;
}) {
  const [currentExample, setCurrentExample] = useState(0);

  const nextExample = useCallback(() => {
    if (currentExample < examples.length - 1) {
      setCurrentExample(currentExample + 1);
    }
  }, [currentExample, examples.length]);

  const prevExample = useCallback(() => {
    if (currentExample > 0) {
      setCurrentExample(currentExample - 1);
    }
  }, [currentExample]);

  const goToExample = useCallback(
    (index: number) => {
      if (index >= 0 && index < examples.length) {
        setCurrentExample(index);
      }
    },
    [examples.length]
  );

  return (
    <div className={`validation-pattern-story ${className}`}>
      {children({
        currentExample: examples[currentExample],
        exampleIndex: currentExample,
        nextExample,
        prevExample,
        goToExample,
      })}
    </div>
  );
}

/**
 * Validation pattern navigation controls
 */
export function ValidationPatternControls({
  examples,
  currentExample,
  onExampleChange,
}: {
  examples: ValidationExample<any>[];
  currentExample: number;
  onExampleChange: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleChange(index)}
            className={`rounded px-3 py-1 text-sm ${
              currentExample === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        Current: {examples[currentExample]?.label}
        {examples[currentExample]?.description && (
          <div className="mt-1 text-xs text-gray-500">{examples[currentExample].description}</div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates standardized story parameters for consistent documentation
 */
export function createStoryParameters(title: string, description: string, additionalParams?: any) {
  return {
    docs: {
      description: {
        story: description,
      },
    },
    ...additionalParams,
  };
}

/**
 * Creates standardized empty data template
 */
export function createEmptyFormData<T extends FormData>(fields: (keyof T)[]): T {
  const emptyData = {} as T;
  fields.forEach(field => {
    emptyData[field] = '' as any;
  });
  return emptyData;
}

/**
 * Creates standardized sample data with realistic values
 */
export function createSampleFormData<T extends FormData>(sampleValues: Partial<T>): T {
  return sampleValues as T;
}
