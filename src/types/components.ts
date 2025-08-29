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

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, JSX } from 'react';

// =============================================================================
// COMMON COMPONENT PROPS
// =============================================================================

/**
 * Base component props that all components should support
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Unique identifier */
  id?: string;
  /** Data attributes for testing */
  'data-testid'?: string;
}

/**
 * Component with children
 */
export interface ComponentWithChildren extends BaseComponentProps {
  children?: ReactNode;
}

/**
 * Component size variants
 */
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component color variants
 */
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';

// =============================================================================
// BUTTON COMPONENT TYPES
// =============================================================================

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseComponentProps {
  /** Visual style variant */
  variant?: ComponentVariant;
  /** Size variant */
  size?: ComponentSize;
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
// FORM COMPONENT TYPES
// =============================================================================

/**
 * Form field base props
 */
export interface FormFieldProps extends BaseComponentProps {
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
}

/**
 * Input field props
 */
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    FormFieldProps {
  /** Size variant */
  size?: ComponentSize;
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
export interface SelectProps extends FormFieldProps {
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
export interface CheckboxProps extends FormFieldProps {
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
export interface RadioProps extends FormFieldProps {
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
  padding?: ComponentSize;
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
  size?: ComponentSize | 'xs' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEscape?: boolean;
}

/**
 * Drawer component props
 */
export interface DrawerProps extends ComponentWithChildren {
  /** Whether drawer is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Drawer position */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** Drawer size */
  size?: ComponentSize;
}

// =============================================================================
// DATA DISPLAY COMPONENT TYPES
// =============================================================================

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  /** Column key */
  key: keyof T;
  /** Column header */
  header: string;
  /** Cell renderer */
  render?: (value: any, row: T) => ReactNode;
  /** Column width */
  width?: string | number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

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

/**
 * Pagination props
 */
export interface PaginationProps extends BaseComponentProps {
  /** Current page (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Items per page */
  pageSize?: number;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Show page size selector */
  showPageSizeSelector?: boolean;
  /** Available page sizes */
  pageSizeOptions?: number[];
}

// =============================================================================
// FEEDBACK COMPONENT TYPES
// =============================================================================

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

/**
 * Alert component props
 */
export interface AlertProps extends ComponentWithChildren {
  /** Alert severity */
  severity?: AlertSeverity;
  /** Alert title */
  title?: string;
  /** Whether alert is dismissible */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Alert icon */
  icon?: ReactNode;
}

/**
 * Loading component props
 */
export interface LoadingProps extends BaseComponentProps {
  /** Loading message */
  message?: string;
  /** Size variant */
  size?: ComponentSize;
  /** Whether to show overlay */
  overlay?: boolean;
}

/**
 * Progress component props
 */
export interface ProgressProps extends BaseComponentProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Whether to show label */
  showLabel?: boolean;
  /** Custom label */
  label?: string;
  /** Progress color */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

// =============================================================================
// NAVIGATION COMPONENT TYPES
// =============================================================================

/**
 * Navigation item
 */
export interface NavItem {
  /** Item label */
  label: string;
  /** Item href */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Item icon */
  icon?: ReactNode;
  /** Whether item is active */
  active?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Child items */
  children?: NavItem[];
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /** Item label */
  label: string;
  /** Item href */
  href?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Tab item
 */
export interface TabItem {
  /** Tab key */
  key: string;
  /** Tab label */
  label: string;
  /** Tab content */
  content?: ReactNode;
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Tab icon */
  icon?: ReactNode;
}

/**
 * Tabs component props
 */
export interface TabsProps extends BaseComponentProps {
  /** Tab items */
  items: TabItem[];
  /** Active tab key */
  activeTab: string;
  /** Tab change handler */
  onTabChange: (tabKey: string) => void;
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical';
}

// =============================================================================
// FILE UPLOAD COMPONENT TYPES
// =============================================================================

/**
 * File upload component props
 */
export interface FileUploadProps extends FormFieldProps {
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

/**
 * File preview interface
 */
export interface FilePreview {
  file: File;
  url?: string;
  isImage: boolean;
  error?: string;
}

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

/**
 * Search result item interface
 */
export interface SearchResultItem<T = any> {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  data: T;
  type: string;
  score?: number;
  highlighted?: string[];
}

// =============================================================================
// BUTTON GROUP COMPONENT TYPES
// =============================================================================

/**
 * Button group option interface
 */
export interface ButtonGroupOption<T = string> {
  label: string;
  value: T;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
}

/**
 * Button group component props
 */
export interface ButtonGroupProps<T = string> extends BaseComponentProps {
  options: ButtonGroupOption<T>[];
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  multiple?: boolean;
  size?: ComponentSize;
  variant?: ComponentVariant;
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  disabled?: boolean;
}

// =============================================================================
// DIALOG AND CONFIRMATION TYPES
// =============================================================================

/**
 * Dialog action interface
 */
export interface DialogAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: ComponentVariant;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Confirmation dialog props
 */
export interface ConfirmationDialogProps extends BaseComponentProps {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  loading?: boolean;
}

// =============================================================================
// FORM FIELD TYPES (from lib/types/forms.ts)
// =============================================================================

/**
 * Base form field props that all form components should implement
 */
export interface BaseFieldSetProps {
  /** Field label text */
  label?: string;
  /** Helper text shown below the field */
  helperText?: string;
  /** Error message text (overrides helperText when present) */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Placeholder text for input fields */
  placeholder?: string;
}

/**
 * Props for form fields with icon support
 */
export interface FieldSetWithIconsProps extends BaseFieldSetProps {
  /** Icon displayed on the left side */
  leftIcon?: ReactNode;
  /** Icon displayed on the right side */
  rightIcon?: ReactNode;
  /** Addon content displayed on the left side (e.g., currency symbol) */
  leftAddon?: ReactNode;
  /** Addon content displayed on the right side (e.g., unit label) */
  rightAddon?: ReactNode;
}

/**
 * Props for clearable form fields
 */
export interface ClearableFieldSetProps extends FieldSetWithIconsProps {
  /** Whether the field can be cleared */
  clearable?: boolean;
  /** Callback when field is cleared */
  onClear?: () => void;
}

/**
 * Common validation state types for forms
 */
export type FormValidationState = 'default' | 'error' | 'success' | 'warning';

/**
 * Common field sizes for forms
 */
export type FormFieldSize = 'sm' | 'md' | 'lg';

/**
 * Props for form fields with validation states
 */
export interface ValidatedFieldSetProps extends ClearableFieldSetProps {
  /** Visual state of the field */
  state?: FormValidationState;
  /** Size variant of the field */
  size?: FormFieldSize;
}

/**
 * Props for form fields with loading states
 */
export interface LoadableFieldSetProps extends ValidatedFieldSetProps {
  /** Whether the field is in loading state */
  loading?: boolean;
}

/**
 * Generic select option type for dropdown components
 */
export interface GenericSelectOption<T = string> {
  /** Display label */
  label: string;
  /** Option value */
  value: T;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional group/category */
  group?: string;
}

/**
 * Props for select field components
 */
export interface SelectFieldBaseProps<T = string> extends LoadableFieldSetProps {
  /** Available options */
  options: GenericSelectOption<T>[];
  /** Currently selected value */
  value?: T | T[];
  /** Callback when selection changes */
  onChange?: (value: T | T[] | undefined) => void;
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  /** Whether the field is searchable */
  searchable?: boolean;
  /** Custom search filter function */
  filterOption?: (option: GenericSelectOption<T>, search: string) => boolean;
}

/**
 * Props for form section/group components
 */
export interface FormSectionProps {
  /** Section title/legend */
  title?: string;
  /** Section description */
  description?: string;
  /** Child form fields */
  children: ReactNode;
  /** Whether any field in the section is required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Spacing between fields */
  spacing?: 'sm' | 'md' | 'lg';
  /** Section layout orientation */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Common field validation function type for forms
 */
export type FormFieldValidator<T> = (value: T) => string | undefined;

/**
 * Props for form fields with built-in validation
 */
export interface ValidatableFieldSetProps<T> extends LoadableFieldSetProps {
  /** Field value */
  value?: T;
  /** Change handler */
  onChange?: (value: T) => void;
  /** Validation function */
  validator?: FormFieldValidator<T>;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
}

// FormMode moved to forms.ts to avoid duplication

/**
 * Common form submission state
 */
export interface FormSubmissionState {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been submitted successfully */
  isSubmitted: boolean;
  /** General form error message */
  error?: string;
  /** Field-specific validation errors */
  fieldErrors?: Record<string, string>;
}

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

/**
 * Command menu context value interface
 */
export interface CommandMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

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

/**
 * Command menu context extended interface (continued from above)
 */
export interface CommandMenuContextExtended extends CommandMenuContextValue {
  filteredItems: CommandMenuItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  executeCommand: (item: CommandMenuItem) => void;
}

/**
 * Command menu variant types
 */
export type CommandMenuVariant = 'default' | 'compact';
export type CommandMenuSize = 'sm' | 'md' | 'lg';

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
 * Population pyramid age group data
 * Consolidates from src/lib/ui/population-pyramid.ts
 */
export interface AgeGroupData {
  ageGroup: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Population statistics interface
 * Consolidates from src/lib/ui/population-pyramid.ts
 */
export interface PopulationStats {
  total: number;
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
}

/**
 * Tooltip data for charts
 * Consolidates from src/lib/ui/population-pyramid.ts
 */
export interface TooltipData {
  label: string;
  value: number;
  percentage: number;
  gender?: 'male' | 'female';
  color?: string;
}

/**
 * Pie slice data interface
 * Consolidates from src/lib/ui/pieChartMath.ts
 */
export interface PieSliceData {
  value: number;
  color: string;
  label: string;
}

/**
 * Pie slice with calculated angles
 * Consolidates from src/lib/ui/pieChartMath.ts
 */
export interface PieSliceWithAngles extends PieSliceData {
  startAngle: number;
  endAngle: number;
  percentage: number;
}

// =============================================================================
// PWA AND USER BEHAVIOR TYPES (from src/lib/analytics)
// =============================================================================

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
