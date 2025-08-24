/**
 * Input Validation Schemas
 * Centralized validation using Zod for type safety and security
 */

import { z } from 'zod';
import { ErrorCode } from './types';

// Base validation schemas
export const emailSchema = z.string().email('Invalid email format').max(255, 'Email too long');

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
  .regex(/^[a-zA-Z\s\-\.\']+$/, 'Name contains invalid characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

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

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Sort schema
export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Search schema with SQL injection protection
export const searchSchema = z.object({
  search: z
    .string()
    .max(100, 'Search term too long')
    .regex(/^[a-zA-Z0-9\s\-\.@_]+$/, 'Search contains invalid characters')
    .optional(),
});

// Resident validation schemas - aligned with exact database structure (38 fields)
export const createResidentSchema = z.object({
  // Required fields
  first_name: nameSchema,
  last_name: nameSchema,
  birthdate: dateSchema,
  sex: z.enum(['male', 'female']),

  // Optional personal info
  middle_name: z.string().max(100).optional().or(z.literal('')),
  extension_name: z.string().max(20).optional().or(z.literal('')),
  birth_place_code: z.string().max(10).optional().or(z.literal('')),

  // Contact information
  email: emailSchema.optional().or(z.literal('')),
  mobile_number: phoneSchema,
  telephone_number: z.string().max(20).optional().or(z.literal('')),

  // Civil status
  civil_status: z.enum(['single', 'married', 'divorced', 'separated', 'widowed', 'others']).optional(),
  civil_status_others_specify: z.string().optional().or(z.literal('')),

  // Education and employment
  education_attainment: z.enum(['elementary', 'high_school', 'college', 'post_graduate', 'vocational']).optional(),
  is_graduate: z.boolean().optional(),
  employment_status: z.enum([
    'employed', 'unemployed', 'underemployed', 'self_employed', 'student', 
    'retired', 'homemaker', 'unable_to_work', 'looking_for_work', 'not_in_labor_force'
  ]).optional(),
  occupation_code: z.string().max(10).optional().or(z.literal('')),

  // Physical characteristics
  height: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  complexion: z.string().max(50).optional().or(z.literal('')),

  // Voting information
  is_voter: z.boolean().optional(),
  is_resident_voter: z.boolean().optional(),
  last_voted_date: z.string().optional().or(z.literal('')),

  // Cultural/religious identity  
  religion: z.enum([
    'roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian', 'aglipayan_church',
    'seventh_day_adventist', 'bible_baptist_church', 'jehovahs_witnesses',
    'church_of_jesus_christ_latter_day_saints', 'united_church_of_christ_philippines', 'others'
  ]).optional(),
  religion_others_specify: z.string().optional().or(z.literal('')),
  ethnicity: z.enum([
    'tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bikolano', 'waray', 'kapampangan', 'pangasinense',
    'maranao', 'maguindanao', 'tausug', 'yakan', 'samal', 'badjao', 'aeta', 'agta', 'ati', 'batak', 
    'bukidnon', 'gaddang', 'higaonon', 'ibaloi', 'ifugao', 'igorot', 'ilongot', 'isneg', 'ivatan', 
    'kalinga', 'kankanaey', 'mangyan', 'mansaka', 'palawan', 'subanen', 'tboli', 'teduray', 'tumandok', 
    'chinese', 'others'
  ]).optional(),
  citizenship: z.enum(['filipino', 'dual_citizen', 'foreigner']).optional(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),

  // Family information
  mother_maiden_first: z.string().max(100).optional().or(z.literal('')),
  mother_maiden_middle: z.string().max(100).optional().or(z.literal('')),
  mother_maiden_last: z.string().max(100).optional().or(z.literal('')),

  // Documentation
  philsys_card_number: z.string().max(20).optional().or(z.literal('')),

  // Household membership
  household_code: z.string().max(50).optional().or(z.literal('')),
});

export const updateResidentSchema = createResidentSchema.partial();

// Household validation schemas - aligned with exact database structure (27 fields)
export const createHouseholdSchema = z.object({
  // Primary identification
  code: z.string().min(1).max(50),
  name: z.string().max(200).optional(),
  address: z.string().optional(),
  
  // Location details - required fields
  houseNumber: z.string().min(1).max(50),
  streetId: z.string().uuid(), // UUID reference to geo_streets
  subdivisionId: z.string().uuid().optional(), // UUID reference to geo_subdivisions
  barangayCode: psgcCodeSchema,
  cityMunicipalityCode: psgcCodeSchema,
  provinceCode: psgcCodeSchema.optional(),
  regionCode: psgcCodeSchema,
  zipCode: z.string().max(10).optional(),
  
  // Household metrics
  noOfFamilies: z.number().int().min(0).optional(),
  noOfHouseholdMembers: z.number().int().min(0).optional(),
  noOfMigrants: z.number().int().min(0).optional(),
  
  // Household classifications (enums)
  householdType: z.enum(['nuclear', 'single_parent', 'extended', 'childless', 'one_person', 'non_family', 'other']).optional(),
  tenureStatus: z.enum(['owned', 'owned_with_mortgage', 'rented', 'occupied_for_free', 'occupied_without_consent', 'others']).optional(),
  tenureOthersSpecify: z.string().max(200).optional(),
  householdUnit: z.enum(['single_house', 'duplex', 'apartment', 'townhouse', 'condominium', 'boarding_house', 'institutional', 'makeshift', 'others']).optional(),
  
  // Economic information
  monthlyIncome: z.number().min(0).optional(),
  incomeClass: z.enum(['rich', 'high_income', 'upper_middle_income', 'middle_class', 'lower_middle_class', 'low_income', 'poor', 'not_determined']).optional(),
  
  // Head of household
  householdHeadId: z.string().uuid().optional(), // UUID reference to residents
  householdHeadPosition: z.enum(['father', 'mother', 'son', 'daughter', 'grandmother', 'grandfather', 'father_in_law', 'mother_in_law', 'brother_in_law', 'sister_in_law', 'spouse', 'sibling', 'guardian', 'ward', 'other']).optional(),
});

export const updateHouseholdSchema = createHouseholdSchema.partial();

// User management schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  mobileNumber: phoneSchema,
  barangayCode: psgcCodeSchema,
  roleId: z.string().uuid(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  barangayCode: psgcCodeSchema,
});

// Geographic filter schemas
export const geographicFilterSchema = z.object({
  regionCode: psgcCodeSchema.optional(),
  provinceCode: psgcCodeSchema.optional(),
  cityMunicipalityCode: psgcCodeSchema.optional(),
  barangayCode: psgcCodeSchema.optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z
    .number()
    .int()
    .min(1)
    .max(10 * 1024 * 1024), // 10MB max
  fileType: z.enum(['image/jpeg', 'image/png', 'application/pdf', 'text/csv']),
  purpose: z.enum(['profile_photo', 'document', 'import_data']),
});

/**
 * Validation error handler
 */
export function handleValidationError(error: z.ZodError): {
  code: ErrorCode;
  message: string;
  details: Array<{ field: string; message: string }>;
} {
  const details = error.issues.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Invalid input data',
    details,
  };
}

// REMOVED: sanitizeSearchInput - Use @/lib/authentication/validationUtils instead
// This prevents function duplication and ensures single source of truth for security

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

/**
 * Validate and sanitize sort parameters
 */
export function validateSort(
  params: URLSearchParams,
  allowedFields: string[]
): {
  field: string;
  order: 'asc' | 'desc';
} | null {
  const sort = params.get('sort');
  const order = (params.get('order') as 'asc' | 'desc') || 'desc';

  if (!sort || !allowedFields.includes(sort)) {
    return null;
  }

  return { field: sort, order };
}

/**
 * Create a validation middleware for API routes
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: Request, validatedData: T) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return handler(request, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = handleValidationError(error);
        return new Response(
          JSON.stringify({
            error: validationError,
            timestamp: new Date().toISOString(),
            path: new URL(request.url).pathname,
          }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Re-throw non-validation errors
      throw error;
    }
  };
}

/**
 * Type definitions for validated data
 */
export type CreateResidentData = z.infer<typeof createResidentSchema>;
export type UpdateResidentData = z.infer<typeof updateResidentSchema>;
export type CreateHouseholdData = z.infer<typeof createHouseholdSchema>;
export type UpdateHouseholdData = z.infer<typeof updateHouseholdSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
