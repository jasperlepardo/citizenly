/**
 * Resident Detail Types
 * 
 * @description Type definitions for resident detail view components and comprehensive resident data management
 * @author Citizenly Development Team
 * @version 1.0.0
 */

/**
 * Complete resident record interface for detail views and comprehensive data management
 * 
 * @description Represents a comprehensive resident profile including personal information,
 * geographic location, sectoral demographics, household relationships, and migration data.
 * This interface is used throughout the system for resident detail views, forms, and API responses.
 * 
 * @interface Resident
 * 
 * @example Basic resident creation
 * ```typescript
 * const newResident: Resident = {
 *   id: '12345',
 *   first_name: 'Juan',
 *   last_name: 'Dela Cruz',
 *   birthdate: '1990-01-15T00:00:00Z',
 *   sex: 'male',
 *   barangay_code: '042114014',
 *   city_municipality_code: '042114000',
 *   region_code: '04',
 *   created_at: '2024-01-15T10:30:00Z'
 * };
 * ```
 * 
 * @example With household and sectoral information
 * ```typescript
 * const residentWithDetails: Resident = {
 *   // ... basic fields
 *   household: {
 *     code: '042114014-2024-000001',
 *     house_number: '123',
 *     street_id: 'main-street',
 *     barangay_code: '042114014'
 *   },
 *   sectoral_info: {
 *     is_labor_force: true,
 *     is_labor_force_employed: true,
 *     is_senior_citizen: false
 *   }
 * };
 * ```
 */
export interface Resident {
  // Core Identity Fields
  /** Unique resident identifier (UUID format) */
  id: string;
  /** Full name (computed field, optional for display) */
  name?: string;
  /** First name as recorded in official documents */
  first_name: string;
  /** Middle name or initial (optional) */
  middle_name?: string;
  /** Last name/surname as recorded in official documents */
  last_name: string;
  /** Name extension (Jr., Sr., III, etc.) */
  extension_name?: string;
  
  // Birth and Identity Information  
  /** Birth date in ISO 8601 format (YYYY-MM-DD) */
  birthdate: string;
  /** PSGC code of birth place location */
  birth_place_code?: string;
  /** Administrative level of birth place (region, province, city, or barangay) */
  birth_place_level?: 'region' | 'province' | 'city_municipality' | 'barangay';
  /** Descriptive name of birth place */
  birth_place_name?: string;
  /** Biological sex as recorded in official documents */
  sex: 'male' | 'female';
  
  // Civil Status Information
  /** Current civil status (married, single, widowed, etc.) */
  civil_status: string;
  /** Specification when civil_status is 'others' */
  civil_status_others_specify?: string;
  /** Citizenship status (Filipino, dual citizen, foreign national) */
  citizenship?: string;
  
  // Contact Information
  /** Mobile phone number (Philippine format: +639xxxxxxxxx or 09xxxxxxxxx) */
  mobile_number?: string;
  /** Email address for digital communications */
  email?: string;
  /** Landline/telephone number */
  telephone_number?: string;
  
  // Government IDs and Numbers
  /** Complete PhilSys (PSN) card number (format: 1234-5678-9012-3456) */
  philsys_card_number?: string;
  /** Last 4 digits of PhilSys number (for verification purposes) */
  philsys_last4?: string;
  
  // Education Information
  /** Highest educational attainment level */
  education_attainment?: string;
  /** Whether the resident graduated from their education level */
  is_graduate?: boolean;
  
  // Employment Information
  /** Current employment status (employed, unemployed, student, etc.) */
  employment_status?: string;
  /** PSOC (Philippine Standard Occupational Classification) code */
  employment_code?: string;
  /** Name/description of current employment */
  employment_name?: string;
  /** Detailed PSOC classification code */
  psoc_code?: string;
  /** PSOC classification level (1-4, with 4 being most specific) */
  psoc_level?: number;
  /** Specific job title or occupation */
  occupation_title?: string;
  
  // Physical Characteristics
  /** Blood type (A+, B-, AB+, O-, etc. or 'unknown') */
  blood_type?: string;
  /** Height in centimeters */
  height?: number;
  /** Weight in kilograms */
  weight?: number;
  /** Skin complexion description */
  complexion?: string;
  
  // Cultural Identity
  /** Ethnic group or cultural identity */
  ethnicity?: string;
  /** Religious affiliation */
  religion?: string;
  /** Specification when religion is 'others' */
  religion_others_specify?: string;
  
  // Family Information
  /** Mother's maiden first name */
  mother_maiden_first?: string;
  /** Mother's maiden middle name */
  mother_maiden_middle?: string;
  /** Mother's maiden last name */
  mother_maiden_last?: string;
  
  // Voting Information
  /** Whether resident is registered to vote */
  is_voter?: boolean;
  /** Whether resident votes in their current barangay */
  is_resident_voter?: boolean;
  /** Date of last recorded vote (ISO 8601 format) */
  last_voted_date?: string;
  
  // Geographic/Address Information
  /** Household code this resident belongs to */
  household_code?: string;
  /** Street identifier within the barangay */
  street_id?: string;
  /** Subdivision identifier (if applicable) */
  subdivision_id?: string;
  /** PSGC barangay code (required - primary geographic identifier) */
  barangay_code: string;
  /** PSGC city/municipality code (required) */
  city_municipality_code: string;
  /** PSGC province code (optional for independent cities) */
  province_code?: string;
  /** PSGC region code (required) */
  region_code: string;
  /** Postal ZIP code */
  zip_code?: string;
  
  // System Fields
  /** Whether the resident record is active/enabled */
  is_active?: boolean;
  /** Timestamp when record was created (ISO 8601 format) */
  created_at: string;
  /** Timestamp when record was last updated (ISO 8601 format) */
  updated_at?: string;
  /** User ID who created this record */
  created_by?: string;
  
  // Related Data from API Response
  /** 
   * Household information when resident data includes household details
   * @description Complete household record associated with this resident
   */
  household?: {
    /** Unique household identifier code (format: BBBBBBBBB-YYYY-NNNNNN) */
    code: string;
    /** Household name or identifier */
    name?: string;
    /** Complete address string */
    address?: string;
    /** House number on the street */
    house_number: string;
    /** Street identifier within barangay */
    street_id: string;
    /** Subdivision identifier (if applicable) */
    subdivision_id?: string;
    /** PSGC barangay code where household is located */
    barangay_code: string;
    /** PSGC city/municipality code */
    city_municipality_code: string;
    /** PSGC province code */
    province_code?: string;
    /** PSGC region code */
    region_code: string;
    /** Number of families within this household */
    no_of_families?: number;
    /** Total number of household members */
    no_of_household_members?: number;
    /** Type of household (nuclear, extended, etc.) */
    household_type?: string;
    /** Housing tenure status (owned, rented, free, etc.) */
    tenure_status?: string;
    /** Monthly household income in Philippine Peso */
    monthly_income?: number;
    /** Income classification bracket */
    income_class?: string;
    /** Resident ID of the household head */
    household_head_id?: string;
  };
  
  // Geographic Information from API
  /** 
   * Barangay details for display purposes
   * @description PSGC barangay information populated from API calls
   */
  barangay_info?: {
    /** PSGC barangay code */
    code: string;
    /** Official barangay name */
    name: string;
  };
  /** 
   * City/Municipality details for display purposes
   * @description PSGC city/municipality information populated from API calls
   */
  city_municipality_info?: {
    /** PSGC city/municipality code */
    code: string;
    /** Official city/municipality name */
    name: string;
    /** Administrative type (city, municipality, independent city) */
    type: string;
  };
  /** 
   * Province details for display purposes
   * @description PSGC province information populated from API calls
   */
  province_info?: {
    /** PSGC province code */
    code: string;
    /** Official province name */
    name: string;
  };
  /** 
   * Region details for display purposes
   * @description PSGC region information populated from API calls
   */
  region_info?: {
    /** PSGC region code */
    code: string;
    /** Official region name */
    name: string;
  };
  
  // Sectoral Information (from resident_sectoral_info table)
  /** 
   * Government sectoral demographic classifications
   * @description Statistical categorizations used for government planning and social services.
   * Based on Philippine Statistical Authority (PSA) demographic classifications.
   */
  sectoral_info?: {
    /** Whether resident is part of the labor force (working age 15-64) */
    is_labor_force?: boolean;
    /** Whether labor force resident is currently employed */
    is_labor_force_employed?: boolean;
    /** Whether resident is unemployed (actively seeking work) */
    is_unemployed?: boolean;
    /** Whether resident is an Overseas Filipino Worker (OFW) */
    is_overseas_filipino_worker?: boolean;
    /** Whether resident is a Person with Disability (PWD) */
    is_person_with_disability?: boolean;
    /** Whether resident is out-of-school children (6-14 years old not in school) */
    is_out_of_school_children?: boolean;
    /** Whether resident is out-of-school youth (15-24 years old not in school) */
    is_out_of_school_youth?: boolean;
    /** Whether resident is a senior citizen (60+ years old) */
    is_senior_citizen?: boolean;
    /** Whether senior citizen is registered with DSWD */
    is_registered_senior_citizen?: boolean;
    /** Whether resident is a solo parent (single parent raising children) */
    is_solo_parent?: boolean;
    /** Whether resident belongs to an indigenous cultural community */
    is_indigenous_people?: boolean;
    /** Whether resident is an internal migrant (moved from another location) */
    is_migrant?: boolean;
  };
  
  // Migration Information (from resident_migrant_info table)
  /** 
   * Internal migration tracking information
   * @description Details about residents who have migrated from other locations within the Philippines.
   * Used for tracking population movement and providing appropriate social services.
   */
  migrant_info?: {
    /** PSGC barangay code of previous residence */
    previous_barangay_code?: string;
    /** PSGC city/municipality code of previous residence */
    previous_city_municipality_code?: string;
    /** PSGC province code of previous residence */
    previous_province_code?: string;
    /** PSGC region code of previous residence */
    previous_region_code?: string;
    /** Reason for leaving previous location */
    reason_for_leaving?: string;
    /** Date when resident moved to current location (ISO 8601 format) */
    date_of_transfer?: string;
    /** Reason for transferring to current location */
    reason_for_transferring?: string;
    /** Number of months resident has been in current location */
    duration_of_stay_current_months?: number;
    /** Whether resident intends to return to previous location */
    is_intending_to_return?: boolean;
    /** Type of migration (rural-to-urban, urban-to-rural, etc.) */
    migration_type?: string;
  };
}