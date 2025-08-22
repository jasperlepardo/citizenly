/**
 * Generated Zod Validation Schemas
 * 
 * This file is auto-generated. Do not edit manually.
 * Generated at: 2025-08-22T16:48:38.723Z
 * 
 * To update schemas, modify scripts/generate-enums.ts and run:
 * npm run generate:enums
 */

import { z } from 'zod';

export const sexSchema = z.enum(['male', 'female']);
export const civil_statusSchema = z.enum(['single', 'married', 'widowed', 'divorced', 'separated', 'annulled', 'others']);
export const employment_statusSchema = z.enum(['employed', 'unemployed', 'self_employed', 'student', 'retired', 'not_in_labor_force', 'ofw']);
export const blood_typeSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const citizenshipSchema = z.enum(['filipino', 'dual_citizen', 'foreigner']);
export const religionSchema = z.enum(['roman_catholic', 'islam', 'iglesia_ni_cristo', 'christian', 'aglipayan_church', 'seventh_day_adventist', 'bible_baptist_church', 'jehovahs_witnesses', 'church_of_jesus_christ_latter_day_saints', 'united_church_of_christ_philippines', 'others']);
export const ethnicitySchema = z.enum(['tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon', 'bikolano', 'waray', 'kapampangan', 'pangasinense', 'maranao', 'maguindanao', 'tausug', 'yakan', 'samal', 'badjao', 'aeta', 'agta', 'ati', 'batak', 'bukidnon', 'gaddang', 'higaonon', 'ibaloi', 'ifugao', 'igorot', 'ilongot', 'isneg', 'ivatan', 'kalinga', 'kankanaey', 'mangyan', 'mansaka', 'palawan', 'subanen', 'tboli', 'teduray', 'tumandok', 'chinese', 'others']);
export const education_levelSchema = z.enum(['elementary', 'high_school', 'college', 'post_graduate', 'vocational']);
export const income_classSchema = z.enum(['rich', 'high_income', 'upper_middle_income', 'middle_class', 'lower_middle_class', 'low_income', 'poor', 'not_determined']);
