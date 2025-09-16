/**
 * Component Types - React Component Interface Collection
 *
 * @fileoverview Consolidated component prop interfaces and common patterns
 * for the Citizenly RBI React component library. Provides consistent typing
 * patterns across all UI components with accessibility and testing support.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 */

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, JSX } from 'react';

// =============================================================================
// COMMON COMPONENT PROPS
// =============================================================================

// Note: BaseComponentProps removed - unused

// Note: ComponentWithChildren removed - unused

// Note: ComponentSize removed - unused

// Note: ComponentVariant removed - unused

// =============================================================================
// BUTTON COMPONENT TYPES
// =============================================================================

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Data attributes for testing */
  'data-testid'?: string;
  /** Visual style variant */
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Render as a different element */
  asChild?: boolean;
  /** Show loading spinner and disable button */
  loading?: boolean;
  /** Icon to display on the left */
  leftIcon?: ReactNode;
  /** Icon to display on the right */
  rightIcon?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

// =============================================================================
// TABLE COMPONENT TYPES
// =============================================================================

/**
 * Table column configuration
 */
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T | ((record: T) => any);
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

/**
 * Table action configuration
 */
export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: (record: T, index: number) => void;
  href?: (record: T) => string;
  visible?: (record: T) => boolean;
  disabled?: (record: T) => boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
}

/**
 * DataTable component props
 */
export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  rowKey?: keyof T | ((record: T) => string);
  onRow?: (
    record: T,
    index: number
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
  };
  emptyText?: ReactNode;
  className?: string;
  size?: 'small' | 'middle' | 'large';
}

// =============================================================================
// FORM COMPONENT TYPES
// =============================================================================

// Note: FormFieldProps removed - unused
// Inline base props where needed

/**
 * Input field props
 */
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Data attributes for testing */
  'data-testid'?: string;
  /** Field label */
  label?: string;
  /** Help text */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field name for form submission */
  name?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Placeholder text */
  placeholder?: string;
  /** Left icon */
  leftIcon?: ReactNode;
  /** Right icon */
  rightIcon?: ReactNode;
}

/**
 * Select field props
 */
export interface SelectProps {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Data attributes for testing */
  'data-testid'?: string;
  /** Field label */
  label?: string;
  /** Help text */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field name for form submission */
  name?: string;
  /** Select options */
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  /** Current value */
  value?: string | number;
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Enable search/filter */
  searchable?: boolean;
}

/**
 * Checkbox props
 */
export interface CheckboxProps {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Data attributes for testing */
  'data-testid'?: string;
  /** Field label */
  label?: string;
  /** Help text */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field name for form submission */
  name?: string;
  /** Whether checkbox is checked */
  checked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Indeterminate state */
  indeterminate?: boolean;
}

/**
 * Radio button props
 */
export interface RadioProps {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Data attributes for testing */
  'data-testid'?: string;
  /** Field label */
  label?: string;
  /** Help text */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field name for form submission */
  name?: string;
  /** Radio value */
  value: string | number;
  /** Whether radio is selected */
  checked?: boolean;
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Radio group name */
  name?: string;
}

// =============================================================================
// LAYOUT COMPONENT TYPES
// =============================================================================

/**
 * Card component props
 */
export interface CardProps extends ComponentWithChildren {
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether card is interactive */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

/**
 * Modal component props
 */
export interface ModalProps extends ComponentWithChildren {
  /** Whether modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEscape?: boolean;
}

// Note: DrawerProps removed - unused

// =============================================================================
// DATA DISPLAY COMPONENT TYPES
// =============================================================================

// Note: SimpleTableColumn removed - unused and redundant with TableColumn

/**
 * Table component props
 */
export interface TableProps<T = any> extends BaseComponentProps {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected rows */
  selectedRows?: T[];
  /** Selection change handler */
  onSelectionChange?: (selectedRows: T[]) => void;
}

// Note: PaginationProps removed - unused

// =============================================================================
// FEEDBACK COMPONENT TYPES
// =============================================================================

// Note: AlertSeverity and AlertProps removed - unused

/**
 * Loading component props
 */
export interface LoadingProps extends BaseComponentProps {
  /** Loading message */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show overlay */
  overlay?: boolean;
}

// Note: ProgressProps removed - unused

// =============================================================================
// NAVIGATION COMPONENT TYPES
// =============================================================================

// Note: Navigation types removed - unused and replaced by component-specific interfaces
// (NavItem, BreadcrumbItem, TabItem, TabsProps)

// =============================================================================
// FILE UPLOAD COMPONENT TYPES
// =============================================================================

/**
 * File upload component props
 */
export interface FileUploadProps {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Data attributes for testing */
  'data-testid'?: string;
  /** Field label */
  label?: string;
  /** Help text */
  description?: string;
  /** Error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field name for form submission */
  name?: string;
  dragText?: string;
  browseText?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  onFileSelect?: (files: FileList | null) => void;
  showPreview?: boolean;
  variant?: 'default' | 'error' | 'success' | 'disabled';
  size?: ComponentSize;
  multiple?: boolean;
}

// Note: FilePreview removed - unused

// =============================================================================
// SEARCH COMPONENT TYPES
// =============================================================================

/**
 * Search bar component props
 */
export interface SearchBarProps extends BaseComponentProps {
  value?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChange?: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: ComponentSize;
  variant?: 'default' | 'outlined' | 'filled';
  showClearButton?: boolean;
  showSearchIcon?: boolean;
  debounceMs?: number;
}

// Note: SearchResultItem removed - unused

// =============================================================================
// BUTTON GROUP COMPONENT TYPES
// =============================================================================

// Note: ButtonGroupOption removed - unused

/**
 * Button group component props
 */
export interface ButtonGroupProps<T = string> extends BaseComponentProps {
  options: Array<{
    label: string;
    value: T;
    icon?: ReactNode;
    disabled?: boolean;
    tooltip?: string;
  }>;
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  disabled?: boolean;
}

// =============================================================================
// DIALOG AND CONFIRMATION TYPES
// =============================================================================

// Note: DialogAction and ConfirmationDialogProps removed - unused

// =============================================================================
// FORM FIELD TYPES
// =============================================================================
// Note: Form field interfaces have been moved to forms.ts to avoid duplication.
// Import from @/types/app/ui/forms for:
// - BaseFieldSetProps, FieldSetWithIconsProps, ClearableFieldSetProps
// - ValidatedFieldSetProps, LoadableFieldSetProps, ValidatableFieldSetProps  
// - GenericSelectOption, SelectFieldBaseProps, FormSectionProps
// - FormSubmissionState, FormValidationState, FormFieldSize

// =============================================================================
// COMMAND MENU TYPES (consolidated from components/command-menu.ts)
// =============================================================================

/**
 * Command menu item interface
 */
export interface CommandMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  avatar?: {
    src: string;
    alt: string;
    fallback?: string;
  };
  shortcut?: string[];
  group: string;
  keywords?: string[];
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  recent?: boolean;
}

/**
 * Command menu group interface
 */
export interface CommandMenuGroup {
  id: string;
  label: string;
  items: CommandMenuItem[];
  priority?: number;
}

/**
 * Command menu props interface
 */
export interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandMenuItem[];
  placeholder?: string;
  emptyStateText?: string;
  className?: string;
  maxResults?: number;
  showShortcuts?: boolean;
  showRecentSection?: boolean;
}

// Note: CommandMenuContextValue removed - unused

// =============================================================================
// MODAL FORM TYPES
// =============================================================================

/**
 * Household address form data for modals
 * Subset of full HouseholdFormData for address-specific components
 */
export interface HouseholdModalFormData {
  house_number: string;
  street_id: string;
  subdivision_id: string;
}

/**
 * Error boundary provider component props
 * Consolidates from src/lib/monitoring/components/ErrorBoundaryProvider.tsx
 */
export interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableReporting?: boolean;
}

/**
 * Error fallback component props
 * Consolidates from src/lib/monitoring/components/ErrorBoundaryProvider.tsx
 */
export interface ErrorFallbackProps {
  error: Error;
  errorId: string;
  resetError: () => void;
}

// Note: CommandMenuContextExtended removed - unused

/**
 * Command menu variant types
 */
export type CommandMenuVariant = 'default' | 'compact';
// Note: CommandMenuSize removed - unused

// =============================================================================
// UI LIBRARY TYPES (from src/lib/ui)
// =============================================================================

/**
 * Typography variant types
 * Consolidates from src/lib/ui/typography.ts
 */
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'small'
  | 'caption'
  | 'overline'
  | 'link'
  | 'code';

/**
 * Typography component props
 * Consolidates from src/lib/ui/typography.ts
 */
export interface TypographyProps extends BaseComponentProps {
  variant?: TypographyVariant;
  component?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  truncate?: boolean;
  noWrap?: boolean;
}

/**
 */

/**
 */

/**

/**
 * User behavior metrics for PWA
 * Consolidates from src/lib/analytics/user-behavior.ts
 */
export interface UserBehaviorMetrics {
  pageViews: number;
  timeSpent: number;
  interactions: number;
  revisits: number;
  lastVisit: number;
}

/**
 * PWA install criteria
 * Consolidates from src/lib/analytics/user-behavior.ts
 */
export interface PWAInstallCriteria {
  isReturningUser: boolean;
  hasInteracted: boolean;
  hasSpentTime: boolean;
  hasExplored: boolean;
}

/**
 * Personalized message for PWA installation
 * Consolidates from src/lib/analytics/user-behavior.ts
 */
export interface PersonalizedMessage {
  title: string;
  description: string;
}

// Note: Keyboard interaction types and HOC types removed due to being unused
// If these are needed in the future, implement them as needed with actual usage
