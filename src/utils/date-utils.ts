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
  
  if (age < 5) return '0-4';
  if (age < 10) return '5-9';
  if (age < 15) return '10-14';
  if (age < 20) return '15-19';
  if (age < 25) return '20-24';
  if (age < 30) return '25-29';
  if (age < 35) return '30-34';
  if (age < 40) return '35-39';
  if (age < 45) return '40-44';
  if (age < 50) return '45-49';
  if (age < 55) return '50-54';
  if (age < 60) return '55-59';
  if (age < 65) return '60-64';
  if (age < 70) return '65-69';
  if (age < 75) return '70-74';
  if (age < 80) return '75-79';
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