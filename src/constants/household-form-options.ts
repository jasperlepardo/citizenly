/**
 * Household Form Options - Static Option Arrays
 *
 * @fileoverview Static option arrays for household form dropdowns and selections.
 * All options are synchronized with database enum values in database/schema.sql
 * to ensure data integrity and consistency across the application.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 *
 * Database Enums Covered:
 * - HouseholdTypeEnum (7 values)
 * - TenureStatusEnum (6 values)
 * - HouseholdUnitEnum (9 values)
 * - IncomeClassEnum (8 values based on PSO standards)
 *
 * @example Usage in Forms
 * ```typescript
 * import { HOUSEHOLD_TYPE_OPTIONS } from '@/constants/household-form-options';
 *
 * <Select options={HOUSEHOLD_TYPE_OPTIONS} />
 * ```
 */

// =============================================================================
// OPTION TYPE DEFINITION
// =============================================================================

type OptionType = { value: string; label: string };

// =============================================================================
// HOUSEHOLD CLASSIFICATION OPTIONS
// =============================================================================

/**
 * Household type classification options
 * @description Based on DILG RBI household typology standards
 * @see database/schema.sql - household_type_enum
 */
export const HOUSEHOLD_TYPE_OPTIONS: OptionType[] = [
  { value: 'nuclear', label: 'Nuclear Family' },
  { value: 'single_parent', label: 'Single Parent' },
  { value: 'extended', label: 'Extended Family' },
  { value: 'childless', label: 'Childless' },
  { value: 'one_person', label: 'One Person' },
  { value: 'non_family', label: 'Non-Family' },
  { value: 'other', label: 'Other' },
];

/**
 * Tenure status classification options
 * @description Housing tenure security classifications
 * @see database/schema.sql - tenure_status_enum
 */
export const TENURE_STATUS_OPTIONS: OptionType[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'owned_with_mortgage', label: 'Owned with Mortgage' },
  { value: 'rented', label: 'Rented' },
  { value: 'occupied_for_free', label: 'Occupied for Free' },
  { value: 'occupied_without_consent', label: 'Occupied without Consent' },
  { value: 'others', label: 'Others' },
];

/**
 * Household unit type options
 * @description Physical housing structure classifications
 * @see database/schema.sql - household_unit_enum
 */
export const HOUSEHOLD_UNIT_OPTIONS: OptionType[] = [
  { value: 'single_house', label: 'Single House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condominium', label: 'Condominium' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'makeshift', label: 'Makeshift' },
  { value: 'others', label: 'Others' },
];

/**
 * Income class classification options
 * @description Based on Philippine Statistical Office (PSO) income brackets
 * @see database/schema.sql - income_class_enum
 * @note Values in Philippine Pesos per month (2025 standards)
 */
export const INCOME_CLASS_OPTIONS: OptionType[] = [
  { value: 'poor', label: 'Poor (Below ₱12,030/month)' },
  { value: 'low_income', label: 'Low Income (₱12,030-₱24,120)' },
  { value: 'lower_middle_class', label: 'Lower Middle Class (₱24,120-₱43,828)' },
  { value: 'middle_class', label: 'Middle Class (₱43,828-₱76,699)' },
  { value: 'upper_middle_income', label: 'Upper Middle Income (₱76,699-₱131,484)' },
  { value: 'high_income', label: 'High Income (₱131,484-₱219,140)' },
  { value: 'rich', label: 'Rich (Above ₱219,140)' },
  { value: 'not_determined', label: 'Not Determined' },
];

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

/**
 * All household form options grouped for batch imports
 */
export const HOUSEHOLD_FORM_OPTIONS = {
  HOUSEHOLD_TYPE: HOUSEHOLD_TYPE_OPTIONS,
  TENURE_STATUS: TENURE_STATUS_OPTIONS,
  HOUSEHOLD_UNIT: HOUSEHOLD_UNIT_OPTIONS,
  INCOME_CLASS: INCOME_CLASS_OPTIONS,
} as const;

/**
 * Option type for external usage
 */
export type { OptionType };
