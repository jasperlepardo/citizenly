/**
 * Configuration Module
 * Centralized configuration exports
 */

export * from './dev-config';
// Note: Only export from environment to avoid conflicts
export {
  getEnvironment,
  isDevelopment,
  isStaging, 
  isProduction,
  isTest,
  isProductionLike,
  isDebugEnabled,
  getEnvironmentConfig,
  getSupabaseConfig,
  createLogger,
  validateEnvironment,
  performRuntimeHealthCheck,
  logEnvironmentStatus
} from './environment';

// Export specific items from env-config that don't conflict
export {
  QUALITY_TIERS,
  detectEnvironment,
  getQualityChecks,
  getToolConfig,
  logEnvironmentInfo,
  shouldEnableFeature
} from './env-config';