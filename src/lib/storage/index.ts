/**
 * Storage Compatibility Layer
 * @deprecated Use @/lib/data instead - this module will be removed in v3.0.0
 * @description Temporary re-export for backward compatibility during migration
 */

// Development warning for deprecated import
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  DEPRECATED IMPORT: @/lib/storage is deprecated.\n' +
    '   Please use: @/lib/data instead.\n' +
    '   This compatibility layer will be removed in v3.0.0'
  );
}

// Re-export from new location
export * from '../data/offline-storage';
export * from '../data/query-cache';
export * from '../data/recent-items-storage';
export * from '../data/sync-queue';