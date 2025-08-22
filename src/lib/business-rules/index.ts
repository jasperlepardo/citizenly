/**
 * Business Rules Library
 * Centralized business logic and domain rules
 */

// Explicit exports to prevent circular dependencies
export {
  calculateAge,
  isOutOfSchoolChildren,
  isOutOfSchoolYouth,
  isSeniorCitizen,
  isEmployed,
  isUnemployed,
  isIndigenousPeople,
  updateSectoralInformation,
  getActiveSectoralClassifications,
  EMPLOYED_STATUSES,
  UNEMPLOYED_STATUSES,
  INDIGENOUS_ETHNICITIES,
} from './sectoralClassification';