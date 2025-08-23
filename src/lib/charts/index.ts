/**
 * Charts Compatibility Layer
 * @deprecated Use @/lib/ui instead - this module will be removed in v3.0.0
 * @description Temporary re-export for backward compatibility during migration
 */

// Development warning for deprecated import
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  DEPRECATED IMPORT: @/lib/charts is deprecated.\n' +
    '   Please use: @/lib/ui instead.\n' +
    '   This compatibility layer will be removed in v3.0.0'
  );
}

// Re-export from new location
export * from '../ui/chart-transformers';