/**
 * @deprecated This file has been moved to services layer for proper architecture.
 * Use @/services/domain/residents/residentDataProcessingService instead.
 * 
 * This file provides backward compatibility exports during the migration period.
 * It will be removed in a future version.
 * 
 * ARCHITECTURAL NOTE: Business logic should be in services, not utils.
 * Utils should only contain pure functions with no business domain knowledge.
 */

// Re-export from the new service location for backward compatibility
export {
  validateRequiredFields,
  validateFormData,
  transformFormData,
  parseFullName,
  prepareFormSubmission,
} from '@/services/domain/residents/residentDataProcessingService';

// Import the service class for advanced usage
export { ResidentDataProcessingService } from '@/services/domain/residents/residentDataProcessingService';

// Re-export types that were used by this module
export type {
  NameParts,
  UnknownFormData,
  FormProcessingOptions,
  ProcessedFormResult,
} from '@/types/shared/utilities/utilities';

export type { SimpleValidationResult as ValidationResult } from '@/types/shared/validation/validation';