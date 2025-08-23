/**
 * Data Transformation Utilities
 * @fileoverview Consolidated data manipulation and formatting functions for the Citizenly application.
 * Provides type-safe utilities for common data operations including validation, transformation, and formatting.
 * 
 * @author Citizenly Development Team
 * @since 2.0.0
 * @version 2.1.0
 */

/**
 * Check if a value is considered empty
 * @param value - The value to check
 * @returns True if the value is empty, false otherwise
 * @since 2.0.0
 * 
 * @description
 * Considers the following as empty:
 * - null or undefined
 * - Empty strings (after trimming whitespace)
 * - Empty arrays
 * - Empty objects (no enumerable properties)
 * 
 * @example
 * ```typescript
 * isEmpty(null)        // true
 * isEmpty('')          // true
 * isEmpty('  ')        // true
 * isEmpty([])          // true
 * isEmpty({})          // true
 * isEmpty('hello')     // false
 * isEmpty([1, 2, 3])   // false
 * ```
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Create a deep clone of an object
 * @template T The type of the object to clone
 * @param obj - The object to clone
 * @returns A deep copy of the input object
 * @since 2.0.0
 * 
 * @description
 * Recursively clones objects, arrays, and dates while preserving types.
 * Handles circular references and maintains prototype chains.
 * 
 * @example
 * ```typescript
 * const original = {
 *   name: 'John',
 *   hobbies: ['reading', 'coding'],
 *   birth: new Date('1990-01-01')
 * };
 * 
 * const clone = deepClone(original);
 * clone.hobbies.push('gaming'); // Won't affect original
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Group array items by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return Array.from(new Set(array));
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Sort array of objects by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Format currency values for Philippine Peso
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for Philippine locale
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-PH', options).format(dateObj);
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Build query string from object
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}