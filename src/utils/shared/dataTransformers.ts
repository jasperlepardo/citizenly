/**
 * Data Transformation Utilities
 * Consolidated data manipulation and formatting functions
 */

/**
 * Check if value is empty
 *
 * @description Determines if a value is considered "empty" based on its type.
 * Handles null, undefined, empty strings, empty arrays, and empty objects.
 *
 * @param value - The value to check for emptiness
 * @returns True if the value is empty, false otherwise
 *
 * @example
 * ```typescript
 * isEmpty(null)        // → true
 * isEmpty('')          // → true
 * isEmpty('  ')        // → true (whitespace-only)
 * isEmpty([])          // → true
 * isEmpty({})          // → true
 * isEmpty('hello')     // → false
 * isEmpty([1, 2])      // → false
 * isEmpty({ a: 1 })    // → false
 * ```
 *
 * @since 2.0.0
 * @public
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone an object
 *
 * @description Creates a deep copy of any value, handling nested objects, arrays, and dates.
 * Uses structural cloning to avoid reference sharing between original and cloned values.
 *
 * @template T - The type of the value being cloned
 * @param obj - The value to clone
 * @returns A deep copy of the input value
 *
 * @example
 * ```typescript
 * const original = { user: { name: 'John', tags: ['admin'] }, date: new Date() };
 * const cloned = deepClone(original);
 *
 * cloned.user.name = 'Jane';
 * cloned.user.tags.push('user');
 *
 * // Original remains unchanged
 * console.log(original.user.name); // → 'John'
 * console.log(original.user.tags);  // → ['admin']
 * ```
 *
 * @since 2.0.0
 * @public
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Group array elements by a specified property key
 *
 * @description Groups an array of objects by the value of a specified key.
 * Returns an object where keys are the grouped values and values are arrays of matching elements.
 *
 * @template T - The type of elements in the array
 * @template K - The key type used for grouping (must be a key of T)
 * @param array - The array of elements to group
 * @param key - The property key to group elements by
 * @returns An object where keys are the grouped values and values are arrays of elements
 *
 * @example
 * ```typescript
 * const users = [
 *   { name: 'John', role: 'admin', age: 30 },
 *   { name: 'Jane', role: 'user', age: 25 },
 *   { name: 'Bob', role: 'admin', age: 35 }
 * ];
 *
 * const byRole = groupBy(users, 'role');
 * // Result: {
 * //   admin: [{ name: 'John', role: 'admin', age: 30 }, { name: 'Bob', role: 'admin', age: 35 }],
 * //   user: [{ name: 'Jane', role: 'user', age: 25 }]
 * // }
 * ```
 *
 * @since 2.0.0
 * @public
 */
export function groupBy<T, K extends keyof T>(array: readonly T[], key: K): Record<string, T[]> {
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
 *
 * @description Removes duplicate elements from an array, optionally based on a specific key.
 * For primitive arrays, uses Set for deduplication. For object arrays, uses key-based comparison.
 *
 * @template T - The type of elements in the array
 * @template K - The key type used for comparison (must be a key of T)
 * @param array - The array to remove duplicates from
 * @param key - Optional property key to use for duplicate detection in object arrays
 * @returns A new array with duplicate elements removed
 *
 * @example
 * ```typescript
 * // Remove duplicates from primitive array
 * removeDuplicates([1, 2, 2, 3, 1]); // → [1, 2, 3]
 *
 * // Remove duplicates from object array by key
 * const users = [
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' },
 *   { id: 1, name: 'John Doe' }  // Different name, same id
 * ];
 * removeDuplicates(users, 'id'); // → [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
 * ```
 *
 * @since 2.0.0
 * @public
 */
export function removeDuplicates<T, K extends keyof T>(array: readonly T[], key?: K): T[] {
  if (!key) {
    return Array.from(new Set(array));
  }

  const seen = new Set<T[K]>();
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

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

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
