/**
 * Services Layer Exports
 * Centralized exports for all services, repositories, and business logic
 */

// Base repository exports
export {
  BaseRepository,
  type QueryOptions,
  type RepositoryError,
  type RepositoryResult,
} from './base-repository';

// Repository exports  
export {
  ResidentRepository,
  type ResidentSearchOptions,
} from './resident-repository';

// Import database types directly from types layer
export type { ResidentDatabaseRecord as ResidentData } from '@/types/residents';

export {
  HouseholdRepository,
  type HouseholdData,
  type HouseholdSearchOptions,
} from './household-repository';

export {
  UserRepository,
  type UserData,
  type UserSearchOptions,
  type UserSecurityData,
} from './user-repository';

// Business services  
export { residentService as ResidentService } from './resident.service';
export { householdService as HouseholdService } from './household.service';
export { geographicService as GeographicService } from './geographic.service';

// Data transformers and mappers
export * from './residentMapper';
export * from './formDataTransformers';

// Optimized data fetchers
export * from './household-fetcher';
export * from './resident-details-fetcher';

// Repository class imports for factory
import { ResidentRepository } from './resident-repository';
import { HouseholdRepository } from './household-repository';
import { UserRepository } from './user-repository';
import type { ValidationContext } from '@/lib/validation/types';

// Repository factory for dependency injection
export class RepositoryFactory {
  private context?: ValidationContext;

  constructor(context?: ValidationContext) {
    this.context = context;
  }

  createResidentRepository(): ResidentRepository {
    return new ResidentRepository(this.context);
  }

  createHouseholdRepository(): HouseholdRepository {
    return new HouseholdRepository(this.context);
  }

  createUserRepository(): UserRepository {
    return new UserRepository(this.context);
  }

  setContext(context: ValidationContext): void {
    this.context = context;
  }
}

// Default repository instances for convenience
export const createRepositories = (context?: ValidationContext) => ({
  residents: new ResidentRepository(context),
  households: new HouseholdRepository(context),
  users: new UserRepository(context),
});