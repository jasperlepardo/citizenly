/**
 * DATABASE FIELD DEFINITIONS
 * ==========================
 *
 * Single source of truth for all database field names
 * Ensures consistency between schema and API usage
 * All field names match exactly with database schema.sql
 */

// auth_user_profiles table fields
export const AUTH_USER_PROFILES_FIELDS = {
  id: 'id',
  first_name: 'first_name',
  middle_name: 'middle_name',
  last_name: 'last_name',
  email: 'email',
  phone: 'phone',
  role_id: 'role_id',
  barangay_code: 'barangay_code',
  city_municipality_code: 'city_municipality_code',
  province_code: 'province_code',
  region_code: 'region_code',
  is_active: 'is_active',
  last_login: 'last_login',
  created_by: 'created_by',
  updated_by: 'updated_by',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

// auth_roles table fields
export const AUTH_ROLES_FIELDS = {
  id: 'id',
  name: 'name',
  description: 'description',
  permissions: 'permissions',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

// residents table fields
export const RESIDENTS_FIELDS = {
  id: 'id',
  household_id: 'household_id',
  first_name: 'first_name',
  middle_name: 'middle_name',
  last_name: 'last_name',
  name_suffix: 'name_suffix',
  sex: 'sex',
  date_of_birth: 'date_of_birth',
  civil_status: 'civil_status',
  citizenship: 'citizenship',
  occupation: 'occupation',
  monthly_income: 'monthly_income',
  contact_number: 'contact_number',
  email: 'email',
  education_level: 'education_level',
  employment_status: 'employment_status',
  religion: 'religion',
  ethnicity: 'ethnicity',
  blood_type: 'blood_type',
  philhealth_number: 'philhealth_number',
  sss_gsis_number: 'sss_gsis_number',
  tin_number: 'tin_number',
  voter_id_number: 'voter_id_number',
  national_id_number: 'national_id_number',
  birth_place: 'birth_place',
  previous_address: 'previous_address',
  years_of_residency: 'years_of_residency',
  is_household_head: 'is_household_head',
  created_by: 'created_by',
  updated_by: 'updated_by',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

// households table fields
export const HOUSEHOLDS_FIELDS = {
  id: 'id',
  household_id: 'household_id',
  household_head_id: 'household_head_id',
  street: 'street',
  house_number: 'house_number',
  subdivision: 'subdivision',
  building_name: 'building_name',
  unit_floor_room_number: 'unit_floor_room_number',
  barangay_code: 'barangay_code',
  city_municipality_code: 'city_municipality_code',
  province_code: 'province_code',
  region_code: 'region_code',
  postal_code: 'postal_code',
  household_type: 'household_type',
  tenure_status: 'tenure_status',
  household_unit: 'household_unit',
  monthly_income: 'monthly_income',
  income_class: 'income_class',
  contact_number: 'contact_number',
  created_by: 'created_by',
  updated_by: 'updated_by',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

// PSGC table fields
export const PSGC_REGIONS_FIELDS = {
  code: 'code',
  name: 'name',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

export const PSGC_PROVINCES_FIELDS = {
  code: 'code',
  name: 'name',
  region_code: 'region_code',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

export const PSGC_CITIES_MUNICIPALITIES_FIELDS = {
  code: 'code',
  name: 'name',
  province_code: 'province_code',
  type: 'type',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

export const PSGC_BARANGAYS_FIELDS = {
  code: 'code',
  name: 'name',
  city_municipality_code: 'city_municipality_code',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at',
} as const;

// Type helpers for strict typing
export type AuthUserProfileFields =
  (typeof AUTH_USER_PROFILES_FIELDS)[keyof typeof AUTH_USER_PROFILES_FIELDS];
export type AuthRoleFields = (typeof AUTH_ROLES_FIELDS)[keyof typeof AUTH_ROLES_FIELDS];
export type ResidentFields = (typeof RESIDENTS_FIELDS)[keyof typeof RESIDENTS_FIELDS];
export type HouseholdFields = (typeof HOUSEHOLDS_FIELDS)[keyof typeof HOUSEHOLDS_FIELDS];

// Helper function to build select queries with exact field names
export function buildSelectQuery<T extends Record<string, string>>(
  fields: T,
  selectedFields?: (keyof T)[]
): string {
  if (!selectedFields || selectedFields.length === 0) {
    return '*';
  }
  return selectedFields.map(field => fields[field as string]).join(', ');
}

// Helper function to map form data to database fields
export function mapToDbFields<T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  fieldMap: Record<string, string>
): T {
  const result = {} as T;
  for (const [formKey, dbKey] of Object.entries(fieldMap)) {
    if (data[formKey] !== undefined) {
      result[dbKey] = data[formKey];
    }
  }
  return result as T;
}

// Export all field definitions as a single object for easy import
export const DB_FIELDS = {
  AUTH_USER_PROFILES: AUTH_USER_PROFILES_FIELDS,
  AUTH_ROLES: AUTH_ROLES_FIELDS,
  RESIDENTS: RESIDENTS_FIELDS,
  HOUSEHOLDS: HOUSEHOLDS_FIELDS,
  PSGC_REGIONS: PSGC_REGIONS_FIELDS,
  PSGC_PROVINCES: PSGC_PROVINCES_FIELDS,
  PSGC_CITIES_MUNICIPALITIES: PSGC_CITIES_MUNICIPALITIES_FIELDS,
  PSGC_BARANGAYS: PSGC_BARANGAYS_FIELDS,
} as const;
