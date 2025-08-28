/**
 * Forms Library Module
 *
 * @description Centralized form utilities and business logic.
 * Provides reusable form handlers, validation, and field logic.
 */

// Explicit exports to prevent circular dependencies
export type { FormMode } from '@/types/forms';

// Form handlers and utilities
export {
  createFieldChangeHandler,
  createSelectChangeHandler,
  createBooleanChangeHandler,
  createFormSubmitHandler,
  fieldValidators,
  buildErrorsFromValidation,
} from './form-handlers';

// Field business logic
export {
  isFieldReadOnly,
  formatDateForDisplay,
  formatBooleanForDisplay,
  getSelectDisplayValue,
  fieldLogic,
  fieldState,
} from './field-logic';
