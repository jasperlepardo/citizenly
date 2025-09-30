/**
 * Option Component Utilities
 * Helper functions for the Option component
 */

export interface ParsedLabel {
  main: string;
  secondary: string | null;
}

/**
 * Parse label text that may contain comma-separated values
 */
export const parseOptionLabel = (label?: string): ParsedLabel => {
  if (!label?.includes(',')) {
    return { main: label || '', secondary: null };
  }

  const parts = label.split(',');
  return {
    main: parts[0],
    secondary: parts.slice(1).join(',')
  };
};

/**
 * Generate CSS class names for option states
 */
export const getOptionClassName = (
  focused: boolean,
  selected: boolean,
  disabled: boolean,
  customClassName = ''
): string => {
  const baseClasses = 'cursor-pointer px-3 py-3 transition-colors duration-150 sm:px-4';
  const focusClasses = focused
    ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
    : 'text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700';
  const selectedClasses = selected ? 'bg-blue-100 font-medium dark:bg-blue-900/20' : '';
  const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : '';

  return `${baseClasses} ${focusClasses} ${selectedClasses} ${disabledClasses} ${customClassName}`.trim();
};