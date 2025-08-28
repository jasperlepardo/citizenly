/**
 * Data Systems Index
 * @description Complete data layer including database, storage, supabase, and performance
 */

// Database utilities (moved from database/)
export * from './database-utils';
export * from './field-utils';
export * from './query-utils';

// Supabase utilities (moved from supabase/)
export * from './supabase';
export * from './client-factory';

// Storage utilities (moved from storage/)
export * from './offline-storage';
export * from './query-cache';
export * from './recent-items-storage';
export * from './sync-queue';

// Performance monitoring (was already referenced)
export * from '../performance';

// Repository pattern exports
export { BaseRepository } from '@/services/base-repository';
export type { QueryOptions, RepositoryError, RepositoryResult } from '@/types/services';

// Data types
export type { ResidentRecord as ResidentData } from '@/types';
export type { ResidentSearchOptions } from '@/services/resident-repository';
export type { HouseholdData, HouseholdSearchOptions } from '@/services/household-repository';
export type { UserData } from '@/services/user-repository';
