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

// Resident validation schemas
export const createResidentSchema = z.object({
  // Required fields
  firstName: nameSchema,
  lastName: nameSchema,
  birthdate: dateSchema,
  sex: z.enum(['male', 'female']),

  // Optional personal info
  middleName: z.string().max(100).optional().or(z.literal('')),
  extensionName: z.string().max(20).optional().or(z.literal('')),

  // Contact information
  email: emailSchema.optional().or(z.literal('')),
  mobileNumber: phoneSchema,
  telephoneNumber: z.string().max(50).optional().or(z.literal('')),

  // Personal details (aligned with database enums)
  civilStatus: z
    .enum(['single', 'married', 'widowed', 'separated', 'divorced', 'others'])
    .default('single'),
  civilStatusOthersSpecify: z.string().max(200).optional().or(z.literal('')),
  citizenship: z
    .enum(['filipino', 'dual_citizen', 'foreigner'])
    .default('filipino'),
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal('')),
  ethnicity: z
    .enum(['tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bikolano', 'waray', 'kapampangan', 'pangasinense', 'maranao', 'maguindanao', 'tausug', 'yakan', 'samal', 'badjao', 'aeta', 'agta', 'ati', 'batak', 'bukidnon', 'gaddang', 'higaonon', 'ibaloi', 'ifugao', 'igorot', 'ilongot', 'isneg', 'ivatan', 'kalinga', 'kankanaey', 'mangyan', 'mansaka', 'palawan', 'subanen', 'tboli', 'teduray', 'tumandok', 'chinese', 'others'])
    .optional()
    .or(z.literal('')),
  religion: z
    .enum(['roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian', 'aglipayan_church', 'seventh_day_adventist', 'bible_baptist_church', 'jehovahs_witnesses', 'church_of_jesus_christ_latter_day_saints', 'united_church_of_christ_philippines', 'others'])
    .default('roman_catholic'),
  religionOthersSpecify: z.string().max(200).optional().or(z.literal('')),

  // Physical characteristics
  height: z.string().max(10).optional().or(z.literal('')),
  weight: z.string().max(10).optional().or(z.literal('')),
  complexion: z.string().max(50).optional().or(z.literal('')),

  // Birth place information
  birthPlaceCode: z.string().max(10).optional().or(z.literal('')),

  // Documentation
  philsysCardNumber: z.string().max(20).optional().or(z.literal('')),

  // Family information (allow empty strings)
  motherMaidenFirstName: z.union([z.string().max(100).min(1), z.literal('')]).optional(),
  motherMaidenMiddleName: z.union([z.string().max(100).min(1), z.literal('')]).optional(),
  motherMaidenLastName: z.union([z.string().max(100).min(1), z.literal('')]).optional(),

  // Education and employment (aligned with database enum)
  educationAttainment: z
    .union([
      z.enum([
        'elementary',
        'high_school',
        'college',
        'post_graduate',
        'vocational',
      ]),
      z.literal(''),
    ])
    .optional(),
  isGraduate: z.boolean().default(false),
  employmentStatus: z
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
    ])
    .optional()
    .default('not_in_labor_force'),
  occupationCode: z.string().max(10).optional().or(z.literal('')),

  // Voting information
  isVoter: z.union([z.boolean(), z.null()]).optional(),
  isResidentVoter: z.union([z.boolean(), z.null()]).optional(),
  lastVotedDate: z.string().optional().or(z.literal('')),

  // Household
  householdCode: z.string().max(50).optional().or(z.literal('')),
});

export const updateResidentSchema = createResidentSchema.partial();

// Household validation schemas
export const createHouseholdSchema = z.object({
  code: z.string().min(1).max(50),
  streetName: z.string().max(200).optional(),
  subdivisionName: z.string().max(200).optional(),
  householdNumber: z.string().max(50).optional(),

  // Geographic codes
  barangayCode: psgcCodeSchema,
  cityMunicipalityCode: psgcCodeSchema.optional(),
  provinceCode: psgcCodeSchema.optional(),
  regionCode: psgcCodeSchema.optional(),

  // Head of household
  headResidentId: z.string().uuid().optional(),
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
