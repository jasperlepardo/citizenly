/**
 * Services Layer Exports
 * CONSOLIDATED - Centralized exports for all services, repositories, and business logic
 * Following coding standards with proper service consolidation
 */

// Base repository exports
export { BaseRepository } from './base-repository';

// Import types from their proper location
export type { QueryOptions, RepositoryError, RepositoryResult } from '@/types/services';

// Repository exports
export { ResidentRepository, type ResidentSearchOptions } from './resident-repository';

// Import database types directly from types layer
export type { ResidentRecord as ResidentData } from '@/types';

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
export * from './geographic.service';

// Data transformers and mappers
export * from './resident-mapper';
export * from './form-data-transformers';

// Optimized data fetchers
export * from './household-fetcher';
export * from './resident-details-fetcher';

// Repository class imports for factory
import type { ValidationContext } from '@/lib/validation/types';

import { HouseholdRepository } from './household-repository';
import { ResidentRepository } from './resident-repository';
import { UserRepository } from './user-repository';

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

// CONSOLIDATED SERVICES - Clean centralized service layer
// All duplicate directories removed, legacy code cleaned up
export { authService, AuthService } from './authService';
// Import auth types from centralized location
export type { AuthUserProfile, UserRole, SignupRequest } from '@/types/auth';
export {
  cacheService,
  CacheService,
  cached,
  CacheKeys,
  CacheTags,
  setupCacheCleanup,
} from './cacheService';
export { commandMenuService, CommandMenuService } from './command-menu-service';
export { databaseService, DatabaseService } from './database-service';
export { addressService, AddressService } from './addressService';
export {
  securityAuditService,
  SecurityAuditService,
  type SecurityAuditLog,
  type ThreatDetectionEvent,
  AuditEventType,
} from './security-audit-service';
export { syncService, SyncService, type SyncQueueItem, type SyncStatus } from './sync-service';
