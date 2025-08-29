'use client';

/**
 * Resident Validation Hook
 *
 * @description Validation hook for resident form data using validation factory.
 * Provides comprehensive validation for all resident form fields.
 */

import { z } from 'zod';

import { createValidationHook } from '@/lib/validation/createValidationHook';

/**
 * Comprehensive resident validation schema
 */
const residentValidationSchema = z
  .object({
    // Personal Information
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    middle_name: z.string().max(50, 'Middle name too long').optional(),
    suffix: z.string().max(10, 'Suffix too long').optional(),

    // Birth Information
    birthdate: z
      .string()
      .min(1, 'Birthdate is required')
      .refine(date => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 150;
      }, 'Please enter a valid birthdate'),

    place_of_birth: z
      .string()
      .min(1, 'Place of birth is required')
      .max(100, 'Place of birth too long'),

    // Demographics
    sex: z.enum(['male', 'female'], {
      message: 'Please select a valid sex',
    }),

    civil_status: z.enum(
      [
        'single',
        'married',
        'widowed',
        'divorced',
        'separated',
        'annulled',
        'registered_partnership',
        'live_in',
      ],
      {
        message: 'Please select a valid civil status',
      }
    ),

    citizenship: z.string().min(1, 'Citizenship is required').max(50, 'Citizenship too long'),

    // Contact Information
    contact_number: z
      .string()
      .optional()
      .refine(
        phone => !phone || /^(\+63|63|0)?[0-9]{10}$/.test(phone.replace(/[\s-()]/g, '')),
        'Please enter a valid Philippine phone number'
      ),

    email_address: z
      .string()
      .optional()
      .refine(
        email => !email || z.string().email().safeParse(email).success,
        'Please enter a valid email address'
      ),

    // Address Information
    house_number: z.string().max(20, 'House number too long').optional(),
    street: z.string().max(100, 'Street name too long').optional(),
    subdivision: z.string().max(100, 'Subdivision name too long').optional(),
    sitio: z.string().max(50, 'Sitio name too long').optional(),
    purok: z.string().max(50, 'Purok name too long').optional(),

    // Employment Information
    employment_status: z.enum(
      [
        'employed',
        'unemployed',
        'self_employed',
        'student',
        'retired',
        'homemaker',
        'disabled',
        'other',
      ],
      {
        message: 'Please select a valid employment status',
      }
    ),

    occupation: z.string().max(100, 'Occupation too long').optional(),
    monthly_income: z.number().min(0, 'Monthly income cannot be negative').optional(),

    // Education Information
    educational_attainment: z.enum(
      [
        'no_formal_education',
        'elementary_undergraduate',
        'elementary_graduate',
        'high_school_undergraduate',
        'high_school_graduate',
        'college_undergraduate',
        'college_graduate',
        'vocational',
        'post_graduate',
      ],
      {
        message: 'Please select a valid educational attainment',
      }
    ),

    // Physical Characteristics
    height: z.number().min(30, 'Height too low').max(300, 'Height too high').optional(),
    weight: z.number().min(1, 'Weight too low').max(500, 'Weight too high').optional(),

    // Family Information
    mother_maiden_name: z.string().max(100, 'Mother maiden name too long').optional(),
    father_name: z.string().max(100, 'Father name too long').optional(),

    // Government IDs
    philsys_card_number: z
      .string()
      .optional()
      .refine(
        id => !id || /^[0-9]{4}-[0-9]{7}-[0-9]{1}$/.test(id),
        'PhilSys ID format should be ####-#######-#'
      ),

    // Voting Information
    is_registered_voter: z.boolean().optional(),
    precinct_number: z.string().max(20, 'Precinct number too long').optional(),

    // Special Classifications
    is_senior_citizen: z.boolean().optional(),
    is_pwd: z.boolean().optional(),
    is_solo_parent: z.boolean().optional(),
    is_indigenous: z.boolean().optional(),

    // Migration Information
    is_migrant: z.boolean().optional(),
    previous_address: z.string().max(200, 'Previous address too long').optional(),

    // Sectoral Information
    sectoral_membership: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      // Custom validation: if registered voter, precinct number should be provided
      if (data.is_registered_voter && !data.precinct_number) {
        return false;
      }
      return true;
    },
    {
      message: 'Precinct number is required for registered voters',
      path: ['precinct_number'],
    }
  )
  .refine(
    data => {
      // Custom validation: if employed, occupation should be provided
      if (data.employment_status === 'employed' && !data.occupation) {
        return false;
      }
      return true;
    },
    {
      message: 'Occupation is required for employed residents',
      path: ['occupation'],
    }
  );

/**
 * Resident form data type
 */
export type ResidentFormData = z.infer<typeof residentValidationSchema>;

/**
 * Custom error messages for specific fields
 */
const customErrorMessages = {
  last_name: "Please enter the resident's last name",
  first_name: "Please enter the resident's first name",
  birthdate: 'Please select a valid birthdate',
  place_of_birth: 'Please specify where the resident was born',
  sex: "Please specify the resident's sex",
  civil_status: "Please select the resident's civil status",
  citizenship: "Please specify the resident's citizenship",
  employment_status: 'Please select the employment status',
  educational_attainment: 'Please select the educational attainment',
};

/**
 * Validation hook for resident forms with comprehensive validation
 */
export const useResidentValidation = createValidationHook(residentValidationSchema, {
  validateOnBlur: true,
  validateOnChange: false,
  debounceMs: 300,
  customMessages: customErrorMessages,
});

/**
 * Quick validation schemas for specific sections
 */
export const ResidentValidationSections = {
  personalInfo: createValidationHook(
    residentValidationSchema.pick({
      last_name: true,
      first_name: true,
      middle_name: true,
      suffix: true,
      birthdate: true,
      place_of_birth: true,
      sex: true,
      civil_status: true,
      citizenship: true,
    }),
    { customMessages: customErrorMessages }
  ),

  contactInfo: createValidationHook(
    residentValidationSchema.pick({
      contact_number: true,
      email_address: true,
      house_number: true,
      street: true,
      subdivision: true,
      sitio: true,
      purok: true,
    }),
    { customMessages: customErrorMessages }
  ),

  employmentInfo: createValidationHook(
    residentValidationSchema.pick({
      employment_status: true,
      occupation: true,
      monthly_income: true,
    }),
    { customMessages: customErrorMessages }
  ),

  educationInfo: createValidationHook(
    residentValidationSchema.pick({
      educational_attainment: true,
    }),
    { customMessages: customErrorMessages }
  ),
} as const;

/**
 * Utility function to validate specific resident data
 */
export function validateResidentData(data: unknown): {
  isValid: boolean;
  errors: Record<string, string[]>;
  data?: ResidentFormData;
} {
  try {
    const validData = residentValidationSchema.parse(data);
    return {
      isValid: true,
      errors: {},
      data: validData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};

      error.issues.forEach((err: any) => {
        const field = err.path.join('.');
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(
          customErrorMessages[field as keyof typeof customErrorMessages] || err.message
        );
      });

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: false,
      errors: { general: ['An unexpected validation error occurred'] },
    };
  }
}

// Export for backward compatibility
export default useResidentValidation;
