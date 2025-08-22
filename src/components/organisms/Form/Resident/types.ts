/**
 * Form Component Types
 */

export type FormMode = 'create' | 'edit' | 'view';

export interface FormSectionProps {
  mode?: FormMode;
  isReadOnly?: boolean;
  className?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  helperText?: string;
}