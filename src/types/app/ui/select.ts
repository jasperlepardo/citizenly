/**
 * Enhanced Select Component Types
 * Comprehensive type definitions for the Select component
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  category?: string;
  badge?: string;
}

export type DropdownPosition = 'below' | 'above';

export type SelectDataSource = SelectOption[] | Record<string, string>;

export interface SelectSearchConfig {
  /** Enable search functionality */
  searchable?: boolean;
  /** Minimum characters before triggering search */
  minSearchLength?: number;
  /** Search debounce delay in milliseconds */
  searchDelay?: number;
  /** Server-side search function */
  onSearch?: (query: string) => void;
}

export interface SelectCreationConfig {
  /** Allow custom value entry */
  allowCustom?: boolean;
  /** Allow creating new options */
  allowCreate?: boolean;
  /** Callback to create new option */
  onCreateNew?: (inputValue: string) => Promise<SelectOption>;
}

export interface SelectLoadingConfig {
  /** Show loading state */
  loading?: boolean;
  /** Enable infinite scroll */
  infiniteScroll?: boolean;
  /** Has more items to load */
  hasMore?: boolean;
  /** Callback to load more items */
  onLoadMore?: () => void;
  /** Loading more items state */
  loadingMore?: boolean;
}

export type SelectProps = Readonly<{
  // Core props
  value?: string;
  onSelect: (option: SelectOption | null) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  name?: string;
  id?: string;
  disabled?: boolean;

  // Data sources
  options?: SelectOption[];
  enumData?: SelectDataSource;

  // Search configuration
  searchable?: boolean;
  onSearch?: (query: string) => void;
  loading?: boolean;

  // Creation configuration
  allowCustom?: boolean;
  allowCreate?: boolean;
  onCreateNew?: (inputValue: string) => Promise<SelectOption>;

  // Loading configuration
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  infiniteScroll?: boolean;
}>;

export interface SelectState {
  inputValue: string;
  normalizedOptions: SelectOption[];
  filteredOptions: SelectOption[];
  selectedOption: SelectOption | null;
  showDropdown: boolean;
  focusedIndex: number;
  dropdownPosition: DropdownPosition;
  justSelected: boolean;
  isCreating: boolean;
  createError: string | null;
}

export interface SelectRefs {
  debounceTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  inputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  optionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  lastSearchRef: React.MutableRefObject<string>;
}

export interface SelectHandlers {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleOptionSelect: (option: SelectOption) => void;
  handleClearClick: (e: React.MouseEvent) => void;
  handleCreateNew: () => Promise<void>;
  handleDropdownIconClick: () => void;
}

export type OptionProps = Readonly<{
  /** Unique identifier for the option */
  id?: string;
  /** Whether this option is currently selected */
  selected?: boolean;
  /** Whether this option is currently focused/highlighted */
  focused?: boolean;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Main option label */
  label: string;
  /** Optional description text */
  description?: string;
  /** Optional value for the option */
  value?: string;
  /** Optional badge text to display on the right */
  badge?: string;
  /** Click handler */
  onClick?: () => void;
  /** Mouse enter handler for focus management */
  onMouseEnter?: () => void;
  /** Key down handler for keyboard navigation */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Custom class name */
  className?: string;
  /** Custom children to override default rendering */
  children?: React.ReactNode;
}>;