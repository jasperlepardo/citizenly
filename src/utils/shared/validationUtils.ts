/**
 * Input Validation Schemas
 * Centralized validation using Zod for type safety and security
 */

import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
  .max(255, 'Email too long');

export const phoneSchema = z
  .string()
  .regex(/^(\+63|0)?9\d{9}$/, 'Invalid Philippine mobile number format')
  .optional()
  .or(z.literal(''));

export const psgcCodeSchema = z
  .string()
  .regex(/^\d+$/, 'Code must contain only digits')
  .min(1, 'Code is required');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-.']+$/, 'Name contains invalid characters');

// Note: passwordSchema removed - unused

// Date validation
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(date => {
    const parsedDate = new Date(date);
    const minDate = new Date('1900-01-01');
    const maxDate = new Date();
    return parsedDate >= minDate && parsedDate <= maxDate;
  }, 'Date must be between 1900-01-01 and today');

// Note: birthdateSchema removed - unused

export const philsysSchema = z
  .string()
  .regex(/^\d{4}-\d{4}-\d{4}$/, 'PhilSys number must be in format XXXX-XXXX-XXXX')
  .optional()
  .or(z.literal(''));

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Note: sortSchema removed - unused

// Note: searchSchema removed - unused

// Resident validation schemas
export const createResidentSchema = z.object({
  // Required fields (matching database schema)
  first_name: nameSchema,
  last_name: nameSchema,
  birthdate: dateSchema,
  sex: z.enum(['male', 'female']),

  // Optional personal info (matching database schema)
  middle_name: z.string().max(100).optional().or(z.literal('')),
  extension_name: z.string().max(20).optional().or(z.literal('')),

  // Contact information (matching database schema)
  email: emailSchema.optional().or(z.literal('')),
  mobile_number: phoneSchema,
  telephone_number: z.string().max(50).optional().or(z.literal('')),

  // Personal details (aligned with database enums)
  civil_status: z
    .enum(['single', 'married', 'widowed', 'separated', 'divorced', 'others'])
    .default('single'),
  civil_status_others_specify: z.string().max(200).optional().or(z.literal('')),
  citizenship: z.enum(['filipino', 'dual_citizen', 'foreigner']).default('filipino'),
  blood_type: z
    .union([
      z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  ethnicity: z
    .union([
      z.enum([
        'tagalog',
        'cebuano',
        'ilocano',
        'bisaya',
        'hiligaynon',
        'bikolano',
        'waray',
        'kapampangan',
        'pangasinense',
        'maranao',
        'maguindanao',
        'tausug',
        'yakan',
        'samal',
        'badjao',
        'aeta',
        'agta',
        'ati',
        'batak',
        'bukidnon',
        'gaddang',
        'higaonon',
        'ibaloi',
        'ifugao',
        'igorot',
        'ilongot',
        'isneg',
        'ivatan',
        'kalinga',
        'kankanaey',
        'mangyan',
        'mansaka',
        'palawan',
        'subanen',
        'tboli',
        'teduray',
        'tumandok',
        'chinese',
        'others',
      ]),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  religion: z
    .enum([
      'roman_catholic',
      'islam',
      'iglesia_ni_cristo',
      'christian',
      'aglipayan_church',
      'seventh_day_adventist',
      'bible_baptist_church',
      'jehovahs_witnesses',
      'church_of_jesus_christ_latter_day_saints',
      'united_church_of_christ_philippines',
      'others',
    ])
    .default('roman_catholic'),
  religion_others_specify: z.string().max(200).optional().or(z.literal('')),

  // Physical characteristics
  height: z
    .union([
      z.number().min(30).max(300), // Height in cm, reasonable range
      z.literal(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  weight: z
    .union([
      z.number().min(1).max(500), // Weight in kg, reasonable range
      z.literal(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  complexion: z.string().max(50).optional().or(z.literal('')),

  // Birth place information (matching database schema)
  birth_place_code: z.string().max(10).optional().or(z.literal('')),

  // Documentation (matching database schema)
  philsys_card_number: philsysSchema,

  // Family information (allow empty strings, matching database schema)
  mother_maiden_first: z.union([z.string().max(100).min(1), z.literal(''), z.null(), z.undefined()]).optional(),
  mother_maiden_middle: z.union([z.string().max(100).min(1), z.literal(''), z.null(), z.undefined()]).optional(),
  mother_maiden_last: z.union([z.string().max(100).min(1), z.literal(''), z.null(), z.undefined()]).optional(),

  // Education and employment (aligned with database enum)
  education_attainment: z
    .union([
      z.enum(['elementary', 'high_school', 'college', 'post_graduate', 'vocational']),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  is_graduate: z.boolean().default(false),
  employment_status: z
    .union([
      z.enum([
        'employed',
        'unemployed',
        'underemployed',
        'self_employed',
        'student',
        'retired',
        'homemaker',
        'unable_to_work',
        'looking_for_work',
        'not_in_labor_force',
      ]),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .default('not_in_labor_force'),
  occupation_code: z.union([
    z.string().max(10),
    z.literal(''),
    z.null(),
    z.undefined(),
  ]).optional(),

  // Voting information (matching database schema)
  is_voter: z.union([z.boolean(), z.null(), z.undefined()]).optional(),
  is_resident_voter: z.union([z.boolean(), z.null(), z.undefined()]).optional(),
  last_voted_date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    z.literal(''),
    z.null(),
    z.undefined()
  ]).optional(),

  // Household (matching database schema) - REQUIRED
  household_code: z.string().min(1, 'Household assignment is required').max(50),

  // Sectoral information fields (optional)
  is_labor_force_employed: z.boolean().optional(),
  is_unemployed: z.boolean().optional(),
  is_overseas_filipino_worker: z.boolean().optional(),
  is_person_with_disability: z.boolean().optional(),
  is_out_of_school_children: z.boolean().optional(),
  is_out_of_school_youth: z.boolean().optional(),
  is_senior_citizen: z.boolean().optional(),
  is_registered_senior_citizen: z.boolean().optional(),
  is_solo_parent: z.boolean().optional(),
  is_indigenous_people: z.boolean().optional(),
  is_migrant: z.boolean().optional(),

  // Migration information fields (optional)
  previous_barangay_code: z.string().max(10).optional().or(z.literal('')),
  previous_city_municipality_code: z.string().max(10).optional().or(z.literal('')),
  previous_province_code: z.string().max(10).optional().or(z.literal('')),
  previous_region_code: z.string().max(10).optional().or(z.literal('')),
  date_of_transfer: z.string().optional().or(z.literal('')),
  reason_for_leaving: z.string().max(500).optional().or(z.literal('')),
  reason_for_transferring: z.string().max(500).optional().or(z.literal('')),
  length_of_stay_previous_months: z.number().int().min(0).optional(),
  duration_of_stay_current_months: z.number().int().min(0).optional(),
  is_intending_to_return: z.boolean().optional(),
});

// Update resident schema - excludes sectoral and migration fields that belong in separate tables
export const updateResidentSchema = createResidentSchema.omit({
  // Remove sectoral information fields (these belong in resident_sectoral_info table)
  is_labor_force_employed: true,
  is_unemployed: true,
  is_overseas_filipino_worker: true,
  is_person_with_disability: true,
  is_out_of_school_children: true,
  is_out_of_school_youth: true,
  is_senior_citizen: true,
  is_registered_senior_citizen: true,
  is_solo_parent: true,
  is_indigenous_people: true,
  is_migrant: true,
  
  // Remove migration information fields (these belong in resident_migrant_info table)
  previous_barangay_code: true,
  previous_city_municipality_code: true,
  previous_province_code: true,
  previous_region_code: true,
  date_of_transfer: true,
  reason_for_leaving: true,
  reason_for_transferring: true,
  length_of_stay_previous_months: true,
  duration_of_stay_current_months: true,
  is_intending_to_return: true,
});

// Household validation schemas
export const createHouseholdSchema = z.object({
  code: z.string().min(1).max(50),
  street_name: z.string().max(200).optional(),
  subdivision_name: z.string().max(200).optional(),
  house_number: z.string().max(50).optional(),

  // Geographic codes (matching database schema)
  barangay_code: psgcCodeSchema,
  city_municipality_code: psgcCodeSchema.optional(),
  province_code: psgcCodeSchema.optional(),
  region_code: psgcCodeSchema.optional(),
  zip_code: z.string().max(10).optional(),

  // Household metrics (matching database schema)
  no_of_families: z.number().optional(),
  no_of_household_members: z.number().optional(),
  no_of_migrants: z.number().optional(),

  // Household classifications (matching database schema)
  household_type: z
    .enum([
      'nuclear',
      'single_parent',
      'extended',
      'childless',
      'one_person',
      'non_family',
      'other',
    ])
    .optional(),
  tenure_status: z
    .enum([
      'owned',
      'owned_with_mortgage',
      'rented',
      'occupied_for_free',
      'occupied_without_consent',
      'others',
    ])
    .optional(),
  tenure_others_specify: z.string().optional(),
  household_unit: z
    .enum([
      'single_house',
      'duplex',
      'apartment',
      'townhouse',
      'condominium',
      'boarding_house',
      'institutional',
      'makeshift',
      'others',
    ])
    .optional(),

  // Economic information (matching database schema)
  monthly_income: z.number().optional(),
  income_class: z
    .enum([
      'rich',
      'high_income',
      'upper_middle_income',
      'middle_class',
      'lower_middle_class',
      'low_income',
      'poor',
      'not_determined',
    ])
    .optional(),

  // Head of household (matching database schema)
  household_head_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format').optional(),
  household_head_position: z
    .enum([
      'father',
      'mother',
      'son',
      'daughter',
      'grandmother',
      'grandfather',
      'father_in_law',
      'mother_in_law',
      'brother_in_law',
      'sister_in_law',
      'spouse',
      'sibling',
      'guardian',
      'ward',
      'other',
    ])
    .optional(),
});

// Note: updateHouseholdSchema removed - unused

// Note: createUserSchema removed - unused

// Note: updateUserSchema removed - unused

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Note: signupSchema removed - unused

// Geographic filter schemas
export const geographicFilterSchema = z.object({
  region_code: psgcCodeSchema.optional(),
  province_code: psgcCodeSchema.optional(),
  city_municipality_code: psgcCodeSchema.optional(),
  barangay_code: psgcCodeSchema.optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file_name: z.string().min(1).max(255),
  file_size: z
    .number()
    .int()
    .min(1)
    .max(10 * 1024 * 1024), // 10MB max
  fileType: z.enum(['image/jpeg', 'image/png', 'application/pdf', 'text/csv']),
  purpose: z.enum(['profile_photo', 'document', 'import_data']),
});

// Note: formatZodErrors removed - unused

/**
 * Sanitize search input to prevent SQL injection
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_]/g, '\\$&') // Escape SQL wildcards
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;\\]/g, '') // Remove dangerous characters
    .trim()
    .slice(0, 100); // Limit length
}

/**
 * Validate and sanitize pagination parameters
 */
export function validatePagination(params: URLSearchParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const result = paginationSchema.parse({
    page: params.get('page'),
    limit: params.get('limit'),
  });

  return {
    page: result.page,
    limit: result.limit,
    offset: (result.page - 1) * result.limit,
  };
}

// Note: validateSort removed - unused

// Note: withValidation removed - unused

/**
 * Type definitions for validated data
 */
export type CreateResidentData = z.infer<typeof createResidentSchema>;
export type UpdateResidentData = z.infer<typeof updateResidentSchema>;
export type CreateHouseholdData = z.infer<typeof createHouseholdSchema>;
// Note: UpdateHouseholdData removed - unused
// Note: CreateUserData removed - unused
// Note: UpdateUserData removed - unused
export type LoginData = z.infer<typeof loginSchema>;
// Note: SignupData removed - unused
