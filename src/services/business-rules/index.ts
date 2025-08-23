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
} from './sectoral-classification';

// Resident form validation rules
export {
  isValidMobileNumber,
  isValidPhilSysCardNumber,
  isValidBirthdate,
  shouldShowReligionOthersField,
  shouldShowCivilStatusOthersField,
  shouldShowMigrationFields,
  shouldShowPreviousAddressFields,
  shouldShowOccupationFields,
  shouldShowUnemploymentFields,
  shouldShowGraduationStatus,
  shouldShowSectoralDetails,
  calculateFormCompletionPercentage,
  getFieldDependencies,
  isMinor,
} from './resident-form-rules';