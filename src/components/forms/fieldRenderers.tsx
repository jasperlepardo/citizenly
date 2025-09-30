import React from 'react';

import { ControlField } from '@/components/molecules/FieldSet/ControlField/ControlField';
import { InputField } from '@/components/molecules/FieldSet/InputField/InputField';
import { ReadOnlyField } from '@/components/molecules/FieldSet/ReadOnlyField/ReadOnlyField';
import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import type { FormMode } from '@/types/app/ui/forms';

import {
  isFieldReadOnly,
  formatDateForDisplay,
  formatBooleanForDisplay,
  getSelectDisplayValue,
} from '../../services/app/forms/fieldLogic';

// Re-export the FormMode type and utility functions for backward compatibility
export type { FormMode } from '@/types/app/ui/forms';
export {
  isFieldReadOnly,
  formatDateForDisplay,
  formatBooleanForDisplay,
  getSelectDisplayValue,
} from '../../services/app/forms/fieldLogic';

/**
 * Render an input field based on mode
 */
export const renderInputField = (
  fieldName: string,
  label: string,
  value: string | number | undefined,
  onChange: (value: string | number | boolean | null) => void,
  options: {
    mode?: FormMode;
    readOnlyFields?: string[];
    required?: boolean;
    placeholder?: string;
    type?: string;
    error?: string;
    helperText?: string;
    labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    multiline?: boolean;
  } = {}
) => {
  const {
    mode = 'edit',
    readOnlyFields = [],
    required = false,
    placeholder = '',
    type = 'text',
    error,
    helperText,
    labelSize = 'sm',
    leftIcon,
    rightIcon,
    multiline = false,
  } = options;

  if (isFieldReadOnly(fieldName, mode, readOnlyFields)) {
    return (
      <ReadOnlyField
        label={label}
        required={false}
        labelSize={labelSize}
        helperText={undefined}
        errorMessage={error}
        orientation={mode === 'view' ? 'horizontal' : 'vertical'}
        labelWidth="md"
        readOnlyProps={{
          value: value?.toString() || '',
          leftIcon,
          rightIcon,
          multiline,
        }}
      />
    );
  }

  return (
    <InputField
      label={label}
      required={required}
      labelSize={labelSize}
      helperText={helperText}
      errorMessage={error}
      inputProps={{
        type,
        value: value || '',
        onChange: e => onChange(e.target.value),
        placeholder,
        required,
        leftIcon,
        rightIcon,
      }}
    />
  );
};

/**
 * Render a select field based on mode
 */
export const renderSelectField = (
  fieldName: string,
  label: string,
  value: string | undefined,
  onChange: (value: string) => void,
  selectOptions: Array<{ value: string; label: string }>,
  options: {
    mode?: FormMode;
    readOnlyFields?: string[];
    required?: boolean;
    placeholder?: string;
    error?: string;
    helperText?: string;
    labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    searchable?: boolean;
    multiline?: boolean;
  } = {}
) => {
  const {
    mode = 'edit',
    readOnlyFields = [],
    required = false,
    placeholder = 'Select...',
    error,
    helperText,
    labelSize = 'sm',
    searchable = true,
    multiline = false,
  } = options;

  if (isFieldReadOnly(fieldName, mode, readOnlyFields)) {
    return (
      <ReadOnlyField
        label={label}
        required={false}
        labelSize={labelSize}
        helperText={undefined}
        errorMessage={error}
        orientation={mode === 'view' ? 'horizontal' : 'vertical'}
        labelWidth="md"
        readOnlyProps={{
          value: getSelectDisplayValue(value, selectOptions),
          multiline,
        }}
      />
    );
  }

  return (
    <SelectField
      label={label}
      required={required}
      labelSize={labelSize}
      helperText={helperText}
      errorMessage={error}
      selectProps={{
        placeholder,
        options: selectOptions,
        value: value || '',
        searchable,
        onSelect: (option: { value: string | number; label: string } | null) =>
          onChange(String(option?.value || '')),
      }}
    />
  );
};

/**
 * Render a checkbox field based on mode
 */
export const renderCheckboxField = (
  fieldName: string,
  label: string,
  value: boolean | undefined,
  onChange: (value: boolean) => void,
  options: {
    mode?: FormMode;
    readOnlyFields?: string[];
    error?: string;
    helperText?: string;
    labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  } = {}
) => {
  const { mode = 'edit', readOnlyFields = [], error, helperText, labelSize = 'sm' } = options;

  if (isFieldReadOnly(fieldName, mode, readOnlyFields)) {
    return (
      <ReadOnlyField
        label={label}
        labelSize={labelSize}
        helperText={undefined}
        errorMessage={error}
        orientation={mode === 'view' ? 'horizontal' : 'vertical'}
        labelWidth="md"
        readOnlyProps={{
          value: formatBooleanForDisplay(value),
        }}
      />
    );
  }

  return (
    <ControlField
      label={label}
      labelSize={labelSize}
      helperText={helperText}
      errorMessage={error}
      controlProps={{
        type: 'checkbox',
        checked: value || false,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked),
      }}
    />
  );
};

/**
 * Render a toggle field based on mode
 */
export const renderToggleField = (
  fieldName: string,
  label: string,
  value: boolean | undefined,
  onChange: (value: boolean) => void,
  options: {
    mode?: FormMode;
    readOnlyFields?: string[];
    error?: string;
    helperText?: string;
    labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    toggleText?: {
      checked: string;
      unchecked: string;
    };
  } = {}
) => {
  const {
    mode = 'edit',
    readOnlyFields = [],
    error,
    helperText,
    labelSize = 'sm',
    toggleText = {
      checked: 'Yes',
      unchecked: 'No',
    },
  } = options;

  if (isFieldReadOnly(fieldName, mode, readOnlyFields)) {
    return (
      <ReadOnlyField
        label={label}
        labelSize={labelSize}
        helperText={undefined}
        errorMessage={error}
        orientation={mode === 'view' ? 'horizontal' : 'vertical'}
        labelWidth="md"
        readOnlyProps={{
          value: formatBooleanForDisplay(value),
        }}
      />
    );
  }

  return (
    <ControlField
      label={label}
      labelSize={labelSize}
      helperText={helperText}
      errorMessage={error}
      toggleText={toggleText}
      controlProps={{
        type: 'toggle',
        checked: value || false,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked),
        size: 'md',
      }}
    />
  );
};

/**
 * Render a date field based on mode
 */
export const renderDateField = (
  fieldName: string,
  label: string,
  value: string | undefined,
  onChange: (value: string) => void,
  options: {
    mode?: FormMode;
    readOnlyFields?: string[];
    required?: boolean;
    error?: string;
    helperText?: string;
    labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    min?: string;
    max?: string;
  } = {}
) => {
  const {
    mode = 'edit',
    readOnlyFields = [],
    required = false,
    error,
    helperText,
    labelSize = 'sm',
    min,
    max,
  } = options;

  if (isFieldReadOnly(fieldName, mode, readOnlyFields)) {
    return (
      <ReadOnlyField
        label={label}
        required={false}
        labelSize={labelSize}
        helperText={undefined}
        errorMessage={error}
        orientation={mode === 'view' ? 'horizontal' : 'vertical'}
        labelWidth="md"
        readOnlyProps={{
          value: formatDateForDisplay(value),
        }}
      />
    );
  }

  return (
    <InputField
      label={label}
      required={required}
      labelSize={labelSize}
      helperText={helperText}
      errorMessage={error}
      inputProps={{
        type: 'date',
        value: value || '',
        onChange: e => onChange(e.target.value),
        required,
        min,
        max,
      }}
    />
  );
};

/**
 * Render a number field based on mode
 */
export const renderNumberField = (
  fieldName: string,
  label: string,
  value: number | undefined,
  onChange: (value: number) => void,
  options: {
    mode?: FormMode;
    readOnlyFields?: string[];
    required?: boolean;
    placeholder?: string;
    error?: string;
    helperText?: string;
    labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    min?: number;
    max?: number;
    step?: number;
  } = {}
) => {
  const {
    mode = 'edit',
    readOnlyFields = [],
    required = false,
    placeholder = '',
    error,
    helperText,
    labelSize = 'sm',
    min,
    max,
    step = 1,
  } = options;

  if (isFieldReadOnly(fieldName, mode, readOnlyFields)) {
    return (
      <ReadOnlyField
        label={label}
        required={false}
        labelSize={labelSize}
        helperText={undefined}
        errorMessage={error}
        orientation={mode === 'view' ? 'horizontal' : 'vertical'}
        labelWidth="md"
        readOnlyProps={{
          value: value?.toString() || '',
        }}
      />
    );
  }

  return (
    <InputField
      label={label}
      required={required}
      labelSize={labelSize}
      helperText={helperText}
      errorMessage={error}
      inputProps={{
        type: 'number',
        value: value || '',
        onChange: e => onChange(Number(e.target.value)),
        placeholder,
        required,
        min,
        max,
        step,
      }}
    />
  );
};
