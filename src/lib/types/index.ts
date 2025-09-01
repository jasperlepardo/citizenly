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
} from '@/types/app/ui/forms';

// Database types
export * from '@/types/infrastructure/database';

// Domain types - use namespace import to avoid conflicts
// import * as ResidentTypes from './resident';
// export { ResidentTypes };
// Resident types - direct exports from consolidated modules
export type { Resident } from '@/types/domain/residents/core';
export type { ResidentListItem } from '@/types/domain/residents/core';
export type { ResidentsApiResponse } from '@/types/domain/residents/api';
