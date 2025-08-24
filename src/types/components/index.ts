/**
 * Shared Component Types
 * Centralized type definitions for consistent component interfaces
 */

// Form field types
export type {
  BaseFieldSetProps,
  FieldSetWithIconsProps,
  ClearableFieldSetProps,
  ValidatedFieldSetProps,
  LoadableFieldSetProps,
  SelectFieldBaseProps,
  FormSectionProps,
  ValidatableFieldSetProps,
  GenericSelectOption,
  ValidationState,
  FieldSize,
  FieldValidator,
} from './form-field';

// Common component props
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;

  /** Component children */
  children?: React.ReactNode;

  /** Test identifier for automated testing */
  testId?: string;
}

// Button-like component props
export interface ButtonLikeProps extends BaseComponentProps {
  /** Whether the component is disabled */
  disabled?: boolean;

  /** Whether the component is in loading state */
  loading?: boolean;

  /** Click handler */
  onClick?: () => void;

  /** ARIA label for accessibility */
  'aria-label'?: string;
}

// Modal/Dialog component props
export interface ModalProps extends BaseComponentProps {
  /** Whether the modal is open */
  isOpen: boolean;

  /** Close handler */
  onClose: () => void;

  /** Modal title */
  title: string;

  /** Optional description */
  description?: string;

  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;

  /** Whether Escape key closes modal */
  closeOnEscape?: boolean;
}
