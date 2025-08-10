/**
 * Citizenly Services
 * 
 * Centralized business logic layer for all data operations.
 * These services abstract away direct database calls and provide
 * a consistent interface for components to interact with data.
 */

// Base service class
export { ServiceBase } from './base/ServiceBase';
export type { ServiceResponse, PaginationOptions, SearchOptions } from './base/ServiceBase';

// Barangay service
export { BarangayService, barangayService } from './BarangayService';
export type { Barangay, BarangayWithHierarchy } from './BarangayService';

// Resident service  
export { ResidentService, residentService } from './ResidentService';
export type { Resident, ResidentWithHousehold, ResidentFilters } from './ResidentService';

// Household service
export { HouseholdService, householdService } from './HouseholdService';
export type { 
  Household, 
  HouseholdWithMembers, 
  HouseholdFilters, 
  HouseholdRegistrationData 
} from './HouseholdService';

/**
 * Service Usage Examples:
 * 
 * // Search barangays
 * const { data, error } = await barangayService.searchByName('Manila');
 * 
 * // Get household with members
 * const { data, error } = await householdService.getHouseholdWithMembers(id);
 * 
 * // Register new household
 * const { data, error } = await householdService.registerHousehold({
 *   household: { ... },
 *   residents: [ ... ]
 * });
 * 
 * // Get statistics
 * const { data, error } = await residentService.getStatistics(barangayCode);
 */