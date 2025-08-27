/**
 * CSS Utility Functions
 * Consolidated CSS class manipulation utilities
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence and design system awareness
 *
 * This function intelligently merges CSS classes, handling conflicts between:
 * - Standard Tailwind utilities (text-sm vs text-lg)
 * - Custom design system utilities (text-body vs text-heading)
 * - Semantic spacing tokens (p-4 vs p-6)
 *
 * @param inputs - Any number of class values (strings, arrays, objects, conditionals)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * // Standard usage
 * cn('text-sm', 'text-lg') // Returns: 'text-lg' (last wins)
 *
 * // Design system usage
 * cn('text-body', 'text-heading') // Returns: 'text-heading' (last wins)
 *
 * // Conditional classes
 * cn('p-4', { 'p-6': isLarge, 'text-body': isDefault })
 *
 * // With arrays
 * cn(['p-4', 'text-body'], condition && 'text-heading')
 */
export function cn(...inputs: ClassValue[]): string {
  const classString = clsx(inputs);

  // Design system token patterns
  const designTokenPatterns = [
    // Spacing tokens: p-4, px-3, gap-6, etc.
    /\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap)-(micro|tiny|xs|sm|md|lg|xl|2xl|3xl|4xl)\b/,
    // Typography tokens: text-body, text-heading-lg, etc.
    /\btext-(body|heading|display|caption|overline|label)(-2xs|-xs|-sm|-lg|-xl|-2xl)?\b/,
  ];

  // Skip tailwind-merge for design system classes to prevent conflicts
  const hasDesignTokens = designTokenPatterns.some(pattern => pattern.test(classString));

  return hasDesignTokens ? classString : twMerge(classString);
}

// REMOVED: mergeClassNames - Use `cn` instead for consistency
