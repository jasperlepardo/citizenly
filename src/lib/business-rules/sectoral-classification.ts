/**
 * Sectoral Classification Business Rules
 * Contains all business logic for determining sectoral group classifications
 * Based on RBI (Registry of Basic Information) requirements
 */

import { SectoralInformation, SectoralContext } from '@/types';

// Employment statuses for auto-calculation (aligned with database enum)
export const EMPLOYED_STATUSES = ['employed', 'self_employed'];
export const UNEMPLOYED_STATUSES = ['unemployed', 'looking_for_work'];

// Indigenous ethnicities in the Philippines (based on database ethnicity_enum)
export const INDIGENOUS_ETHNICITIES = [
  // Current frontend options that are indigenous
  'indigenous_group', // General indigenous group selection
  'maranao',         // Maranao people of Mindanao
  'maguindanao',     // Maguindanao people of Mindanao
  'tausug',          // Tausug people of Sulu
  
  // Additional Muslim/Moro groups from database schema
  'yakan', 'samal', 'badjao',
  
  // Indigenous Peoples from database schema
  'aeta', 'agta', 'ati', 'batak', 'bukidnon', 'gaddang', 'higaonon', 
  'ibaloi', 'ifugao', 'igorot', 'ilongot', 'isneg', 'ivatan', 'kalinga', 
  'kankanaey', 'mangyan', 'mansaka', 'palawan', 'subanen', 'tboli', 
  'teduray', 'tumandok'
];

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if person qualifies as out-of-school children (5-17 years old, not in school)
 */
export function isOutOfSchoolChildren(age: number, education?: string): boolean {
  if (age < 5 || age > 17) return false;

  // If still in elementary/high school, not out-of-school
  const inSchoolEducation = [
    'elementary_graduate',
    'high_school_graduate',
    'senior_high_graduate',
  ];
  return !inSchoolEducation.some(level => education?.includes(level));
}

/**
 * Check if person qualifies as out-of-school youth (18-30 years old, not in school, not employed)
 */
export function isOutOfSchoolYouth(age: number, education?: string, employment?: string): boolean {
  if (age < 18 || age > 30) return false;

  // Must not be in tertiary education
  const inTertiaryEducation = [
    'college_undergraduate',
    'college_graduate',
    'vocational_graduate',
  ];
  const isInSchool = inTertiaryEducation.some(level => education?.includes(level));

  // Must not be employed
  const isEmployed = EMPLOYED_STATUSES.includes(employment || '');

  return !isInSchool && !isEmployed;
}

/**
 * Check if person is considered indigenous based on ethnicity
 */
export function isIndigenousPeople(ethnicity: string): boolean {
  return INDIGENOUS_ETHNICITIES.includes(ethnicity);
}

/**
 * Check if person is employed based on employment status
 */
export function isEmployed(employmentStatus: string): boolean {
  return EMPLOYED_STATUSES.includes(employmentStatus);
}

/**
 * Check if person is unemployed based on employment status
 */
export function isUnemployed(employmentStatus: string): boolean {
  return UNEMPLOYED_STATUSES.includes(employmentStatus);
}

/**
 * Check if person is a senior citizen (60+)
 */
export function isSeniorCitizen(age: number): boolean {
  return age >= 60;
}

/**
 * Auto-calculate all sectoral flags based on context data
 */
export function calculateSectoralFlags(context: SectoralContext): Partial<SectoralInformation> {
  const age = context.age || (context.birthdate ? calculateAge(context.birthdate) : 0);
  const employment = context.employment_status || '';
  const ethnicity = context.ethnicity || '';

  return {
    is_labor_force_employed: isEmployed(employment),
    is_unemployed: isUnemployed(employment),
    is_out_of_school_children: isOutOfSchoolChildren(age, context.highest_educational_attainment),
    is_out_of_school_youth: isOutOfSchoolYouth(
      age,
      context.highest_educational_attainment,
      employment
    ),
    is_senior_citizen: isSeniorCitizen(age),
    is_indigenous_people: isIndigenousPeople(ethnicity),
  };
}

/**
 * Update sectoral information with auto-calculated values while preserving manual overrides
 */
export function updateSectoralInformation(
  current: SectoralInformation,
  context: SectoralContext
): SectoralInformation {
  const calculated = calculateSectoralFlags(context);

  return {
    ...current,
    ...calculated,
    // Reset registered senior citizen if no longer senior
    is_registered_senior_citizen: calculated.is_senior_citizen
      ? current.is_registered_senior_citizen
      : false,
  };
}

/**
 * Get active sectoral classifications as readable labels
 */
export function getActiveSectoralClassifications(sectoral: SectoralInformation): string[] {
  return Object.entries(sectoral)
    .filter(([, value]) => value === true)
    .map(([key]) => key.replace('is_', '').replace(/_/g, ' '));
}