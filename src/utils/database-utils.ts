/**
 * Database Utilities
 * Consolidated database query and operation utilities
 */

/**
 * Batch operations utility for large data operations
 */
export const performBatchOperation = async <T>(
  items: T[],
  batchSize: number,
  operation: (batch: T[]) => Promise<void>
): Promise<void> => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await operation(batch);

    // Small delay to prevent overwhelming the database
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};

/**
 * Type guard for checking if data is fresh enough
 */
export const isDataFresh = (timestamp: string | Date, maxAgeMinutes: number): boolean => {
  const dataTime = new Date(timestamp);
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - maxAgeMinutes);

  return dataTime > cutoff;
};

/**
 * Build WHERE clause for database queries
 */
export function buildWhereClause(conditions: Record<string, any>): string {
  const clauses = Object.entries(conditions)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key} IN (${value.map(v => `'${v}'`).join(', ')})`;
      }
      return `${key} = '${value}'`;
    });

  return clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
}

/**
 * Sanitize database query to prevent SQL injection
 */
export function sanitizeDatabaseQuery(input: string): string {
  return input
    .replace(/[^\w\s-_.]/g, '') // Remove special characters except safe ones
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100); // Limit length
}