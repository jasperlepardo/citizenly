/**
 * Component Utilities
 * Simple utilities for components (replacing deleted utils)
 */

/**
 * Simple className concatenation utility
 * Replaces the deleted cssUtils cn function
 * Supports conditional classes similar to clsx
 */
export const cn = (...classes: any[]): string => {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;

    if (typeof cls === 'string') {
      result.push(cls);
    } else if (Array.isArray(cls)) {
      result.push(...cls.filter(Boolean));
    } else if (typeof cls === 'object' && cls !== null) {
      for (const [key, value] of Object.entries(cls)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ');
};