/**
 * Resident Listing Types
 * 
 * @description Type definitions for resident listing page components, table views, and paginated responses
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import { Resident } from './residentDetail';

/**
 * Optimized resident data structure for listing and table views
 * 
 * @description Lightweight version of Resident interface containing only fields needed
 * for list displays, search results, and table components. This reduces data transfer
 * and improves performance for paginated resident listings.
 * 
 * @example Basic usage in table component
 * ```typescript
 * const residents: ResidentListItem[] = [
 *   {
 *     id: '12345',
 *     first_name: 'Juan',
 *     last_name: 'Dela Cruz',
 *     birthdate: '1990-01-15',
 *     sex: 'male',
 *     household_code: '042114014-2024-000001',
 *     barangay_code: '042114014',
 *     created_at: '2024-01-15T10:30:00Z'
 *   }
 * ];
 * ```
 */
export type ResidentListItem = Pick<Resident, 
  | 'id' 
  | 'first_name' 
  | 'middle_name' 
  | 'last_name' 
  | 'extension_name'
  | 'email'
  | 'mobile_number'
  | 'sex'
  | 'birthdate'
  | 'civil_status'
  | 'occupation_title'
  | 'household_code'
  | 'barangay_code'
  | 'created_at'
> & {
  // Additional fields specific to listing view
  /** Current occupation (computed field for display) */
  occupation?: string;
  /** Job title (alternative display field) */
  job_title?: string;
  /** Professional designation */
  profession?: string;
  /** Education level for filtering/display */
  education_level?: string;
  /** General status indicator */
  status?: string;
  /** Simplified household information for listing context */
  household?: {
    /** Household identifier code */
    code: string;
    /** Street name for address display */
    street_name?: string;
    /** House number for address display */
    house_number?: string;
    /** Subdivision name for address display */
    subdivision?: string;
  };
};

/**
 * Standard API response format for resident listing endpoints
 * 
 * @description Paginated response structure used by all resident listing APIs.
 * Provides consistent data format, pagination controls, and metadata for client consumption.
 * 
 * @example API response handling
 * ```typescript
 * const response = await fetch('/api/residents?page=1&limit=10');
 * const data: ResidentsApiResponse = await response.json();
 * 
 * console.log(`Showing ${data.data.length} of ${data.pagination.total} residents`);
 * console.log(`Page ${data.pagination.page} of ${data.pagination.pages}`);
 * 
 * // Handle pagination
 * if (data.pagination.hasNext) {
 *   const nextPage = data.pagination.page + 1;
 *   // Load next page...
 * }
 * ```
 */
export interface ResidentsApiResponse {
  /** Array of resident records for current page */
  data: ResidentListItem[];
  /** Pagination information and controls */
  pagination: {
    /** Current page number (1-based) */
    page: number;
    /** Number of records per page */
    limit: number;
    /** Total number of records across all pages */
    total: number;
    /** Total number of pages available */
    pages: number;
    /** Whether there is a next page available */
    hasNext: boolean;
    /** Whether there is a previous page available */
    hasPrev: boolean;
  };
  /** Optional success or informational message */
  message?: string;
  /** API response metadata */
  metadata?: {
    /** Response generation timestamp (ISO 8601 format) */
    timestamp: string;
    /** API version used for this response */
    version: string;
    /** Unique request identifier for tracking */
    requestId?: string;
  };
}