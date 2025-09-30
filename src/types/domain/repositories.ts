/**
 * Domain Repository Interfaces
 * Pure interfaces with no infrastructure dependencies
 */

import type { RepositoryResult } from '../infrastructure/services/repositories';

import type { HouseholdData } from './households/households';
import type { Resident } from './residents/core';
import type { ResidentFormData } from './residents/forms';

/**
 * Base Repository Interface
 * Common operations for all repositories
 */
interface BaseRepository<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  create(data: CreateData): Promise<RepositoryResult<T>>;
  update(id: string, data: UpdateData): Promise<RepositoryResult<T>>;
  findById(id: string): Promise<RepositoryResult<T>>;
  delete(id: string): Promise<RepositoryResult<boolean>>;
}

/**
 * Resident Repository Interface
 * Defines the contract for resident data operations
 */
export interface IResidentRepository extends BaseRepository<Resident, Partial<Resident>> {
  findAll(options?: {
    search?: string;
    page?: number;
    limit?: number;
    barangayCode?: string;
    cityCode?: string;
    provinceCode?: string;
    regionCode?: string;
    searchTerm?: string;
    offset?: number;
    pageSize?: number;
  }): Promise<RepositoryResult<Resident[]>>;
  
  findByHousehold(householdCode: string): Promise<RepositoryResult<Resident[]>>;
  
  validate(data: ResidentFormData): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  }>;
}

/**
 * Household Repository Interface
 */
export interface IHouseholdRepository extends BaseRepository<HouseholdData> {
  findAll(options?: {
    search?: string;
    page?: number;
    limit?: number;
    barangayCode?: string;
    cityCode?: string;
    provinceCode?: string;
    regionCode?: string;
  }): Promise<RepositoryResult<HouseholdData[]>>;
  
  findByCode(code: string): Promise<RepositoryResult<HouseholdData>>;
}

/**
 * Auth Repository Interface
 */
export interface IAuthRepository {
  // Authentication methods
  signUp(email: string, password: string, userData?: any): Promise<RepositoryResult<any>>;
  signIn(email: string, password: string): Promise<RepositoryResult<any>>;
  signOut(): Promise<RepositoryResult<boolean>>;
  getCurrentUser(): Promise<RepositoryResult<any>>;

  // Profile methods
  findUserProfile(userId: string): Promise<RepositoryResult<any>>;
  updateUserProfile(userId: string, data: any): Promise<RepositoryResult<any>>;
  createUserProfile(data: any): Promise<RepositoryResult<any>>;
  updateProfile(userId: string, data: any): Promise<RepositoryResult<any>>;
  getProfile(userId: string): Promise<RepositoryResult<any>>;

  // User management
  findUserByEmail(email: string): Promise<RepositoryResult<any>>;
  verifyUserCredentials(email: string, password: string): Promise<RepositoryResult<any>>;
  updateUserPassword(userId: string, newPassword: string): Promise<RepositoryResult<boolean>>;
}

/**
 * Geographic Repository Interface
 */
export interface IGeographicRepository {
  findRegions(): Promise<RepositoryResult<any[]>>;
  findProvinces(regionCode?: string): Promise<RepositoryResult<any[]>>;
  findCities(provinceCode?: string): Promise<RepositoryResult<any[]>>;
  findBarangays(cityCode?: string): Promise<RepositoryResult<any[]>>;
  
  findRegionByCode(code: string): Promise<RepositoryResult<any>>;
  findProvinceByCode(code: string): Promise<RepositoryResult<any>>;
  findCityByCode(code: string): Promise<RepositoryResult<any>>;
  findBarangayByCode(code: string): Promise<RepositoryResult<any>>;
}

/**
 * Security Audit Repository Interface
 */
export interface ISecurityAuditRepository {
  logDataAccess(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    success: boolean,
    metadata?: any
  ): Promise<RepositoryResult<any>>;

  logSecurityEvent(
    event: string,
    userId: string,
    metadata?: any
  ): Promise<RepositoryResult<any>>;

  logAuthenticationAttempt(
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ): Promise<RepositoryResult<any>>;

  logPermissionDenied(
    userId: string,
    resource: string,
    action: string,
    reason: string,
    metadata?: any
  ): Promise<RepositoryResult<any>>;

  storeAuditLog(
    logEntry: any
  ): Promise<RepositoryResult<any>>;

  storeThreatEvent(
    threatEvent: any
  ): Promise<RepositoryResult<any>>;

  queryAuditLogs(
    filters?: any
  ): Promise<RepositoryResult<any>>;

  getSecurityStatistics(timeframe?: '24h' | '7d' | '30d'): Promise<RepositoryResult<any>>;
}

/**
 * Repository Factory Interface
 * For dependency injection and testing
 */
export interface IRepositoryFactory {
  createResidentRepository(): IResidentRepository;
  createHouseholdRepository(): IHouseholdRepository;
  createAuthRepository(): IAuthRepository;
  createGeographicRepository(): IGeographicRepository;
  createSecurityAuditRepository(): ISecurityAuditRepository;
}

/**
 * Repository Configuration
 * For configuring repository behavior
 */
export interface RepositoryConfig {
  enableRLS: boolean;
  enableAuditLogging: boolean;
  enableCaching: boolean;
  cacheTimeout?: number;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Security Context for Repository Operations
 * Passed to repositories for security enforcement
 */
export interface SecurityContext {
  userId: string;
  userRole: string;
  barangayCode?: string;
  cityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  permissions: string[];
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}