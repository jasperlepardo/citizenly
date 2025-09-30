/**
 * Input Component Types
 * Type definitions for the Input component
 */

export interface InputProps extends Readonly<React.InputHTMLAttributes<HTMLInputElement>> {
  /** Error message to display */
  error?: string;
  /** Custom class name */
  className?: string;
  /** Whether to show a clear button when input has content */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Whether to show password visibility toggle for password inputs */
  showPasswordToggle?: boolean;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
  /** Whether the input is dismissible/clearable */
  dismissible?: boolean;
  /** Loading state for async operations */
  loading?: boolean;
  /** Whether to suppress clear/dismiss buttons (for Select usage) */
  suppressActions?: boolean;
}