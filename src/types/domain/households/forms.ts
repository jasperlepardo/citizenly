/**
 * Household Form Types
 * 
 * @fileoverview Form-specific interfaces for household data entry and editing.
 * These types handle the mapping between form fields and database schema.
 */

/**
 * Demographics information form data
 * Contains household demographic statistics
 */
export interface DemographicsInformationFormData {
  noOfFamilies: number;
  noOfHouseholdMembers: number;
  noOfMigrants: number;
}

/**
 * Address information form data
 * Contains geographic location and address details
 */
export interface AddressInformationFormData {
  houseNumber: string;
  streetId: string; // UUID for street
  subdivisionId: string; // UUID for subdivision
  barangayCode: string;
  cityMunicipalityCode: string;
  provinceCode: string;
  regionCode: string;
}

/**
 * Income and head information form data
 * Contains household financial and leadership information
 */
export interface IncomeAndHeadInformationFormData {
  monthlyIncome: number;
  householdHeadId: string;
  householdHeadPosition: string;
}

/**
 * Household type information form data
 * Contains household classification and tenure details
 */
export interface HouseholdTypeInformationFormData {
  householdType: string;
  tenureStatus: string;
  tenureOthersSpecify: string;
  householdUnit: string;
  householdName: string;
}