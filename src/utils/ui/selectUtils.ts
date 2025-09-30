/**
 * Select Component Utility Functions
 * Helper functions for Select component logic and data processing
 */

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  category?: string;
  badge?: string;
};

/**
 * Normalizes various data formats into SelectOption array
 */
export const normalizeOptions = (
  data: SelectOption[] | Record<string, string> | undefined
): SelectOption[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  // Convert enum or object to options
  return Object.entries(data).map(([key, value]) => ({
    value: key,
    label: typeof value === 'string' ? value : String(value),
  }));
};

/**
 * Filters static options based on input value and search criteria
 */
export const filterStaticOptions = (
  normalizedOptions: SelectOption[],
  inputValue: string,
  searchable: boolean
): SelectOption[] => {
  if (!inputValue.trim() || !searchable) {
    return [];
  }

  return normalizedOptions.filter(
    option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.description?.toLowerCase().includes(inputValue.toLowerCase())
  );
};

/**
 * Handles input change logic for both static and API-driven selects
 */
export const handleInputChangeLogic = (
  query: string,
  selectedOption: SelectOption | null,
  normalizedOptions: SelectOption[],
  allowCustom: boolean,
  onSearch?: (query: string) => void
): {
  shouldClearSelection: boolean;
  matchingOption: SelectOption | null;
  customOption: SelectOption | null;
} => {
  let shouldClearSelection = false;
  let matchingOption: SelectOption | null = null;
  let customOption: SelectOption | null = null;

  if (!onSearch) {
    if (selectedOption && query !== selectedOption.label) {
      shouldClearSelection = true;
    }

    matchingOption = normalizedOptions.find(
      option => option.label === query || option.value === query
    ) || null;

    if (allowCustom && query.trim() && !matchingOption) {
      customOption = { value: query, label: query };
    }
  } else if (selectedOption && query !== selectedOption.label) {
    shouldClearSelection = true;
  }

  return { shouldClearSelection, matchingOption, customOption };
};

/**
 * Handles focus logic for static data
 */
export const handleStaticDataFocus = (
  normalizedOptions: SelectOption[],
  selectedOption: SelectOption | null
): { filteredOptions: SelectOption[]; focusedIndex: number } => {
  const filteredOptions = normalizedOptions;
  let focusedIndex = 0;

  if (selectedOption) {
    const selectedIndex = normalizedOptions.findIndex(
      opt => opt.value === selectedOption.value
    );
    focusedIndex = selectedIndex >= 0 ? selectedIndex : 0;
  }

  return { filteredOptions, focusedIndex };
};

/**
 * Handles focus logic for API-driven data
 */
export const handleApiDataFocus = (): { showDropdown: boolean; focusedIndex: number } => {
  return { showDropdown: true, focusedIndex: -1 };
};

/**
 * Handles dropdown toggle logic
 */
export const handleDropdownToggle = (
  showDropdown: boolean,
  onSearch: ((query: string) => void) | undefined,
  normalizedOptions: SelectOption[],
  selectedOption: SelectOption | null
): {
  shouldShow: boolean;
  filteredOptions: SelectOption[];
  focusedIndex: number;
} => {
  if (showDropdown) {
    return { shouldShow: false, filteredOptions: [], focusedIndex: -1 };
  }

  if (onSearch) {
    return { shouldShow: true, filteredOptions: [], focusedIndex: -1 };
  }

  const { filteredOptions, focusedIndex } = handleStaticDataFocus(normalizedOptions, selectedOption);
  return { shouldShow: true, filteredOptions, focusedIndex };
};