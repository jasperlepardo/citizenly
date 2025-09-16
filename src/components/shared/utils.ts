/**
 * Component Utilities
 * Simple utilities for components (replacing deleted utils)
 */

/**
 * Simple className concatenation utility
 * Replaces the deleted cssUtils cn function
 */
export const cn = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};