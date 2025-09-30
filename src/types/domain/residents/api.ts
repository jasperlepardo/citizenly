/**
 * Resident API Types
 * 
 * @fileoverview API request and response types for resident-related endpoints.
 * Follows REST conventions and database schema alignment.
 */

import type { ResidentRecord } from '@/types/infrastructure/database/database';

import type { Resident, ResidentListItem } from './core';

/**
 * Standard API response wrapper for residents
 */
export interface ResidentApiResponse {
  success: boolean;
  data?: Resident;
  error?: string;
  message?: string;
}

/**
 * Paginated residents list response
 */
export interface ResidentsApiResponse {
  success: boolean;
  data: {
    residents: ResidentListItem[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
  error?: string;
}

/**
 * Search parameters for resident queries
 */
export interface ResidentSearchParams {
  // Pagination
  page?: number;
  pageSize?: number;
  
  // Filtering
  searchQuery?: string;
  barangayCode?: string;
  sex?: string;
  civilStatus?: string;
  employmentStatus?: string;
  ageMin?: number;
  ageMax?: number;
  
  // Sectoral filters - aligned with database schema (resident_sectoral_info table)
  isLaborForceEmployed?: boolean;       // is_labor_force_employed
  isUnemployed?: boolean;                // is_unemployed
  isOverseasFilipinoWorker?: boolean;   // is_overseas_filipino_worker
  isPersonWithDisability?: boolean;     // is_person_with_disability
  isOutOfSchoolChildren?: boolean;      // is_out_of_school_children
  isOutOfSchoolYouth?: boolean;         // is_out_of_school_youth
  isSeniorCitizen?: boolean;            // is_senior_citizen
  isRegisteredSeniorCitizen?: boolean;  // is_registered_senior_citizen
  isSoloParent?: boolean;               // is_solo_parent
  isIndigenousPeople?: boolean;         // is_indigenous_people
  isMigrant?: boolean;                  // is_migrant
  
  // Sorting
  sortBy?: 'name' | 'age' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  
  // Include options
  includeHousehold?: boolean;
  includeSectoralInfo?: boolean;
  includeMigrantInfo?: boolean;
  includeInactive?: boolean;
}

/**
 * Bulk operations request
 */
export interface ResidentBulkOperationRequest {
  operation: 'activate' | 'deactivate' | 'export' | 'delete';
  residentIds: string[];
  options?: {
    exportFormat?: 'csv' | 'xlsx' | 'pdf';
    includePersonalInfo?: boolean;
    includeSectoralInfo?: boolean;
  };
}

/**
 * Bulk operation response
 */
export interface ResidentBulkOperationResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  results: Array<{
    residentId: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Import residents request
 */
export interface ResidentImportRequest {
  format: 'csv' | 'xlsx';
  data: string | ArrayBuffer;
  options: {
    validateOnly?: boolean;
    updateExisting?: boolean;
    skipDuplicates?: boolean;
  };
}

/**
 * Import response with validation results
 */
export interface ResidentImportResponse {
  success: boolean;
  imported: number;
  skipped: number;
  failed: number;
  validationErrors?: Array<{
    row: number;
    field: string;
    value: any;
    error: string;
  }>;
}

/**
 * Export request parameters
 */
export interface ResidentExportRequest {
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: ResidentSearchParams;
  fields?: string[];
  includeHeaders?: boolean;
}

/**
 * Statistics API response
 */
export interface ResidentStatisticsResponse {
  success: boolean;
  data: {
    totalCount: number;
    demographics: {
      bySex: Record<string, number>;
      byAgeGroup: Record<string, number>;
      byCivilStatus: Record<string, number>;
      byEmploymentStatus: Record<string, number>;
    };
    sectoral: {
      seniorCitizens: number;
      pwd: number;
      soloParents: number;
      ofw: number;
      outOfSchoolYouth: number;
    };
    trends: {
      monthlyRegistrations: Array<{
        month: string;
        count: number;
      }>;
    };
  };
}

/**
 * Audit log entry for resident changes
 */
export interface ResidentAuditLog {
  id: string;
  residentId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  changes?: Record<string, { old: any; new: any }>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Security and privacy data for resident
 */
export interface ResidentSecurityData {
  residentId: string;
  lastAccessed?: string;
  lastAccessedBy?: string;
  accessCount: number;
  exportCount: number;
  privacySettings: {
    allowDataExport: boolean;
    allowPublicView: boolean;
    maskSensitiveData: boolean;
  };
}

/**
 * Data export format for resident records
 */
export interface ResidentDataExport {
  metadata: {
    exportDate: string;
    exportedBy: string;
    totalRecords: number;
    format: string;
    version: string;
  };
  residents: Array<Partial<ResidentRecord>>;
}

/**
 * Search result item for autocomplete/search
 */
export interface ResidentSearchResult {
  id: string;
  fullName: string;
  birthdate: string;
  address: string;
  householdCode?: string;
  matchScore?: number;
}

/**
 * PSOC (Philippine Standard Occupational Classification) option
 */
export interface PsocOption {
  value: string;
  label: string;
  description?: string;
  level_type?: string;
  occupation_code: string;
  occupation_category?: string;
}

/**
 * PSGC (Philippine Standard Geographic Code) option
 */
export interface PsgcOption {
  value: string;
  label: string;
  description?: string;
  level: string;
  full_hierarchy?: string;
  geographic_level?: string;
}