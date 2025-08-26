/**
 * Utility Hooks Module
 *
 * @description General-purpose utility hooks for common functionality
 * like error handling, performance monitoring, logging, and state management.
 */

// Error handling and monitoring
export { useAsyncErrorBoundary } from './useAsyncErrorBoundary';
export { useFieldErrorHandler } from './useFieldErrorHandler';
export { useLogger } from './useLogger';
export { usePerformanceMonitor, withPerformanceMonitoring } from './usePerformanceMonitor';
export { useRetryLogic, RetryStrategies, withRetryLogic } from './useRetryLogic';

// State and data persistence
export { useDebounce } from './useDebounce';
export { usePersistedState } from './usePersistedState';
export { useSelector } from './useSelector';

// Navigation and UI
export { useLastVisitedPage } from './useLastVisitedPage';
export { useConnectionStatus } from './useConnectionStatus';
export { usePreloadOnHover } from './usePreloadOnHover';

// Domain-specific utilities
export { useUserBarangay } from './useUserBarangay';
export { useAddressResolution } from './useAddressResolution';
export { useHouseholdCodeGeneration } from './useHouseholdCodeGeneration';
export { useHouseholdForm } from './useHouseholdForm';
export { useMigrationInformation } from './useMigrationInformation';

// Form utilities
export { useFormSubmission } from './useFormSubmission';
export { useResidentSubmission } from './useResidentSubmission';

// Validation utilities
export { createValidationHook } from './createValidationHook';
