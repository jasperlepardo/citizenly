/**
 * Address Types - Database-Aligned Geographic Interface Collection
 * 
 * @fileoverview Comprehensive address-related TypeScript interfaces that provide
 * 100% compliant integration with PSGC (Philippine Standard Geographic Code) database
 * schema and geographic hierarchy management for the Citizenly RBI system.
 * 
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 * 
 * Database Tables Covered:
 * - psgc_regions (Philippine regions - 17 regions)
 * - psgc_provinces (Provincial subdivisions - 81 provinces)  
 * - psgc_cities_municipalities (Cities and municipalities - 1,634 total)
 * - psgc_barangays (Barangay subdivisions - 42,046 total)
 * - geo_streets (Street-level addressing - variable count)
 * - geo_subdivisions (Sub-barangay areas - variable count)
 * 
 * Key Features:
 * - 100% PSGC database schema compliance
 * - Philippine geographic hierarchy support (Region > Province > City > Barangay)
 * - Address validation and standardization interfaces  
 * - Form input and display formatting utilities
 * - Search and lookup optimization types
 * - Independent city support (HUCs - Highly Urbanized Cities)
 * 
 * @example Basic Address Information
 * ```typescript
 * import { AddressInfo, AddressHierarchy } from '@/types/addresses';
 * import { PSGCBarangay } from '@/types/database';
 * 
 * const addressInfo: AddressInfo = {
 *   barangay_name: 'Poblacion',
 *   barangay_code: '1234567890',
 *   city_municipality_name: 'Makati City', 
 *   city_municipality_code: '1374000000',
 *   region_name: 'National Capital Region',
 *   region_code: '13',
 *   full_address: 'Poblacion, Makati City, NCR'
 * };
 * ```
 * 
 * @example Address Search with Hierarchy
 * ```typescript
 * import { AddressSearchParams, AddressSearchResult } from '@/types/addresses';
 * 
 * const searchParams: AddressSearchParams = {
 *   query: 'Makati',
 *   region_code: '13',
 *   level: 'city_municipality',
 *   limit: 10
 * };
 * ```
 * 
 * @example Form Address Input
 * ```typescript
 * import { AddressFormData, AddressSelectionState } from '@/types/addresses';
 * 
 * const formData: AddressFormData = {
 *   house_number: '123',
 *   street_name: 'Ayala Avenue',
 *   barangay_code: '1374000001',
 *   city_municipality_code: '1374000000',
 *   region_code: '13',
 *   zip_code: '1200'
 * };
 * ```
 */

// =============================================================================
// CORE ADDRESS TYPES
// =============================================================================

/**
 * Standard address information interface
 * @description Comprehensive address data structure for resident and household records.
 * Consolidates AddressInfo variations from multiple files into a canonical format.
 * 
 * @example Makati City Address
 * ```typescript
 * const address: AddressInfo = {
 *   barangay_name: 'Poblacion',
 *   barangay_code: '1374000001',
 *   city_municipality_name: 'Makati City',
 *   city_municipality_code: '1374000000',
 *   province_name: 'NCR, SECOND DISTRICT',
 *   province_code: '1375000000',
 *   region_name: 'National Capital Region',
 *   region_code: '13',
 *   full_address: 'Poblacion, Makati City, NCR',
 *   zip_code: '1200'
 * };
 * ```
 * 
 * @example Independent City (No Province)
 * ```typescript
 * const independentCity: AddressInfo = {
 *   barangay_name: 'Ermita',
 *   barangay_code: '1375600001', 
 *   city_municipality_name: 'Manila City',
 *   city_municipality_code: '1375600000',
 *   // province_name: undefined (independent city)
 *   // province_code: undefined (independent city) 
 *   region_name: 'National Capital Region',
 *   region_code: '13',
 *   full_address: 'Ermita, Manila City, NCR',
 *   zip_code: '1000'
 * };
 * ```
 */
export interface AddressInfo {
  barangay_name: string; // PSGC barangay name (e.g., "Poblacion")
  barangay_code: string; // 10-digit PSGC barangay code
  city_municipality_name: string; // PSGC city/municipality name
  city_municipality_code: string; // 10-digit PSGC city/municipality code
  province_name?: string; // PSGC province name (null for independent cities)
  province_code?: string; // 10-digit PSGC province code (null for independent cities)
  region_name: string; // PSGC region name (never null)
  region_code: string; // 2-digit PSGC region code (never null)
  full_address: string; // Complete formatted address string
  zip_code?: string; // Philippine postal code (4 digits)
}

/**
 * Address hierarchy for display purposes
 * @description Structured hierarchical representation of Philippine geographic divisions.
 * Shows the nested relationship of address components for UI rendering and navigation.
 * 
 * @example NCR Address Hierarchy
 * ```typescript
 * const hierarchy: AddressHierarchy = {
 *   region: {
 *     code: '13',
 *     name: 'National Capital Region'
 *   },
 *   province: {
 *     code: '1375000000',
 *     name: 'NCR, SECOND DISTRICT'
 *   },
 *   city_municipality: {
 *     code: '1374000000',
 *     name: 'Makati City',
 *     type: 'City',
 *     is_independent: false
 *   },
 *   barangay: {
 *     code: '1374000001',
 *     name: 'Poblacion'
 *   }
 * };
 * ```
 * 
 * @example Independent City (No Province)
 * ```typescript
 * const independentHierarchy: AddressHierarchy = {
 *   region: {
 *     code: '13',
 *     name: 'National Capital Region'
 *   },
 *   // province: undefined (independent city)
 *   city_municipality: {
 *     code: '1375600000',
 *     name: 'Manila City',
 *     type: 'City',
 *     is_independent: true
 *   },
 *   barangay: {
 *     code: '1375600001',
 *     name: 'Ermita'
 *   }
 * };
 * ```
 */
export interface AddressHierarchy {
  region: {
    code: string; // 2-digit PSGC region code
    name: string; // Full region name
  };
  province?: {
    code: string; // 10-digit PSGC province code (undefined for independent cities)
    name: string; // Full province name (undefined for independent cities)
  };
  city_municipality: {
    code: string; // 10-digit PSGC city/municipality code
    name: string; // Full city/municipality name
    type: string; // "City" or "Municipality"
    is_independent: boolean; // true for HUCs (Highly Urbanized Cities)
  };
  barangay: {
    code: string; // 10-digit PSGC barangay code
    name: string; // Full barangay name
  };
}

/**
 * Address display information
 * Formatted address for UI display
 */
export interface AddressDisplayInfo {
  short: string; // "Brgy Name, City"
  medium: string; // "Brgy Name, City, Province"
  full: string; // "Brgy Name, City, Province, Region"
  hierarchical: string; // "Region > Province > City > Barangay"
}

/**
 * User address interface
 * For user profile address information
 */
export interface UserAddress {
  house_number?: string;
  street_name?: string;
  subdivision_name?: string;
  barangay_code: string;
  barangay_name: string;
  city_municipality_code: string;
  city_municipality_name: string;
  province_code?: string;
  province_name?: string;
  region_code: string;
  region_name: string;
  zip_code?: string;
  is_primary: boolean;
  address_type?: 'residential' | 'business' | 'temporary';
}

// =============================================================================
// GEOGRAPHIC SUBDIVISION TYPES
// =============================================================================

/**
 * Subdivision information
 * For areas within barangays (zones, sitios, puroks)
 */
export interface SubdivisionInfo {
  id: string;
  name: string;
  type: 'Subdivision' | 'Zone' | 'Sitio' | 'Purok';
  barangay_code: string;
  description?: string;
}

/**
 * Street information
 * For streets within subdivisions or barangays
 */
export interface StreetInfo {
  id: string;
  name: string;
  subdivision_id?: string;
  barangay_code: string;
  description?: string;
}

// =============================================================================
// ADDRESS VALIDATION TYPES
// =============================================================================

/**
 * Address validation result
 * Result of address validation/verification
 */
export interface AddressValidationResult {
  isValid: boolean;
  confidence: number; // 0-1 scale
  suggestions?: AddressInfo[];
  errors?: string[];
  standardized?: AddressInfo;
}

/**
 * Address lookup options
 * Configuration for address lookup/search
 */
export interface AddressLookupOptions {
  includeInactive?: boolean;
  fuzzyMatch?: boolean;
  maxResults?: number;
  level?: 'region' | 'province' | 'city_municipality' | 'barangay';
}

// =============================================================================
// ADDRESS SEARCH TYPES
// =============================================================================

/**
 * Address search parameters
 * Parameters for searching addresses
 */
export interface AddressSearchParams {
  query: string;
  region_code?: string;
  province_code?: string;
  city_municipality_code?: string;
  level?: 'all' | 'region' | 'province' | 'city_municipality' | 'barangay';
  limit?: number;
  offset?: number;
}

/**
 * Address search result
 * Individual result from address search
 */
export interface AddressSearchResult {
  code: string;
  name: string;
  level: 'region' | 'province' | 'city_municipality' | 'barangay';
  parent_code?: string;
  full_address: string;
  hierarchy: AddressHierarchy;
  match_score?: number;
}

// =============================================================================
// ADDRESS FORM TYPES
// =============================================================================

/**
 * Address form data
 * Form data structure for address input
 */
export interface AddressFormData {
  house_number?: string;
  street_name?: string;
  subdivision_name?: string;
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string;
  region_code: string;
  zip_code?: string;
}

/**
 * Address selection state
 * State for address selection components
 */
export interface AddressSelectionState {
  selectedRegion?: string;
  selectedProvince?: string;
  selectedCityMunicipality?: string;
  selectedBarangay?: string;
  isLoading: boolean;
  availableOptions: {
    regions: Array<{ code: string; name: string }>;
    provinces: Array<{ code: string; name: string }>;
    cities: Array<{ code: string; name: string; type: string }>;
    barangays: Array<{ code: string; name: string }>;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Address component type
 * Union type for different address components
 */
export type AddressComponent = 'region' | 'province' | 'city_municipality' | 'barangay';

/**
 * Address format type
 * Different address formatting options
 */
export type AddressFormat = 'short' | 'medium' | 'full' | 'hierarchical' | 'postal';

/**
 * Address validation error
 * Specific error type for address validation
 */
export interface AddressValidationError {
  component: AddressComponent;
  code: string;
  message: string;
  suggestion?: string;
}

// =============================================================================
// PSGC DATABASE TYPES (Import canonical interfaces from database.ts)
// =============================================================================

/**
 * Import and re-export PSGC interfaces from database.ts to maintain single source of truth
 * These interfaces exactly match the PostgreSQL database schema for PSGC reference tables
 */
import type {
  PSGCRegion,
  PSGCProvince, 
  PSGCCityMunicipality,
  PSGCBarangay,
  AddressHierarchyQueryResult,
} from './database';

// Re-export with backward-compatible aliases for existing code
export type Region = PSGCRegion;
export type Province = PSGCProvince;
export type CityMunicipality = PSGCCityMunicipality;
export type City = PSGCCityMunicipality; // City is just an alias for CityMunicipality
export type Barangay = PSGCBarangay;

/**
 * Geographic option for form dropdowns
 */
export interface GeographicOption {
  value: string;
  label: string;
}

/**
 * Barangay with geographic hierarchy joins (for search results)
 * @description Simplified approach using flat hierarchy structure instead of deep nesting
 * @see FlatAddressHierarchy for the canonical flat structure
 */
export interface BarangayWithJoins extends PSGCBarangay {
  // Additional computed fields for search results
  full_hierarchy?: string; // "Region > Province > City > Barangay"
  match_score?: number; // Search relevance score (0-1)
  
  // Geographic context (use flat structure instead of deep nesting)
  region_code?: string;
  region_name?: string;
  province_code?: string;
  province_name?: string;
  city_municipality_name?: string;
  city_municipality_type?: string;
}

/**
 * Flat address hierarchy structure - re-exported from database.ts
 * @description Used for database query results with full geographic hierarchy
 * @see database.ts - AddressHierarchyQueryResult (canonical implementation)
 */
export type FlatAddressHierarchy = AddressHierarchyQueryResult;