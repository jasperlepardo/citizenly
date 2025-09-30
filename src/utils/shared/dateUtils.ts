/**
 * Date Utilities
 * Consolidated date manipulation and formatting utilities aligned with database schema
 */

/**
 * Calculate age from birthdate string
 * Consolidated implementation replacing 6+ duplicates across codebase
 */
export function calculateAge(birthdate: string | Date): number {
  if (!birthdate) return 0;

  try {
    const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
    const today = new Date();

    // Validate date
    if (isNaN(birth.getTime())) return 0;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return Math.max(0, age); // Ensure non-negative age
  } catch {
    return 0;
  }
}

/**
 * Calculate age with display formatting (returns string for invalid dates)
 * Used in UI components that need to display "-" for missing data
 */
export function calculateAgeForDisplay(birthdate: string | Date): string | number {
  if (!birthdate) return '-';

  const age = calculateAge(birthdate);
  return age === 0 && birthdate ? '-' : age;
}

/**
 * Determine life stage based on age
 */
export function determineLifeStage(birthdate: string | Date): string {
  const age = calculateAge(birthdate);

  if (age < 1) return 'infant';
  if (age < 5) return 'toddler';
  if (age < 13) return 'child';
  if (age < 20) return 'teenager';
  if (age < 60) return 'adult';
  return 'senior';
}

/**
 * Check if person is minor (under 18)
 */
export function isMinor(birthdate: string | Date): boolean {
  return calculateAge(birthdate) < 18;
}

/**
 * Check if person is senior citizen (60 or older in Philippines)
 */
export function isSeniorCitizen(birthdate: string | Date): boolean {
  return calculateAge(birthdate) >= 60;
}

/**
 * Check if person is of voting age (18 or older in Philippines)
 */
export function isVotingAge(birthdate: string | Date): boolean {
  return calculateAge(birthdate) >= 18;
}

/**
 * Format date for Philippine locale
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('en-PH', options).format(dateObj);
  } catch {
    return '-';
  }
}

/**
 * Format birthdate for display with age
 */
export function formatBirthdateWithAge(birthdate: string | Date): string {
  if (!birthdate) return '-';

  const formattedDate = formatDate(birthdate);
  const age = calculateAge(birthdate);

  if (formattedDate === '-') return '-';

  return `${formattedDate} (${age} years old)`;
}

/**
 * Format birthdate with leading zeros and age in compact format
 * Example: "January 01, 2001 (Age 23)"
 */
export function formatBirthdateWithAgeCompact(birthdate: string | Date): string {
  if (!birthdate) return '-';

  try {
    const dateObj = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
    
    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const age = calculateAge(birthdate);
    
    // Format with leading zeros for day
    const formattedDate = new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(dateObj);

    return `${formattedDate} (Age ${age})`;
  } catch {
    return '-';
  }
}

/**
 * Check if date is valid
 */
export function isValidDate(date: string | Date): boolean {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Get age group for statistical purposes
 */
export function getAgeGroup(birthdate: string | Date): string {
  const age = calculateAge(birthdate);
  
  // Data-driven approach to reduce cognitive complexity
  const ageGroups: Array<[number, string]> = [
    [5, '0-4'],
    [10, '5-9'],
    [15, '10-14'],
    [20, '15-19'],
    [25, '20-24'],
    [30, '25-29'],
    [35, '30-34'],
    [40, '35-39'],
    [45, '40-44'],
    [50, '45-49'],
    [55, '50-54'],
    [60, '55-59'],
    [65, '60-64'],
    [70, '65-69'],
    [75, '70-74'],
    [80, '75-79'],
  ];
  
  for (const [maxAge, group] of ageGroups) {
    if (age < maxAge) return group;
  }
  
  return '80+';
}

/**
 * Calculate years between two dates
 */
export function yearsBetween(startDate: string | Date, endDate: string | Date): number {
  if (!startDate || !endDate) return 0;

  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

    return diffYears;
  } catch {
    return 0;
  }
}

/**
 * Format graduate status for display
 * Converts "yes"/"no" to readable text
 */
export function formatGraduateStatus(isGraduate: string | boolean): string {
  if (!isGraduate) return '-';
  
  // Handle boolean values
  if (typeof isGraduate === 'boolean') {
    return isGraduate ? 'Graduate' : 'Not Graduate';
  }
  
  // Handle string values
  const status = isGraduate.toLowerCase().trim();
  switch (status) {
    case 'yes':
    case 'true':
    case '1':
      return 'Graduate';
    case 'no':
    case 'false':
    case '0':
      return 'Not Graduate';
    default:
      return '-';
  }
}
