/**
 * Types Library Module
 * 
 * @description Centralized type definitions for the application.
 * Provides reusable interfaces and types that can be shared across modules.
 */

// Form-related types - explicit exports to prevent circular dependencies
export type {
  BaseFieldSetProps,
  FieldSetWithIconsProps,
  ClearableFieldSetProps,
  ValidatedFieldSetProps,
  LoadableFieldSetProps,
  GenericSelectOption,
  SelectFieldBaseProps,
  FormSectionProps,
  FieldValidator,
  ValidatableFieldSetProps,
  FormMode,
  ValidationState,
  FieldSize,
  FormSubmissionState,
} from './forms';

// Database types
export * from './database';

// Domain types - use namespace import to avoid conflicts
// import * as ResidentTypes from './resident';
// export { ResidentTypes };
export * from './resident-detail';
export * from './resident-listing';