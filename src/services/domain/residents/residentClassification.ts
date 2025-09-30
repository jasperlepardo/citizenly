/**
 * Unified Resident Classification System
 * Consolidates all classification logic for residents including:
 * - Sectoral demographics (PWD, senior citizens, etc.)
 * - Migration status and patterns
 * - Vulnerability assessments
 */

import { calculateAge } from '@/utils/shared/dateUtils';

// ============================================================================
// SECTORAL CLASSIFICATION
// ============================================================================

// Employment statuses for auto-calculation
export const EMPLOYED_STATUSES = ['employed', 'self_employed'];
export const UNEMPLOYED_STATUSES = ['unemployed', 'looking_for_work'];
export const LABOR_FORCE_STATUSES = [...EMPLOYED_STATUSES, ...UNEMPLOYED_STATUSES, 'underemployed'];

// Indigenous ethnicities in the Philippines
export const INDIGENOUS_ETHNICITIES = [
  'indigenous_group',
  'maranao',
  'maguindanao',
  'tausug',
  'sama',
  'badjao', // Sama-Bajau indigenous sea nomads
  'yakan',
  'ibanag',
  'ivatan',
  'ilocano',
  'tagalog',
  'aeta',
  'agta',
  'ati',
  'batak',
  'mamanwa',
];

/**
 * Sectoral information structure
 */
export interface SectoralInformation {
  is_labor_force_employed?: boolean;
  is_unemployed?: boolean;
  is_out_of_school_children?: boolean;
  is_out_of_school_youth?: boolean;
  is_senior_citizen?: boolean;
  is_indigenous_people?: boolean;
}

/**
 * Sectoral context for classification
 */
export interface SectoralContext {
  birthdate?: string | null;
  employment_status?: string | null;
  education_attainment?: string | null;
  ethnicity?: string | null;
}

// Sectoral classification functions
export const isEmployed = (employmentStatus: string): boolean => {
  return EMPLOYED_STATUSES.includes(employmentStatus.toLowerCase());
};

export const isUnemployed = (employmentStatus: string): boolean => {
  return UNEMPLOYED_STATUSES.includes(employmentStatus.toLowerCase());
};

export const isSeniorCitizen = (age: number): boolean => {
  return age >= 60;
};

export const isIndigenousPeople = (ethnicity: string): boolean => {
  const lowerEthnicity = ethnicity.toLowerCase();
  return INDIGENOUS_ETHNICITIES.includes(lowerEthnicity);
};

export const isOutOfSchoolChildren = (age: number, educationAttainment?: string): boolean => {
  const schoolAge = age >= 5 && age <= 17;
  const notInSchool = !educationAttainment || 
    educationAttainment === 'no_education' ||
    educationAttainment === 'preschool';
  return schoolAge && notInSchool;
};

export const isOutOfSchoolYouth = (age: number, educationAttainment?: string, employmentStatus?: string): boolean => {
  const youthAge = age >= 15 && age <= 30;
  const notInSchool = !educationAttainment || 
    !educationAttainment.includes('college') &&
    !educationAttainment.includes('post_graduate');
  const notEmployed = !employmentStatus || isUnemployed(employmentStatus);
  return youthAge && notInSchool && notEmployed;
};

// ============================================================================
// MIGRATION CLASSIFICATION
// ============================================================================

// Migration types
export const MIGRATION_TYPES = {
  INTER_BARANGAY: 'inter_barangay',
  INTER_CITY: 'inter_city',
  INTER_PROVINCE: 'inter_province',
  INTER_REGION: 'inter_region',
  INTERNATIONAL: 'international',
  RETURN_MIGRANT: 'return_migrant',
} as const;

// Migration reasons
export const MIGRATION_REASONS = {
  EMPLOYMENT: 'employment',
  EDUCATION: 'education',
  FAMILY: 'family',
  HOUSING: 'housing',
  HEALTH: 'health',
  DISASTER: 'disaster',
  CONFLICT: 'conflict',
  MARRIAGE: 'marriage',
  RETIREMENT: 'retirement',
  OTHER: 'other',
} as const;

/**
 * Migration context for classification
 */
export interface MigrationContext {
  previous_barangay_code?: string | null;
  previous_city_municipality_code?: string | null;
  previous_province_code?: string | null;
  previous_region_code?: string | null;
  previous_country?: string | null;
  current_barangay_code?: string | null;
  current_city_municipality_code?: string | null;
  current_province_code?: string | null;
  current_region_code?: string | null;
  date_of_transfer?: string | null;
  reason_for_leaving?: string | null;
  reason_for_transferring?: string | null;
  length_of_stay_previous_months?: number | null;
  duration_of_stay_current_months?: number | null;
  is_intending_to_return?: boolean | null;
}

/**
 * Migration classification result
 */
export interface MigrationClassification {
  is_migrant: boolean;
  migration_type?: string;
  migration_reason?: string;
  is_recent_migrant: boolean;
  is_economic_migrant: boolean;
  is_education_migrant: boolean;
  is_family_migrant: boolean;
  is_forced_migrant: boolean;
  is_return_migrant: boolean;
  is_seasonal_migrant: boolean;
}

// Migration helper functions
export const isMigrant = (context: MigrationContext): boolean => {
  return Boolean(
    context.previous_barangay_code ||
    context.previous_city_municipality_code ||
    context.previous_province_code ||
    context.previous_region_code ||
    context.previous_country
  );
};

export const isRecentMigrant = (dateOfTransfer?: string | null): boolean => {
  if (!dateOfTransfer) return false;
  const transferDate = new Date(dateOfTransfer);
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  return transferDate > fiveYearsAgo;
};

// Helper to categorize migration reason
const categorizeReason = (reason: string): string => {
  const reasonMap: Record<string, string[]> = {
    [MIGRATION_REASONS.EMPLOYMENT]: ['work', 'job', 'employment', 'business'],
    [MIGRATION_REASONS.EDUCATION]: ['school', 'education', 'study', 'college'],
    [MIGRATION_REASONS.FAMILY]: ['family', 'parent', 'child', 'relative'],
    [MIGRATION_REASONS.MARRIAGE]: ['marriage', 'married', 'spouse'],
    [MIGRATION_REASONS.HOUSING]: ['house', 'housing', 'rent', 'evict'],
    [MIGRATION_REASONS.HEALTH]: ['health', 'medical', 'hospital', 'treatment'],
    [MIGRATION_REASONS.DISASTER]: ['disaster', 'typhoon', 'flood', 'earthquake'],
    [MIGRATION_REASONS.CONFLICT]: ['conflict', 'war', 'violence', 'unsafe'],
    [MIGRATION_REASONS.RETIREMENT]: ['retire', 'retirement'],
  };

  const lowerReason = reason.toLowerCase();
  for (const [category, keywords] of Object.entries(reasonMap)) {
    if (keywords.some(keyword => lowerReason.includes(keyword))) {
      return category;
    }
  }
  return MIGRATION_REASONS.OTHER;
};

// ============================================================================
// UNIFIED CLASSIFICATION
// ============================================================================

/**
 * Complete resident context combining all classification aspects
 */
export interface ResidentClassificationContext extends SectoralContext, MigrationContext {
  sex?: string | null;
  civil_status?: string | null;
}

/**
 * Complete classification result
 */
export interface ResidentClassification {
  sectoral: SectoralInformation;
  migration: MigrationClassification;
  vulnerabilities: string[];
}

/**
 * Main classification function combining sectoral and migration analysis
 */
/**
 * Calculate sectoral information flags based on resident data
 */
const calculateSectoralInformation = (
  context: ResidentClassificationContext,
  age: number
): SectoralInformation => {
  return {
    is_labor_force_employed: context.employment_status ? isEmployed(context.employment_status) : false,
    is_unemployed: context.employment_status ? isUnemployed(context.employment_status) : false,
    is_out_of_school_children: isOutOfSchoolChildren(age, context.education_attainment || undefined),
    is_out_of_school_youth: isOutOfSchoolYouth(
      age,
      context.education_attainment || undefined,
      context.employment_status || undefined
    ),
    is_senior_citizen: isSeniorCitizen(age),
    is_indigenous_people: context.ethnicity ? isIndigenousPeople(context.ethnicity) : false,
  };
};

/**
 * Calculate sectoral flags based on context (for form components)
 */
export const calculateSectoralFlags = (context: SectoralContext): SectoralInformation => {
  // Use the consolidated calculateAge function for consistency
  console.log('🔍 calculateSectoralFlags: Input context:', context);
  const age = context.birthdate ? calculateAge(context.birthdate) : 0;
  console.log('🔍 calculateSectoralFlags: Calculated age:', age);
  const result = calculateSectoralInformation(context, age);
  console.log('🔍 calculateSectoralFlags: Result:', result);
  return result;
};

/**
 * Build migration classification for resident
 */
const buildMigrationClassification = (
  context: ResidentClassificationContext,
  migrantStatus: boolean
): MigrationClassification => {
  const migration: MigrationClassification = {
    is_migrant: migrantStatus,
    is_recent_migrant: isRecentMigrant(context.date_of_transfer),
    is_economic_migrant: false,
    is_education_migrant: false,
    is_family_migrant: false,
    is_forced_migrant: false,
    is_return_migrant: Boolean(context.is_intending_to_return),
    is_seasonal_migrant: Boolean(
      context.is_intending_to_return || 
      (context.duration_of_stay_current_months && context.duration_of_stay_current_months < 12)
    ),
  };

  if (migrantStatus && (context.reason_for_leaving || context.reason_for_transferring)) {
    const reason = categorizeReason(context.reason_for_leaving || context.reason_for_transferring || '');
    migration.migration_reason = reason;
    
    // Apply migration types based on reason
    migration.is_economic_migrant = reason === MIGRATION_REASONS.EMPLOYMENT;
    migration.is_education_migrant = reason === MIGRATION_REASONS.EDUCATION;
    migration.is_family_migrant = reason === MIGRATION_REASONS.FAMILY || reason === MIGRATION_REASONS.MARRIAGE;
    migration.is_forced_migrant = reason === MIGRATION_REASONS.DISASTER || reason === MIGRATION_REASONS.CONFLICT;
  }

  return migration;
};

/**
 * Assess age-based vulnerabilities
 */
const assessAgeVulnerabilities = (age: number): string[] => {
  const vulnerabilities: string[] = [];
  
  if (age < 5) vulnerabilities.push('under_five');
  if (age < 18) vulnerabilities.push('minor');
  if (age >= 60) vulnerabilities.push('senior_citizen');
  
  return vulnerabilities;
};

/**
 * Assess gender and civil status vulnerabilities
 */
const assessGenderVulnerabilities = (
  context: ResidentClassificationContext,
  age: number
): string[] => {
  const vulnerabilities: string[] = [];
  
  if (context.sex !== 'female') return vulnerabilities;
  
  if (context.civil_status === 'single' && age < 30) {
    vulnerabilities.push('young_female');
  }
  
  if (context.civil_status === 'widowed' || context.civil_status === 'separated') {
    vulnerabilities.push('single_parent');
  }
  
  return vulnerabilities;
};

/**
 * Assess migration-related vulnerabilities
 */
const assessMigrationVulnerabilities = (
  migration: MigrationClassification,
  age: number
): string[] => {
  const vulnerabilities: string[] = [];
  
  if (!migration.is_migrant) return vulnerabilities;
  
  if (migration.is_recent_migrant) vulnerabilities.push('recent_migrant');
  if (migration.is_forced_migrant) vulnerabilities.push('forced_migrant');
  if (age < 18) vulnerabilities.push('child_migrant');
  
  return vulnerabilities;
};

/**
 * Build complete vulnerability list
 */
const buildVulnerabilities = (
  context: ResidentClassificationContext,
  age: number,
  sectoral: SectoralInformation,
  migration: MigrationClassification
): string[] => {
  const vulnerabilities: string[] = [];
  
  // Add age vulnerabilities
  vulnerabilities.push(...assessAgeVulnerabilities(age));
  
  // Add gender vulnerabilities
  vulnerabilities.push(...assessGenderVulnerabilities(context, age));
  
  // Add education vulnerabilities
  if (!context.education_attainment || context.education_attainment === 'no_education') {
    vulnerabilities.push('no_education');
  }
  
  // Add employment vulnerabilities
  if (sectoral.is_unemployed) vulnerabilities.push('unemployed');
  
  // Add migration vulnerabilities
  vulnerabilities.push(...assessMigrationVulnerabilities(migration, age));
  
  // Add sectoral vulnerabilities
  if (sectoral.is_out_of_school_children) vulnerabilities.push('out_of_school_children');
  if (sectoral.is_out_of_school_youth) vulnerabilities.push('out_of_school_youth');
  if (sectoral.is_indigenous_people) vulnerabilities.push('indigenous');
  
  return vulnerabilities;
};

export const classifyResident = (context: ResidentClassificationContext): ResidentClassification => {
  const age = context.birthdate ? calculateAge(context.birthdate) : 0;
  
  const sectoral = calculateSectoralInformation(context, age);
  const migrantStatus = isMigrant(context);
  const migration = buildMigrationClassification(context, migrantStatus);
  const vulnerabilities = buildVulnerabilities(context, age, sectoral, migration);
  
  return {
    sectoral,
    migration,
    vulnerabilities,
  };
};

/**
 * Calculate statistics for a group of residents
 */
export interface ResidentStatistics {
  total: number;
  sectoral: {
    employed: number;
    unemployed: number;
    senior_citizens: number;
    out_of_school_children: number;
    out_of_school_youth: number;
    indigenous: number;
  };
  migration: {
    total_migrants: number;
    recent_migrants: number;
    economic_migrants: number;
    education_migrants: number;
    forced_migrants: number;
  };
  vulnerabilities: Record<string, number>;
}

export const calculateResidentStatistics = (
  residents: ResidentClassificationContext[]
): ResidentStatistics => {
  const stats: ResidentStatistics = {
    total: residents.length,
    sectoral: {
      employed: 0,
      unemployed: 0,
      senior_citizens: 0,
      out_of_school_children: 0,
      out_of_school_youth: 0,
      indigenous: 0,
    },
    migration: {
      total_migrants: 0,
      recent_migrants: 0,
      economic_migrants: 0,
      education_migrants: 0,
      forced_migrants: 0,
    },
    vulnerabilities: {},
  };
  
  residents.forEach(resident => {
    const classification = classifyResident(resident);
    
    // Sectoral stats
    if (classification.sectoral.is_labor_force_employed) stats.sectoral.employed++;
    if (classification.sectoral.is_unemployed) stats.sectoral.unemployed++;
    if (classification.sectoral.is_senior_citizen) stats.sectoral.senior_citizens++;
    if (classification.sectoral.is_out_of_school_children) stats.sectoral.out_of_school_children++;
    if (classification.sectoral.is_out_of_school_youth) stats.sectoral.out_of_school_youth++;
    if (classification.sectoral.is_indigenous_people) stats.sectoral.indigenous++;
    
    // Migration stats
    if (classification.migration.is_migrant) stats.migration.total_migrants++;
    if (classification.migration.is_recent_migrant) stats.migration.recent_migrants++;
    if (classification.migration.is_economic_migrant) stats.migration.economic_migrants++;
    if (classification.migration.is_education_migrant) stats.migration.education_migrants++;
    if (classification.migration.is_forced_migrant) stats.migration.forced_migrants++;
    
    // Vulnerability stats
    classification.vulnerabilities.forEach(vulnerability => {
      stats.vulnerabilities[vulnerability] = (stats.vulnerabilities[vulnerability] || 0) + 1;
    });
  });
  
  return stats;
};