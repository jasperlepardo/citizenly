/**
 * Unit tests for resident mapper utilities
 * Tests all critical mapping functions for data consistency
 */

import type {
  ResidentFormData,
  ResidentApiData,
  ResidentWithRelations,
  HouseholdData,
  HouseholdHead,
  HouseholdOption,
} from '@/types';

import {
  mapFormToApi,
  mapDatabaseToForm,
  formatHouseholdOption,
  formatPsocOption,
  formatPsgcOption,
  calculateAge,
  formatFullName,
  formatEnumValue,
  formatBoolean,
  parseFullName,
  getFormToSchemaFieldMapping,
  getSchemaToFormFieldMapping,
} from '../resident-mapper';

describe('Resident Mapper Utilities', () => {
  describe('mapFormToApi', () => {
    it('should map form data to API format correctly', () => {
      const formData: ResidentFormData = {
        first_name: 'Juan',
        middle_name: 'Dela',
        last_name: 'Cruz',
        extension_name: 'Jr.',
        sex: 'male',
        civil_status: 'single',
        citizenship: 'filipino',
        birthdate: '1990-01-01',
        birth_place_code: '137401',
        philsys_card_number: '1234-5678-9012',
        education_attainment: 'college',
        is_graduate: true,
        employment_status: 'employed',
        occupation_code: '1111',
        ethnicity: 'tagalog',
        email: 'juan.cruz@email.com',
        telephone_number: '02-123-4567',
        mobile_number: '09123456789',
        household_code: 'HH001',
        blood_type: 'A+',
        complexion: 'medium',
        height: 170,
        weight: 65,
        religion: 'roman_catholic',
        religion_others_specify: '',
        is_voter: true,
        is_resident_voter: true,
        last_voted_date: '2022-05-09',
        mother_maiden_first: 'Maria',
        mother_maiden_middle: 'Santos',
        mother_maiden_last: 'Garcia',
      };

      const result = mapFormToApi(formData);

      expect(result).toEqual({
        first_name: 'Juan',
        middle_name: 'Dela',
        last_name: 'Cruz',
        extension_name: 'Jr.',
        sex: 'male',
        civil_status: 'single',
        citizenship: 'filipino',
        birthdate: '1990-01-01',
        birth_place_code: '137401',
        philsys_card_number: '1234-5678-9012',
        education_attainment: 'college',
        is_graduate: true,
        employment_status: 'employed',
        occupation_code: '1111', // psocCode -> occupationCode
        ethnicity: 'tagalog',
        email: 'juan.cruz@email.com',
        telephone_number: '02-123-4567', // phoneNumber -> telephone_number
        mobile_number: '09123456789',
        household_code: 'HH001',
        blood_type: 'A+',
        complexion: 'medium',
        height: 170,
        weight: 65,
        religion: 'roman_catholic',
        religionOthersSpecify: undefined,
        is_voter: true,
        is_resident_voter: true,
        last_voted_date: '2022-05-09',
        mother_maiden_first: 'Maria',
        mother_maiden_middle: 'Santos',
        mother_maiden_last: 'Garcia',
      });
    });

    it('should handle empty/undefined values correctly', () => {
      const formData: ResidentFormData = {
        first_name: 'Juan',
        middle_name: '',
        last_name: 'Cruz',
        extension_name: '',
        sex: 'male',
        civil_status: 'single',
        citizenship: 'filipino',
        birthdate: '1990-01-01',
        birth_place_code: '',
        philsys_card_number: '',
        education_attainment: '',
        is_graduate: false,
        employment_status: '',
        occupation_code: '',
        ethnicity: '',
        email: '',
        telephone_number: '',
        mobile_number: '',
        household_code: '',
        blood_type: '' as any,
        complexion: '',
        height: 0,
        weight: 0,
        religion: '',
        religion_others_specify: '',
        is_voter: undefined,
        is_resident_voter: undefined,
        last_voted_date: '',
        mother_maiden_first: '',
        mother_maiden_middle: '',
        mother_maiden_last: '',
      };

      const result = mapFormToApi(formData);

      expect(result.middle_name).toBeUndefined();
      expect(result.civil_status).toBeUndefined();
      expect(result.email).toBeUndefined();
      expect(result.is_voter).toBeUndefined();
      expect(result.is_resident_voter).toBeUndefined();
    });
  });

  describe('formatHouseholdOption', () => {
    it('should format household data correctly with head resident', () => {
      const household: HouseholdData = {
        code: 'HH001',
        name: 'Household 1',
        house_number: '123',
        barangay_code: '137401',
        household_head_id: 'head-123',
        geo_streets: [{ id: 'street-1', name: 'Main Street' }],
        geo_subdivisions: [{ id: 'sub-1', name: 'Subdivision A', type: 'residential' }],
      };

      const headResident: HouseholdHead = {
        id: 'head-123',
        first_name: 'Juan',
        middle_name: 'Dela',
        last_name: 'Cruz',
      };

      const result = formatHouseholdOption(household, headResident);

      expect(result).toEqual({
        value: 'HH001',
        label: 'Household #HH001',
        description: 'Juan Dela Cruz - 123, Main Street, Subdivision A',
        code: 'HH001',
        head_name: 'Juan Dela Cruz',
        address: '123, Main Street, Subdivision A',
      });
    });

    it('should handle household without head resident', () => {
      const household: HouseholdData = {
        code: 'HH002',
        barangay_code: '137401',
        geo_streets: [],
        geo_subdivisions: [],
      };

      const result = formatHouseholdOption(household);

      expect(result).toEqual({
        value: 'HH002',
        label: 'Household #HH002',
        description: 'No head assigned - No address',
        code: 'HH002',
        head_name: 'No head assigned',
        address: 'No address',
      });
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      // Mock current date as 2024-01-01 for consistent testing
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      expect(calculateAge('1990-01-01')).toBe(34);
      expect(calculateAge('2000-06-15')).toBe(23);
      expect(calculateAge('2024-01-01')).toBe(0);
      expect(calculateAge('2024-06-01')).toBe(-1); // Future date

      jest.restoreAllMocks();
    });

    it('should return 0 for empty birthdate', () => {
      expect(calculateAge('')).toBe(0);
    });
  });

  describe('formatFullName', () => {
    it('should format full name correctly', () => {
      expect(
        formatFullName({
          first_name: 'Juan',
          middle_name: 'Dela',
          last_name: 'Cruz',
          extension_name: 'Jr.',
        })
      ).toBe('Juan Dela Cruz Jr.');

      expect(
        formatFullName({
          firstName: 'Maria',
          lastName: 'Santos',
        })
      ).toBe('Maria Santos');

      expect(
        formatFullName({
          first_name: 'Pedro',
          last_name: 'Garcia',
        })
      ).toBe('Pedro Garcia');
    });

    it('should handle empty values', () => {
      expect(
        formatFullName({
          first_name: '',
          middle_name: '',
          last_name: '',
        })
      ).toBe('');

      expect(
        formatFullName({
          first_name: 'Juan',
          middle_name: '',
          last_name: 'Cruz',
        })
      ).toBe('Juan Cruz');
    });
  });

  describe('formatEnumValue', () => {
    it('should format enum values correctly', () => {
      expect(formatEnumValue('not_in_labor_force')).toBe('Not In Labor Force');
      expect(formatEnumValue('roman_catholic')).toBe('Roman Catholic');
      expect(formatEnumValue('single')).toBe('Single');
    });

    it('should return N/A for empty values', () => {
      expect(formatEnumValue('')).toBe('N/A');
      expect(formatEnumValue(undefined)).toBe('N/A');
    });
  });

  describe('formatBoolean', () => {
    it('should format boolean values correctly', () => {
      expect(formatBoolean(true)).toBe('Yes');
      expect(formatBoolean(false)).toBe('No');
    });

    it('should return N/A for undefined values', () => {
      expect(formatBoolean(undefined)).toBe('N/A');
      expect(formatBoolean(null as any)).toBe('N/A');
    });
  });

  describe('parseFullName', () => {
    it('should parse single name', () => {
      expect(parseFullName('Juan')).toEqual({
        first_name: 'Juan',
        middle_name: '',
        lastName: '',
      });
    });

    it('should parse two names', () => {
      expect(parseFullName('Juan Cruz')).toEqual({
        first_name: 'Juan',
        middle_name: '',
        last_name: 'Cruz',
      });
    });

    it('should parse three names', () => {
      expect(parseFullName('Juan Dela Cruz')).toEqual({
        first_name: 'Juan',
        middle_name: 'Dela',
        last_name: 'Cruz',
      });
    });

    it('should parse four or more names', () => {
      expect(parseFullName('Juan Carlos Dela Cruz')).toEqual({
        first_name: 'Juan',
        middleName: 'Carlos Dela',
        last_name: 'Cruz',
      });

      expect(parseFullName('Juan Carlos Maria Dela Cruz')).toEqual({
        first_name: 'Juan',
        middleName: 'Carlos Maria Dela',
        last_name: 'Cruz',
      });
    });
  });

  describe('field mapping functions', () => {
    it('should provide correct form to schema mapping', () => {
      const mapping = getFormToSchemaFieldMapping();

      expect(mapping.firstName).toBe('first_name');
      expect(mapping.lastName).toBe('last_name');
      expect(mapping.psocCode).toBe('occupation_code');
      expect(mapping.phoneNumber).toBe('telephone_number');
    });

    it('should provide correct schema to form mapping', () => {
      const mapping = getSchemaToFormFieldMapping();

      expect(mapping.first_name).toBe('firstName');
      expect(mapping.last_name).toBe('lastName');
      expect(mapping.occupation_code).toBe('psocCode');
      expect(mapping.telephone_number).toBe('phoneNumber');
    });

    it('should be inverse mappings', () => {
      const formToSchema = getFormToSchemaFieldMapping();
      const schemaToForm = getSchemaToFormFieldMapping();

      // Test that mappings are inverses of each other
      Object.entries(formToSchema).forEach(([formField, schemaField]) => {
        expect(schemaToForm[schemaField]).toBe(formField);
      });
    });
  });

  describe('formatPsocOption', () => {
    it('should format PSOC data correctly', () => {
      const psocData = {
        code: '1111',
        title: 'Software Engineer',
        hierarchy: 'Information Technology > Software Development',
        level: 'occupation',
      };

      const result = formatPsocOption(psocData);

      expect(result).toEqual({
        value: '1111',
        label: 'Software Engineer',
        description: 'Information Technology > Software Development',
        level_type: 'occupation',
        occupation_code: '1111',
      });
    });
  });

  describe('formatPsgcOption', () => {
    it('should format PSGC data correctly', () => {
      const psgcData = {
        code: '137401',
        name: 'Manila',
        full_address: 'Manila, Metro Manila, Philippines',
        level: 'city',
      };

      const result = formatPsgcOption(psgcData);

      expect(result).toEqual({
        value: '137401',
        label: 'Manila',
        description: 'Manila, Metro Manila, Philippines',
        level: 'city',
        full_hierarchy: 'Manila, Metro Manila, Philippines',
        code: '137401',
      });
    });

    it('should handle alternative field names', () => {
      const psgcData = {
        city_code: '137401',
        city_name: 'Manila',
        full_hierarchy: 'Manila, Metro Manila',
        level: 'city',
      };

      const result = formatPsgcOption(psgcData);

      expect(result.value).toBe('137401');
      expect(result.label).toBe('Manila');
      expect(result.code).toBe('137401');
    });
  });
});
