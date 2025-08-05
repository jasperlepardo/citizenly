import { z } from 'zod';

/**
 * Comprehensive server-side validation schemas
 * These provide security through input validation and sanitization
 */

// Common validation patterns
const PHONE_REGEX = /^(\+63|0)?[0-9]{10}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHILSYS_REGEX = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
const NAME_REGEX = /^[a-zA-Z\s\-'\.]+$/;
const HOUSEHOLD_CODE_REGEX = /^\d{9}-\d{4}-\d{4}-\d{4}$/;

// Security: Sanitize string inputs
function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .substring(0, 255); // Limit length to prevent DoS
}

// Security: Validate and sanitize name fields
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(NAME_REGEX, 'Name contains invalid characters')
  .transform(sanitizeString);

// Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: nameSchema,
  middleName: z
    .string()
    .max(100)
    .regex(NAME_REGEX)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  lastName: nameSchema,
  extensionName: z
    .string()
    .max(20)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  birthdate: z.string().refine(date => {
    const parsedDate = new Date(date);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    return parsedDate <= now && parsedDate >= minDate;
  }, 'Invalid birthdate'),
  sex: z.enum(['male', 'female']),
  civilStatus: z.enum([
    'single',
    'married',
    'widowed',
    'divorced',
    'separated',
    'annulled',
    'registered_partnership',
    'live_in',
  ]),
  citizenship: z.enum(['filipino', 'dual_citizen', 'foreign_national']).default('filipino'),
});

// Contact Information Schema
export const contactInfoSchema = z.object({
  mobileNumber: z
    .string()
    .regex(PHONE_REGEX, 'Invalid Philippine mobile number format')
    .transform(phone => phone.replace(/[^\d]/g, '')), // Sanitize to numbers only
  telephoneNumber: z
    .string()
    .regex(/^[0-9\-\+\(\)\s]*$/, 'Invalid telephone number format')
    .optional()
    .transform(val => (val ? val.replace(/[^\d\-\+\(\)\s]/g, '') : undefined)),
  email: z
    .string()
    .regex(EMAIL_REGEX, 'Invalid email format')
    .max(255, 'Email too long')
    .optional()
    .transform(val => (val ? sanitizeString(val.toLowerCase()) : undefined)),
});

// PhilSys Validation Schema
export const philsysSchema = z.object({
  philsysCardNumber: z
    .string()
    .regex(PHILSYS_REGEX, 'PhilSys card number must be in format: 1234-5678-9012-3456')
    .optional()
    .transform(val => (val ? val.replace(/[^\d\-]/g, '') : undefined)), // Sanitize format
});

// Education Schema
export const educationSchema = z.object({
  educationLevel: z
    .enum([
      'no_formal_education',
      'elementary',
      'high_school',
      'college',
      'post_graduate',
      'vocational',
      'graduate',
      'undergraduate',
    ])
    .optional(),
  educationStatus: z
    .enum(['currently_studying', 'not_studying', 'graduated', 'dropped_out'])
    .optional(),
});

// Employment Schema
export const employmentSchema = z.object({
  employmentStatus: z
    .enum([
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
    ])
    .default('not_in_labor_force'),
  psocCode: z
    .string()
    .max(10)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  occupationTitle: z
    .string()
    .max(200)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  workplace: z
    .string()
    .max(255)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
});

// Health Information Schema
export const healthInfoSchema = z.object({
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
    .default('unknown'),
  height: z.number().min(50).max(300).optional(), // Height in cm
  weight: z.number().min(1).max(500).optional(), // Weight in kg
  complexion: z
    .string()
    .max(50)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
});

// Demographics Schema
export const demographicsSchema = z.object({
  ethnicity: z
    .enum([
      'tagalog',
      'cebuano',
      'ilocano',
      'bisaya',
      'hiligaynon',
      'bicolano',
      'waray',
      'kapampangan',
      'pangasinan',
      'maranao',
      'maguindanao',
      'tausug',
      'indigenous_group',
      'mixed_heritage',
      'other',
      'not_reported',
    ])
    .default('not_reported'),
  religion: z
    .enum([
      'roman_catholic',
      'protestant',
      'iglesia_ni_cristo',
      'islam',
      'buddhism',
      'judaism',
      'hinduism',
      'indigenous_beliefs',
      'other',
      'none',
    ])
    .default('other'),
});

// Voting Information Schema
export const votingInfoSchema = z.object({
  voterRegistrationStatus: z.boolean().default(false),
  residentVoterStatus: z.boolean().default(false),
  voterIdNumber: z
    .string()
    .max(20)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  lastVotedYear: z
    .string()
    .regex(/^\d{4}$/, 'Year must be 4 digits')
    .optional(),
});

// Household Schema
export const householdSchema = z.object({
  householdCode: z.string().regex(HOUSEHOLD_CODE_REGEX, 'Invalid household code format').optional(),
  householdNumber: z
    .string()
    .max(50)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  streetName: z
    .string()
    .max(200)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  houseNumber: z
    .string()
    .max(50)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  subdivision: z
    .string()
    .max(100)
    .optional()
    .transform(val => (val ? sanitizeString(val) : undefined)),
  zipCode: z
    .string()
    .regex(/^\d{4}$/, 'ZIP code must be 4 digits')
    .optional(),
});

// Complete Resident Validation Schema
export const residentSchema = personalInfoSchema
  .merge(contactInfoSchema)
  .merge(philsysSchema)
  .merge(educationSchema)
  .merge(employmentSchema)
  .merge(healthInfoSchema)
  .merge(demographicsSchema)
  .merge(votingInfoSchema)
  .merge(householdSchema);

// Server-side validation function
export async function validateResidentData(data: any) {
  try {
    const validatedData = await residentSchema.parseAsync(data);
    return {
      success: true,
      data: validatedData,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }

    return {
      success: false,
      data: null,
      errors: [{ field: 'general', message: 'Validation failed' }],
    };
  }
}

// PSGC Code Validation
export const psgcCodeSchema = z.string().regex(/^\d{9}$/, 'PSGC code must be 9 digits');

// File Upload Validation
export const fileUploadSchema = z.object({
  file: z
    .any()
    .refine(
      file => file?.size <= 5 * 1024 * 1024, // 5MB limit
      'File size must be less than 5MB'
    )
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(file?.type),
      'File must be JPEG, PNG, GIF, or PDF'
    ),
});

// Security: Rate limiting validation
export function validateRateLimit(identifier: string, maxRequests: number = 100): boolean {
  // This would connect to a rate limiting service in production
  // For now, return true but log the attempt
  console.log(`[RATE_LIMIT] Request from ${identifier} - Limit: ${maxRequests}/hour`);
  return true;
}

// Security: Input sanitization for search queries
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>\"'&%]/g, '') // Remove XSS and SQL injection characters
    .substring(0, 100); // Limit length
}

// Security: Validate user permissions
export function validateUserPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    super_admin: ['all'],
    barangay_admin: ['residents:crud', 'households:crud', 'settings:manage'],
    clerk: ['residents:crud', 'households:crud'],
    resident: ['residents:read_own'],
  };

  const permissions = rolePermissions[userRole] || [];
  return permissions.includes('all') || permissions.includes(requiredPermission);
}
