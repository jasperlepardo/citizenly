/**
 * Preload On Hover Hook
 * 
 * @description Performance optimization hook that preloads lazy-loaded components
 * when a user hovers over triggering elements. This reduces perceived load times
 * by fetching components before they're actually needed.
 * 
 * @example
 * ```tsx
 * function MyButton() {
 *   const preloadProps = usePreloadOnHover('dataTable');
 *   
 *   return (
 *     <button {...preloadProps} onClick={handleClick}>
 *       Load Data Table
 *     </button>
 *   );
 * }
 * ```
 * 
 * @since 1.0.0
 */

import { preloadComponents } from '@/lib';

/**
 * Return type for the usePreloadOnHover hook
 * 
 * @interface UsePreloadOnHoverReturn
 */
export interface UsePreloadOnHoverReturn {
  /** 
   * Mouse enter event handler that triggers component preloading
   * Apply this to the element that should trigger preloading on hover
   */
  readonly onMouseEnter: () => void;
}

/**
 * Hook for preloading lazy components on hover interaction
 * 
 * @param componentKey - The key of the component to preload from the preloadComponents registry
 * @returns Object containing the onMouseEnter handler for triggering preload
 * 
 * @throws {Error} If componentKey is not found in preloadComponents registry
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const preloadProps = usePreloadOnHover('createHouseholdModal');
 * 
 * // Apply to button
 * <Button {...preloadProps} onClick={openModal}>
 *   Create Household
 * </Button>
 * ```
 */
export function usePreloadOnHover(
  componentKey: keyof typeof preloadComponents
): UsePreloadOnHoverReturn {
  return {
    onMouseEnter: () => {
      try {
        preloadComponents[componentKey]();
      } catch (error) {
        console.warn(`Failed to preload component "${String(componentKey)}":`, error);
      }
    },
  };
}