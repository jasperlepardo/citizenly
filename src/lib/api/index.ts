/**
 * API Compatibility Layer
 * @deprecated Use @/lib/authentication instead - this module will be removed in v3.0.0
 * @description Temporary re-export for backward compatibility during migration
 */

// Development warning for deprecated import
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  DEPRECATED IMPORT: @/lib/api is deprecated.\n' +
      '   Please use: @/lib/authentication instead.\n' +
      '   This compatibility layer will be removed in v3.0.0'
  );
}

// Re-export from new location
export * from '../authentication';
