/**
 * Repository Pattern Exports
 * Centralized exports for all repository classes and types
 */

// Base repository exports
export {
  BaseRepository,
  type QueryOptions,
  type RepositoryError,
  type RepositoryResult,
} from './base-repository';

// Repository class imports for factory
import { ResidentRepository } from './resident-repository';
import { HouseholdRepository } from './household-repository';
import { UserRepository } from './user-repository';

// Resident repository exports
export {
  ResidentRepository,
  type ResidentData,
  type ResidentSearchOptions,
} from './resident-repository';

// Household repository exports
export {
  HouseholdRepository,
  type HouseholdData,
  type HouseholdSearchOptions,
} from './household-repository';

// User repository exports
export {
  UserRepository,
  type UserData,
  type UserSearchOptions,
  type UserSecurityData,
} from './user-repository';

// Repository factory for dependency injection
export class RepositoryFactory {
  private context?: any;

  constructor(context?: any) {
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

  setContext(context: any): void {
    this.context = context;
  }
}

// Default repository instances for convenience
export const createRepositories = (context?: any) => ({
  residents: new ResidentRepository(context),
  households: new HouseholdRepository(context),
  users: new UserRepository(context),
});