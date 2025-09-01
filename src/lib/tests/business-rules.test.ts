/**
 * @jest-environment node
 */

import { calculateAge } from '@/utils/dates/dateUtils';

import {
  isOutOfSchoolChildren,
  isOutOfSchoolYouth,
  isSeniorCitizen,
  isEmployed,
  isUnemployed,
  isIndigenousPeople,
  EMPLOYED_STATUSES,
  UNEMPLOYED_STATUSES,
  INDIGENOUS_ETHNICITIES,
} from '../business-rules/sectoral-classification';

describe('Business Rules - Sectoral Classification', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly for adults', () => {
      const birthdate = '1990-01-01';
      const today = new Date();
      const expectedAge = today.getFullYear() - 1990;

      const age = calculateAge(birthdate);

      // Account for whether birthday has passed this year
      expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
      expect(age).toBeLessThanOrEqual(expectedAge);
    });

    it('should calculate age correctly when birthday has not passed this year', () => {
      const today = new Date();
      const futureMonth = today.getMonth() + 1;
      const futureDay = today.getDate() + 1;

      // Create a birthdate in the future this year (next month/day)
      const birthYear = today.getFullYear() - 25;
      const birthdate = `${birthYear}-${String(futureMonth).padStart(2, '0')}-${String(futureDay).padStart(2, '0')}`;

      const age = calculateAge(birthdate);
      expect(age).toBe(24); // Should be 24, not 25, if birthday hasn't passed
    });

    it('should calculate age correctly when birthday has passed this year', () => {
      const today = new Date();
      const pastMonth = today.getMonth() - 1 || 12;
      const pastDay = today.getDate();

      const birthYear = today.getFullYear() - 25;
      const birthdate = `${birthYear}-${String(pastMonth).padStart(2, '0')}-${String(pastDay).padStart(2, '0')}`;

      const age = calculateAge(birthdate);
      expect(age).toBe(25); // Should be 25 if birthday has passed
    });

    it('should handle edge case of birthday today', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const birthdate = `${birthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const age = calculateAge(birthdate);
      expect(age).toBe(25);
    });

    it('should return 0 for empty birthdate', () => {
      expect(calculateAge('')).toBe(0);
    });

    it('should handle newborns correctly', () => {
      const today = new Date();
      const birthdate = today.toISOString().split('T')[0]; // Today's date

      const age = calculateAge(birthdate);
      expect(age).toBe(0);
    });
  });

  describe('isOutOfSchoolChildren', () => {
    it('should identify out-of-school children correctly', () => {
      expect(isOutOfSchoolChildren(8, 'no_formal_education')).toBe(true);
      expect(isOutOfSchoolChildren(12, undefined)).toBe(true);
      expect(isOutOfSchoolChildren(16, 'no_formal_education')).toBe(true);
    });

    it('should not classify children currently in school', () => {
      expect(isOutOfSchoolChildren(8, 'elementary')).toBe(false);
      expect(isOutOfSchoolChildren(12, 'high_school')).toBe(false);
      expect(isOutOfSchoolChildren(16, 'college')).toBe(false);
    });

    it('should not classify children outside age range', () => {
      expect(isOutOfSchoolChildren(4, 'no_formal_education')).toBe(false); // Too young
      expect(isOutOfSchoolChildren(18, 'no_formal_education')).toBe(false); // Too old
    });

    it('should handle edge cases', () => {
      expect(isOutOfSchoolChildren(5, 'no_formal_education')).toBe(true); // Minimum age
      expect(isOutOfSchoolChildren(17, 'no_formal_education')).toBe(true); // Maximum age
    });
  });

  describe('isOutOfSchoolYouth', () => {
    it('should identify out-of-school youth correctly', () => {
      expect(isOutOfSchoolYouth(19, 'high_school', 'unemployed')).toBe(true);
      expect(isOutOfSchoolYouth(24, undefined, 'unemployed')).toBe(true);
      expect(isOutOfSchoolYouth(22, 'no_formal_education', undefined)).toBe(true);
    });

    it('should not classify youth currently in school', () => {
      expect(isOutOfSchoolYouth(19, 'college', 'unemployed')).toBe(false);
      expect(isOutOfSchoolYouth(22, 'post_graduate', 'unemployed')).toBe(false);
    });

    it('should not classify employed youth in school', () => {
      expect(isOutOfSchoolYouth(19, 'college', 'employed')).toBe(false);
    });

    it('should not classify youth outside age range', () => {
      expect(isOutOfSchoolYouth(17, 'high_school', 'unemployed')).toBe(false); // Too young
      expect(isOutOfSchoolYouth(31, 'high_school', 'unemployed')).toBe(false); // Too old
    });

    it('should handle edge cases', () => {
      expect(isOutOfSchoolYouth(18, 'high_school', 'unemployed')).toBe(true); // Minimum age
      expect(isOutOfSchoolYouth(30, 'high_school', 'unemployed')).toBe(true); // Maximum age
    });
  });

  describe('isSeniorCitizen', () => {
    it('should identify senior citizens correctly', () => {
      expect(isSeniorCitizen(60)).toBe(true);
      expect(isSeniorCitizen(65)).toBe(true);
      expect(isSeniorCitizen(80)).toBe(true);
      expect(isSeniorCitizen(100)).toBe(true);
    });

    it('should not classify non-seniors', () => {
      expect(isSeniorCitizen(59)).toBe(false);
      expect(isSeniorCitizen(45)).toBe(false);
      expect(isSeniorCitizen(30)).toBe(false);
      expect(isSeniorCitizen(0)).toBe(false);
    });
  });

  describe('isEmployed', () => {
    it('should identify employed persons correctly', () => {
      expect(isEmployed('employed')).toBe(true);
      expect(isEmployed('self_employed')).toBe(true);
    });

    it('should not classify unemployed persons as employed', () => {
      expect(isEmployed('unemployed')).toBe(false);
      expect(isEmployed('underemployed')).toBe(false);
      expect(isEmployed('looking_for_work')).toBe(false);
      expect(isEmployed('student')).toBe(false);
      expect(isEmployed('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isEmployed(undefined as any)).toBe(false);
      expect(isEmployed('EMPLOYED')).toBe(false); // Case sensitive
    });
  });

  describe('isUnemployed', () => {
    it('should identify unemployed persons correctly', () => {
      expect(isUnemployed('unemployed')).toBe(true);
      expect(isUnemployed('underemployed')).toBe(true);
      expect(isUnemployed('looking_for_work')).toBe(true);
    });

    it('should not classify employed persons as unemployed', () => {
      expect(isUnemployed('employed')).toBe(false);
      expect(isUnemployed('self_employed')).toBe(false);
      expect(isUnemployed('student')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isUnemployed('')).toBe(false);
      expect(isUnemployed(undefined as any)).toBe(false);
    });
  });

  describe('isIndigenousPeople', () => {
    it('should identify indigenous ethnicities correctly', () => {
      expect(isIndigenousPeople('indigenous_group')).toBe(true);
      expect(isIndigenousPeople('maranao')).toBe(true);
      expect(isIndigenousPeople('maguindanao')).toBe(true);
      expect(isIndigenousPeople('tausug')).toBe(true);
      expect(isIndigenousPeople('aeta')).toBe(true);
      expect(isIndigenousPeople('igorot')).toBe(true);
      expect(isIndigenousPeople('ifugao')).toBe(true);
    });

    it('should not classify non-indigenous ethnicities', () => {
      expect(isIndigenousPeople('filipino')).toBe(false);
      expect(isIndigenousPeople('chinese')).toBe(false);
      expect(isIndigenousPeople('spanish')).toBe(false);
      expect(isIndigenousPeople('american')).toBe(false);
      expect(isIndigenousPeople('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isIndigenousPeople(undefined as any)).toBe(false);
      expect(isIndigenousPeople('MARANAO')).toBe(false); // Case sensitive
    });
  });

  describe('Constants validation', () => {
    it('should have valid EMPLOYED_STATUSES', () => {
      expect(EMPLOYED_STATUSES).toContain('employed');
      expect(EMPLOYED_STATUSES).toContain('self_employed');
      expect(EMPLOYED_STATUSES).toHaveLength(2);
    });

    it('should have valid UNEMPLOYED_STATUSES', () => {
      expect(UNEMPLOYED_STATUSES).toContain('unemployed');
      expect(UNEMPLOYED_STATUSES).toContain('underemployed');
      expect(UNEMPLOYED_STATUSES).toContain('looking_for_work');
      expect(UNEMPLOYED_STATUSES).toHaveLength(3);
    });

    it('should have no overlap between employed and unemployed statuses', () => {
      const employedSet = new Set(EMPLOYED_STATUSES);
      const unemployedSet = new Set(UNEMPLOYED_STATUSES);

      const intersection = new Set(Array.from(employedSet).filter(x => unemployedSet.has(x)));
      expect(intersection.size).toBe(0);
    });

    it('should have valid INDIGENOUS_ETHNICITIES', () => {
      expect(INDIGENOUS_ETHNICITIES).toContain('indigenous_group');
      expect(INDIGENOUS_ETHNICITIES).toContain('maranao');
      expect(INDIGENOUS_ETHNICITIES).toContain('maguindanao');
      expect(INDIGENOUS_ETHNICITIES).toContain('tausug');
      expect(INDIGENOUS_ETHNICITIES.length).toBeGreaterThan(10);

      // Should contain various indigenous groups
      expect(INDIGENOUS_ETHNICITIES).toContain('aeta');
      expect(INDIGENOUS_ETHNICITIES).toContain('igorot');
      expect(INDIGENOUS_ETHNICITIES).toContain('ifugao');
    });
  });

  describe('Integration tests', () => {
    it('should correctly classify a typical resident profile', () => {
      const birthdate = '1995-06-15'; // ~28 years old
      const age = calculateAge(birthdate);

      expect(isOutOfSchoolChildren(age)).toBe(false); // Too old
      expect(isOutOfSchoolYouth(age, 'college', 'employed')).toBe(false); // In school and employed
      expect(isSeniorCitizen(age)).toBe(false); // Too young
      expect(isEmployed('employed')).toBe(true);
      expect(isUnemployed('employed')).toBe(false);
    });

    it('should correctly classify a senior citizen profile', () => {
      const birthdate = '1950-01-01'; // ~73 years old
      const age = calculateAge(birthdate);

      expect(isSeniorCitizen(age)).toBe(true);
      expect(isOutOfSchoolChildren(age)).toBe(false);
      expect(isOutOfSchoolYouth(age)).toBe(false);
    });

    it('should correctly classify an indigenous youth profile', () => {
      const birthdate = '2005-03-15'; // ~18 years old
      const age = calculateAge(birthdate);

      expect(isOutOfSchoolChildren(age)).toBe(false); // Too old
      expect(isOutOfSchoolYouth(age, 'high_school', 'unemployed')).toBe(true);
      expect(isIndigenousPeople('maranao')).toBe(true);
      expect(isSeniorCitizen(age)).toBe(false);
    });

    it('should handle complex employment status scenarios', () => {
      // Underemployed person should be classified as unemployed but not employed
      expect(isEmployed('underemployed')).toBe(false);
      expect(isUnemployed('underemployed')).toBe(true);

      // Self-employed person should be classified as employed but not unemployed
      expect(isEmployed('self_employed')).toBe(true);
      expect(isUnemployed('self_employed')).toBe(false);
    });
  });
});
