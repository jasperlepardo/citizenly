/**
 * Generated Zod Validation Schemas
 * 
 * This file is auto-generated. Do not edit manually.
 * Generated at: 2025-08-14T09:48:14.343Z
 * 
 * To update schemas, modify scripts/generate-enums.ts and run:
 * npm run generate:enums
 */

import { z } from 'zod';

export const sexSchema = z.enum(['male', 'female']);
export const civil_statusSchema = z.enum(['single', 'married', 'widowed', 'divorced', 'separated', 'annulled']);
export const employment_statusSchema = z.enum(['employed', 'unemployed', 'self_employed', 'student', 'retired', 'not_in_labor_force', 'ofw']);
export const blood_typeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']);
export const citizenshipSchema = z.enum(['filipino', 'dual_citizen', 'foreign_national']);
export const religionSchema = z.enum(['roman_catholic', 'protestant', 'iglesia_ni_cristo', 'islam', 'buddhism', 'judaism', 'hinduism', 'indigenous_beliefs', 'other', 'none', 'prefer_not_to_say']);
export const ethnicitySchema = z.enum(['tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bicolano', 'waray', 'kapampangan', 'pangasinan', 'maranao', 'maguindanao', 'tausug', 'indigenous_group', 'mixed_heritage', 'other', 'not_reported']);
export const education_levelSchema = z.enum(['no_schooling', 'elementary_undergraduate', 'elementary_graduate', 'high_school_undergraduate', 'high_school_graduate', 'college_undergraduate', 'college_graduate', 'post_graduate', 'vocational']);
