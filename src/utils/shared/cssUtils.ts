/**
 * CSS Utility Functions
 * Consolidated CSS class manipulation utilities
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 *
 * This function intelligently merges CSS classes, handling conflicts between
 * Tailwind utilities (e.g., text-sm vs text-lg)
 *
 * @param inputs - Any number of class values (strings, arrays, objects, conditionals)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * // Standard usage
 * cn('text-sm', 'text-lg') // Returns: 'text-lg' (last wins)
 *
 * // Conditional classes
 * cn('p-4', { 'p-6': isLarge })
 *
 * // With arrays
 * cn(['p-4', 'text-gray-500'], condition && 'text-blue-500')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// REMOVED: mergeClassNames - Use `cn` instead for consistency
