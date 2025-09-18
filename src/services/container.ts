/**
 * Dependency Injection Container
 * Wires together domain services with infrastructure implementations
 * This is the ONLY place where infrastructure and domain are connected
 */

import { ResidentDomainService } from './domain/residents/residentDomainService';
import { AuthDomainService } from './domain/auth/authDomainService';
import { HouseholdDomainService } from './domain/households/householdDomainService';
import { GeographicDomainService } from './domain/geography/geographicDomainService';
import { SecurityDomainService } from './domain/security/securityDomainService';
import { CacheService } from './shared/cache/cacheService';
import { SyncService } from './shared/sync/syncService';
import { CommandMenuService } from './infrastructure/ui/commandMenuService';

import { SupabaseResidentRepository } from './infrastructure/repositories/SupabaseResidentRepository';
import { SupabaseAuthRepository } from './infrastructure/repositories/SupabaseAuthRepository';
import { SupabaseHouseholdRepository } from './infrastructure/repositories/SupabaseHouseholdRepository';
import { SupabaseGeographicRepository } from './infrastructure/repositories/SupabaseGeographicRepository';
import { SupabaseSecurityAuditRepository } from './infrastructure/repositories/SupabaseSecurityAuditRepository';

import type { 
  IResidentRepository, 
  IAuthRepository, 
  IHouseholdRepository, 
  IGeographicRepository,
  ISecurityAuditRepository
} from '../types/domain/repositories';

/**
 * Service Container
 * Creates and manages service instances with proper dependencies
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  
  // Repository instances
  private residentRepository: IResidentRepository;
  private authRepository: IAuthRepository;
  private householdRepository: IHouseholdRepository;
  private geographicRepository: IGeographicRepository;
  private securityAuditRepository: ISecurityAuditRepository;
  
  // Service instances
  private residentService: ResidentDomainService;
  private authService: AuthDomainService;
  private householdService: HouseholdDomainService;
  private geographicService: GeographicDomainService;
  private securityService: SecurityDomainService;
  private cacheService: CacheService;
  private syncService: SyncService;
  private commandMenuService: CommandMenuService;

  private constructor() {
    // Create infrastructure implementations
    this.residentRepository = new SupabaseResidentRepository();
    this.authRepository = new SupabaseAuthRepository();
    this.householdRepository = new SupabaseHouseholdRepository();
    this.geographicRepository = new SupabaseGeographicRepository();
    this.securityAuditRepository = new SupabaseSecurityAuditRepository();
    
    // Create domain services with injected dependencies
    this.residentService = new ResidentDomainService(this.residentRepository);
    this.authService = new AuthDomainService(this.authRepository);
    this.householdService = new HouseholdDomainService(
      this.householdRepository, 
      this.residentRepository
    );
    this.geographicService = new GeographicDomainService(this.geographicRepository);
    this.securityService = new SecurityDomainService(this.securityAuditRepository);
    this.cacheService = new CacheService();
    this.syncService = new SyncService();
    this.commandMenuService = new CommandMenuService(this.cacheService);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Get resident service
   */
  getResidentService(): ResidentDomainService {
    return this.residentService;
  }

  /**
   * Get auth service
   */
  getAuthService(): AuthDomainService {
    return this.authService;
  }

  /**
   * Get household service
   */
  getHouseholdService(): HouseholdDomainService {
    return this.householdService;
  }

  /**
   * Get geographic service
   */
  getGeographicService(): GeographicDomainService {
    return this.geographicService;
  }

  /**
   * Get security service
   */
  getSecurityService(): SecurityDomainService {
    return this.securityService;
  }

  /**
   * Get cache service
   */
  getCacheService(): CacheService {
    return this.cacheService;
  }

  /**
   * Get sync service
   */
  getSyncService(): SyncService {
    return this.syncService;
  }

  /**
   * Get command menu service
   */
  getCommandMenuService(): CommandMenuService {
    return this.commandMenuService;
  }

  /**
   * For testing - allow injection of mock repositories
   */
  static createForTesting(repositories: {
    residentRepository?: IResidentRepository;
    authRepository?: IAuthRepository;
    householdRepository?: IHouseholdRepository;
    geographicRepository?: IGeographicRepository;
  }): ServiceContainer {
    const container = new ServiceContainer();
    
    if (repositories.residentRepository) {
      container.residentRepository = repositories.residentRepository;
      container.residentService = new ResidentDomainService(repositories.residentRepository);
    }
    
    if (repositories.authRepository) {
      container.authRepository = repositories.authRepository;
      container.authService = new AuthDomainService(repositories.authRepository);
    }
    
    if (repositories.householdRepository) {
      container.householdRepository = repositories.householdRepository;
      container.householdService = new HouseholdDomainService(
        repositories.householdRepository,
        repositories.residentRepository || container.residentRepository
      );
    }
    
    if (repositories.geographicRepository) {
      container.geographicRepository = repositories.geographicRepository;
      container.geographicService = new GeographicDomainService(repositories.geographicRepository);
    }
    
    return container;
  }
}

// Export singleton instance
export const container = ServiceContainer.getInstance();