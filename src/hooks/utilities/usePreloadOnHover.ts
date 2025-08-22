/**
 * Preload On Hover Hook
 * 
 * @description Hook for preloading components on hover for better performance.
 * Extracted from LazyComponents for better maintainability.
 */

// Import preload components from LazyComponents
import { preloadComponents } from '@/components/lazy/LazyComponents';

/**
 * Return type for preload on hover hook
 */
export interface UsePreloadOnHoverReturn {
  /** Event handler for mouse enter */
  onMouseEnter: () => void;
}

/**
 * Utility hook to preload component on hover
 * @param componentKey - Key of the component to preload from preloadComponents
 */
export function usePreloadOnHover(
  componentKey: keyof typeof preloadComponents
): UsePreloadOnHoverReturn {
  return {
    onMouseEnter: () => {
      preloadComponents[componentKey]();
    },
  };
}

// Export for backward compatibility
export default usePreloadOnHover;