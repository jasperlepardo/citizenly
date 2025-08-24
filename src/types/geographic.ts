/**
 * Geographic Data Types
 * Interfaces for Philippine Standard Geographic Code (PSGC) and local geographic entities
 */

// =============================================================================
// GEOGRAPHIC SUBDIVISIONS (geo_subdivisions table)
// =============================================================================

export type SubdivisionType = 'Subdivision' | 'Zone' | 'Sitio' | 'Purok';

export interface GeoSubdivision {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  name: string; // VARCHAR(100) NOT NULL
  type: SubdivisionType; // VARCHAR(20) NOT NULL with CHECK constraint
  barangay_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code)
  city_municipality_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code)
  province_code?: string | null; // VARCHAR(10) REFERENCES psgc_provinces(code)
  region_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_regions(code)
  description?: string | null; // TEXT
  is_active?: boolean | null; // BOOLEAN DEFAULT true (nullable in database)
  created_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  updated_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
}

// =============================================================================
// STREETS (geo_streets table)
// =============================================================================

export interface GeoStreet {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  name: string; // VARCHAR(100) NOT NULL
  subdivision_id?: string | null; // UUID REFERENCES geo_subdivisions(id)
  barangay_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code)
  city_municipality_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code)
  province_code?: string | null; // VARCHAR(10) REFERENCES psgc_provinces(code)
  region_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_regions(code)
  description?: string | null; // TEXT
  is_active?: boolean | null; // BOOLEAN DEFAULT true (nullable in database)
  created_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  updated_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW() (nullable in database)
}

// =============================================================================
// PHILIPPINE STANDARD GEOGRAPHIC CODE (PSGC) TABLES
// =============================================================================

export interface PsgcRegion {
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PsgcProvince {
  code: string;
  name: string;
  region_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PsgcCityMunicipality {
  code: string;
  name: string;
  province_code?: string | null;
  type: string;
  is_independent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PsgcBarangay {
  code: string;
  name: string;
  city_municipality_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// PHILIPPINE STANDARD OCCUPATIONAL CLASSIFICATION (PSOC) TABLES
// =============================================================================

export interface PsocMajorGroup {
  code: string;
  title: string;
  created_at: string;
}

export interface PsocSubMajorGroup {
  code: string;
  title: string;
  major_code: string;
  created_at: string;
}

export interface PsocMinorGroup {
  code: string;
  title: string;
  sub_major_code: string;
  created_at: string;
}

export interface PsocUnitGroup {
  code: string;
  title: string;
  minor_code: string;
  created_at: string;
}

export interface PsocUnitSubGroup {
  code: string;
  title: string;
  unit_code: string;
  created_at: string;
}

export interface PsocPositionTitle {
  id: string;
  title: string;
  unit_group_code: string;
  is_primary: boolean;
  description?: string | null;
  created_at: string;
}

export interface PsocOccupationCrossReference {
  id: string;
  unit_group_code: string;
  related_unit_code: string;
  related_occupation_title: string;
  created_at: string;
}

// =============================================================================
// FORM AND API TYPES
// =============================================================================

export interface SubdivisionFormData {
  name: string;
  type: SubdivisionType;
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string;
  region_code: string;
  description?: string;
}

export interface StreetFormData {
  name: string;
  subdivision_id?: string;
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string;
  region_code: string;
  description?: string;
}

// =============================================================================
// SEARCH AND FILTER TYPES
// =============================================================================

export interface GeographicSearchParams {
  barangay_code?: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  is_active?: boolean;
  search?: string;
}

export interface PsgcHierarchy {
  region?: PsgcRegion;
  province?: PsgcProvince;
  city_municipality?: PsgcCityMunicipality;
  barangay?: PsgcBarangay;
}

// =============================================================================
// SELECT OPTIONS
// =============================================================================

export interface GeographicOption {
  value: string;
  label: string;
  description?: string;
  metadata?: {
    code: string;
    type?: string;
    parent_code?: string;
    is_active: boolean;
  };
}

export interface SubdivisionOption extends GeographicOption {
  type: SubdivisionType;
}

export interface StreetOption extends GeographicOption {
  subdivision_id?: string;
  subdivision_name?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type GeographicLevel = 'region' | 'province' | 'city_municipality' | 'barangay';

export interface GeographicBreadcrumb {
  level: GeographicLevel;
  code: string;
  name: string;
}

export interface GeographicAddress {
  street?: string;
  subdivision?: string;
  barangay: string;
  city_municipality: string;
  province?: string;
  region: string;
  zip_code?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const SUBDIVISION_TYPES: SubdivisionType[] = [
  'Subdivision',
  'Zone', 
  'Sitio',
  'Purok'
];

export const GEOGRAPHIC_LEVELS: GeographicLevel[] = [
  'region',
  'province',
  'city_municipality',
  'barangay'
];