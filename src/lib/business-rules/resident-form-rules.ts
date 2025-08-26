/**
 * Business rules for resident form conditional fields and logic
 */

// Religion-related business rules
export const shouldShowReligionOthersField = (religion: string): boolean => {
  return religion === 'others';
};

// Civil status-related business rules
export const shouldShowCivilStatusOthersField = (civilStatus: string): boolean => {
  return civilStatus === 'others';
};

// Migration-related business rules
export const shouldShowMigrationFields = (isMigrant: boolean): boolean => {
  return Boolean(isMigrant);
};

export const shouldShowPreviousAddressFields = (hasPreviousAddress: boolean): boolean => {
  return Boolean(hasPreviousAddress);
};

// Employment-related business rules
export const shouldShowOccupationFields = (employmentStatus: string): boolean => {
  return ['employed', 'self_employed'].includes(employmentStatus);
};

export const shouldShowUnemploymentFields = (employmentStatus: string): boolean => {
  return employmentStatus === 'unemployed';
};

// Education-related business rules
export const shouldShowGraduationStatus = (educationAttainment: string): boolean => {
  const levelsWithGraduation = [
    'elementary_undergraduate',
    'high_school_undergraduate',
    'post_secondary_undergraduate',
    'college_undergraduate',
  ];
  return levelsWithGraduation.includes(educationAttainment);
};

// Age-related business rules
export const calculateAge = (birthdate: string): number => {
  if (!birthdate) return 0;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export const isSeniorCitizen = (birthdate: string): boolean => {
  return calculateAge(birthdate) >= 60;
};

export const isMinor = (birthdate: string): boolean => {
  return calculateAge(birthdate) < 18;
};

// Sectoral information business rules
export const shouldShowSectoralDetails = (sectoralType: string): boolean => {
  const sectoralTypesWithDetails = [
    'isPersonWithDisability',
    'isIndigenousPeople',
    'isOverseasFilipino',
  ];
  return sectoralTypesWithDetails.some(type => sectoralType === type);
};

// Form completion business rules
export const calculateFormCompletionPercentage = (formData: Record<string, any>): number => {
  const requiredFields = ['firstName', 'lastName', 'sex', 'birthdate', 'civilStatus'];

  const optionalFields = ['middleName', 'citizenship', 'mobileNumber', 'email'];

  const allFields = [...requiredFields, ...optionalFields];
  const completedFields = allFields.filter(field => {
    const value = formData[field];
    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((completedFields.length / allFields.length) * 100);
};

// Validation business rules
export const isValidPhilSysCardNumber = (cardNumber: string): boolean => {
  // PhilSys card numbers should be 12 digits
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.length === 12;
};

export const isValidMobileNumber = (mobileNumber: string): boolean => {
  // Philippine mobile numbers: 09XXXXXXXXX or +639XXXXXXXXX
  const cleaned = mobileNumber.replace(/\D/g, '');

  if (cleaned.startsWith('639')) {
    return cleaned.length === 12;
  }

  if (cleaned.startsWith('09')) {
    return cleaned.length === 11;
  }

  return false;
};

// Date validation business rules
export const isValidBirthdate = (birthdate: string): boolean => {
  if (!birthdate) return false;

  const birth = new Date(birthdate);
  const today = new Date();
  const maxAge = 150;

  // Must be a valid date
  if (isNaN(birth.getTime())) return false;

  // Cannot be in the future
  if (birth > today) return false;

  // Cannot be more than 150 years ago
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - maxAge);
  if (birth < minDate) return false;

  return true;
};

// Field dependency business rules
export const getFieldDependencies = (fieldName: string): string[] => {
  const dependencies: Record<string, string[]> = {
    civilStatusOthersSpecify: ['civilStatus'],
    religionOthersSpecify: ['religion'],
    occupationTitle: ['employmentStatus'],
    psocCode: ['employmentStatus'],
    isGraduate: ['educationAttainment'],
    // Migration fields depend on isMigrant
    previousBarangayCode: ['isMigrant'],
    previousCityMunicipalityCode: ['isMigrant'],
    previousProvinceCode: ['isMigrant'],
    previousRegionCode: ['isMigrant'],
    lengthOfStayPreviousMonths: ['isMigrant'],
    reasonForLeaving: ['isMigrant'],
    dateOfTransfer: ['isMigrant'],
    reasonForTransferring: ['isMigrant'],
    durationOfStayCurrentMonths: ['isMigrant'],
    isIntendingToReturn: ['isMigrant'],
  };

  return dependencies[fieldName] || [];
};
