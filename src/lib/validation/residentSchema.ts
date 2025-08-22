/**
 * Resident validation schemas using Zod
 * Provides runtime validation for resident data forms
 */

import { z } from 'zod';
import type { ValidationResult as BaseValidationResult } from './types';

// Base schema for common validations
const nameSchema = z.string().min(1, 'Required').max(100, 'Too long (max 100 characters)');
const optionalNameSchema = z
  .string()
  .max(100, 'Too long (max 100 characters)')
  .optional()
  .or(z.literal(''));

// Phone number validation for Philippine format
const phoneSchema = z
  .string()
  .regex(/^09\d{9}$/, 'Invalid mobile number format (09XXXXXXXXX)')
  .optional()
  .or(z.literal(''));

// Email validation
const emailSchema = z.string().email('Invalid email format').optional().or(z.literal(''));

// Date validation
const dateSchema = z.string().refine(
  date => {
    if (!date) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  },
  { message: 'Invalid date or future date not allowed' }
);

// Optional date validation
const optionalDateSchema = z
  .string()
  .refine(
    date => {
      if (!date) return true;
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: 'Invalid date format' }
  )
  .optional()
  .or(z.literal(''));

// PhilSys card number validation
const philsysSchema = z
  .string()
  .regex(/^\d{4}-\d{4}-\d{4}-\d{4}$/, 'Invalid PhilSys format (XXXX-XXXX-XXXX-XXXX)')
  .optional()
  .or(z.literal(''));

// Number validations - handle string inputs from forms
const positiveNumberSchema = z.number().positive('Must be greater than 0').optional();
const heightSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === 'string') {
      if (!val.trim()) return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  })
  .refine((val) => val === undefined || (val >= 50 && val <= 300), 'Height must be between 50-300 cm')
  .optional();

const weightSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === 'string') {
      if (!val.trim()) return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  })
  .refine((val) => val === undefined || (val >= 1 && val <= 500), 'Weight must be between 1-500 kg')
  .optional();

/**
 * Complete resident validation schema
 * Covers all fields available in the resident edit form
 */
export const ResidentFormSchema = z.object({
  // Personal Information
  first_name: nameSchema,
  middle_name: optionalNameSchema,
  last_name: nameSchema,
  extension_name: z.string().max(20, 'Too long (max 20 characters)').optional().or(z.literal('')),
  birthdate: dateSchema,
  sex: z.enum(['male', 'female'], { message: 'Sex is required' }),
  civil_status: z.enum(['single', 'married', 'divorced', 'widowed', 'separated'], {
    message: 'Civil status is required',
  }),
  civil_status_others_specify: z.string().max(200, 'Too long').optional().or(z.literal('')),
  citizenship: z.enum(['filipino', 'foreign'], { message: 'Citizenship is required' }).optional(),

  // Birth Place Information
  birth_place_name: z.string().max(200, 'Too long').optional().or(z.literal('')),
  birth_place_code: z.string().max(20, 'Too long').optional().or(z.literal('')),
  birth_place_level: z.enum(['region', 'province', 'city_municipality', 'barangay']).optional(),

  // Contact Information
  mobile_number: phoneSchema,
  email: emailSchema,
  telephone_number: z.string().max(20, 'Too long').optional().or(z.literal('')),
  philsys_card_number: philsysSchema,

  // Address Information
  household_code: z.string().max(50, 'Too long').optional().or(z.literal('')),
  street_id: z.string().uuid().optional().or(z.literal('')),
  subdivision_id: z.string().uuid().optional().or(z.literal('')),
  zip_code: z.string().max(10, 'Too long').optional().or(z.literal('')),

  // Education & Employment
  education_attainment: z
    .enum([
      'elementary',
      'high_school', 
      'college',
      'post_graduate',
      'vocational',
    ])
    .optional(),
  is_graduate: z.boolean().optional(),
  employment_status: z
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
    .optional(),
  occupation_code: z.string().max(50, 'Too long').optional().or(z.literal('')),

  // Physical Characteristics
  blood_type: z
    .enum([
      'A+',
      'A-',
      'B+',
      'B-',
      'AB+',
      'AB-',
      'O+',
      'O-',
      'unknown',
    ])
    .optional(),
  height: heightSchema,
  weight: weightSchema,
  complexion: z.string().max(50, 'Too long').optional().or(z.literal('')),

  // Cultural & Religious Information
  religion: z
    .enum([
      'roman_catholic',
      'protestant',
      'islam',
      'iglesia_ni_cristo',
      'buddhism',
      'hinduism',
      'judaism',
      'others',
      'prefer_not_to_say',
    ])
    .optional(),
  religion_others_specify: z.string().max(200, 'Too long').optional().or(z.literal('')),
  ethnicity: z
    .enum([
      'tagalog',
      'cebuano',
      'ilocano',
      'bisaya',
      'hiligaynon',
      'bikol',
      'waray',
      'kapampangan',
      'pangasinan',
      'maranao',
      'maguindanao',
      'tausug',
      'others',
      'not_reported',
    ])
    .optional(),

  // Voting Information
  is_voter: z.boolean().optional(),
  is_resident_voter: z.boolean().optional(),
  last_voted_date: optionalDateSchema,

  // Mother's Maiden Name
  mother_maiden_first: optionalNameSchema,
  mother_maiden_middle: optionalNameSchema,
  mother_maiden_last: optionalNameSchema,
});

/**
 * Type inference from the schema
 */
export type ResidentEditFormData = z.infer<typeof ResidentFormSchema>;

/**
 * Validation result type (uses centralized type with backward compatibility)
 */
export interface ValidationResult extends BaseValidationResult<ResidentEditFormData> {
  success?: boolean; // Backward compatibility
}

/**
 * Validates resident form data
 * @param data - Raw form data to validate
 * @returns Validation result with typed data or errors
 */
export function validateResidentForm(data: unknown): ValidationResult {
  try {
    const validatedData = ResidentFormSchema.parse(data);
    return { success: true, data: validatedData, isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors, isValid: false };
    }
    return { success: false, errors: { general: 'Validation failed' }, isValid: false };
  }
}

/**
 * Partial schema for updating residents (all fields optional)
 */
export const ResidentUpdateSchema = ResidentFormSchema.partial();
export type ResidentUpdateData = z.infer<typeof ResidentUpdateSchema>;

/**
 * Schema for specific sections of the form
 */
export const PersonalInfoSchema = ResidentFormSchema.pick({
  first_name: true,
  middle_name: true,
  last_name: true,
  extension_name: true,
  birthdate: true,
  sex: true,
  civil_status: true,
  civil_status_others_specify: true,
  citizenship: true,
});

export const ContactInfoSchema = ResidentFormSchema.pick({
  mobile_number: true,
  email: true,
  telephone_number: true,
  philsys_card_number: true,
});

export const EducationEmploymentSchema = ResidentFormSchema.pick({
  education_attainment: true,
  is_graduate: true,
  employment_status: true,
  occupation_code: true,
});

export const SectoralInfoSchema = ResidentFormSchema.pick({
  education_attainment: true,
  is_graduate: true,
  employment_status: true,
  occupation_code: true,
});

export const PhysicalInfoSchema = ResidentFormSchema.pick({
  blood_type: true,
  height: true,
  weight: true,
  complexion: true,
});

export const CulturalInfoSchema = ResidentFormSchema.pick({
  religion: true,
  religion_others_specify: true,
  ethnicity: true,
});

export const VotingInfoSchema = ResidentFormSchema.pick({
  is_voter: true,
  is_resident_voter: true,
  last_voted_date: true,
});

export const MotherMaidenNameSchema = ResidentFormSchema.pick({
  mother_maiden_first: true,
  mother_maiden_middle: true,
  mother_maiden_last: true,
});

export const BirthPlaceSchema = ResidentFormSchema.pick({
  birth_place_name: true,
  birth_place_code: true,
  birth_place_level: true,
});

export const AddressInfoSchema = ResidentFormSchema.pick({
  household_code: true,
  street_id: true,
  subdivision_id: true,
  zip_code: true,
});
