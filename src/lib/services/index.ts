/**
 * Services Module
 *
 * Centralized business logic and API operations.
 * Services handle data transformation, validation, and database operations.
 */

// Export service instances
export { residentService } from './resident.service';
export { householdService } from './household.service';

// Export types for consumers
export type {
  ResidentFormData,
  UserAddress as ResidentUserAddress,
  CreateResidentRequest,
  CreateResidentResponse,
  ValidationError as ResidentValidationError,
  ResidentValidationResult,
} from './resident.service';

export type {
  HouseholdFormData,
  UserAddress as HouseholdUserAddress,
  CreateHouseholdRequest,
  CreateHouseholdResponse,
  ValidationError as HouseholdValidationError,
  HouseholdValidationResult,
} from './household.service';
