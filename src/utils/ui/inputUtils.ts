/**
 * Input Component Utilities
 * Helper functions for the Input component
 */

/**
 * Generate container classes based on error state and custom className
 */
export const getContainerClasses = (error: string | undefined, className: string): string => {
  const baseClasses = 'font-system relative flex w-full items-center transition-colors focus-within:outline-hidden min-h-10 p-2 text-base';

  const stateClasses = error
    ? 'rounded-sm border border-red-600 bg-white focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)] dark:bg-gray-800'
    : 'rounded-sm border border-gray-300 bg-white focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)] dark:border-gray-600 dark:bg-gray-800';

  return `${baseClasses} ${stateClasses} ${className}`;
};

/**
 * Generate input field classes
 */
export const getInputClasses = (): string => {
  return 'font-montserrat w-full border-0 bg-transparent text-base leading-5 font-normal text-gray-600 shadow-none ring-0 outline-0 placeholder:text-gray-500 focus:border-0 focus:shadow-none focus:ring-0 focus:outline-0 dark:text-gray-300 dark:placeholder:text-gray-400';
};

/**
 * Generate input styles
 */
export const getInputStyles = (): React.CSSProperties => ({
  border: 'none',
  outline: 'none',
  boxShadow: 'none',
  appearance: 'none',
});

/**
 * Check if input has a meaningful value
 */
export const hasInputValue = (value: unknown): boolean => {
  return value !== undefined && value !== null && value !== '';
};