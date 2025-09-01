/**
 * Household Display Helper Functions
 * 
 * @description Utility functions for formatting household data across all views
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import type { HouseholdRecord } from '../../../types/infrastructure/database/database';

/**
 * Format household name with fallback
 */
export const formatHouseholdName = (household: Partial<HouseholdRecord> | null): string => {
  if (!household) return '-';
  return household.name || `Household ${household.code || 'Unknown'}`;
};

/**
 * Format household address from components
 */
export const formatHouseholdAddress = (household: Partial<HouseholdRecord> | null): string => {
  if (!household) return '-';
  
  const parts = [
    household.house_number,
    // Note: street and subdivision names would come from joined data
    household.barangay_code, // This would be resolved to name in real usage
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : '-';
};

/**
 * Format household display label for select components
 */
export const formatHouseholdLabel = (household: Partial<HouseholdRecord> | null): string => {
  if (!household) return '-';
  
  const code = household.code || 'Unknown';
  const address = household.house_number || 'No House #';
  
  return `${code} - ${address}`;
};

/**
 * Format household description with head information
 */
export const formatHouseholdDescription = (
  household: Partial<HouseholdRecord> | null,
  headName?: string
): string => {
  if (!household) return '-';
  
  const name = household.name || 'Unnamed';
  const head = headName || 'Unknown Head';
  
  return `${name} - Head: ${head}`;
};

/**
 * Format household members count
 */
export const formatHouseholdSize = (memberCount?: number | null): string => {
  if (!memberCount || memberCount === 0) return 'No members';
  if (memberCount === 1) return '1 member';
  return `${memberCount} members`;
};

/**
 * Format household income for display
 */
export const formatHouseholdIncome = (income?: number | null): string => {
  if (!income || income === 0) return 'No income reported';
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(income);
};

/**
 * Format household type for display
 */
export const formatHouseholdType = (type?: string | null): string => {
  if (!type) return '-';
  
  const typeMap: Record<string, string> = {
    'nuclear': 'Nuclear Family',
    'extended': 'Extended Family',
    'single_parent': 'Single Parent',
    'couple': 'Couple',
    'single_person': 'Single Person',
    'other': 'Other',
  };
  
  return typeMap[type.toLowerCase()] || type;
};

/**
 * Format tenure status for display
 */
export const formatTenureStatus = (status?: string | null): string => {
  if (!status) return '-';
  
  const statusMap: Record<string, string> = {
    'owned': 'Owned',
    'rented': 'Rented',
    'rent_free': 'Rent-free',
    'occupied': 'Occupied',
    'other': 'Other',
  };
  
  return statusMap[status.toLowerCase()] || status;
};

/**
 * Format income class for display
 */
export const formatIncomeClass = (incomeClass?: string | null): string => {
  if (!incomeClass) return '-';
  
  const classMap: Record<string, string> = {
    'poor': 'Poor',
    'low_income': 'Low Income',
    'lower_middle': 'Lower Middle Class',
    'middle': 'Middle Class',
    'upper_middle': 'Upper Middle Class',
    'high_income': 'High Income',
  };
  
  return classMap[incomeClass.toLowerCase()] || incomeClass;
};

/**
 * Get household status badge color/style
 */
export const getHouseholdStatusBadge = (household: Partial<HouseholdRecord> | null): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info';
} => {
  if (!household) {
    return { label: 'Unknown', variant: 'danger' };
  }
  
  const isActive = household.is_active !== false;
  const hasMembers = (household.no_of_household_members || 0) > 0;
  
  if (!isActive) {
    return { label: 'Inactive', variant: 'danger' };
  }
  
  if (!hasMembers) {
    return { label: 'No Members', variant: 'warning' };
  }
  
  return { label: 'Active', variant: 'success' };
};

/**
 * Format household option for select components
 */
export const formatHouseholdOption = (
  household: Partial<HouseholdRecord>,
  headName?: string
) => {
  return {
    value: household.code || '',
    label: formatHouseholdLabel(household),
    description: formatHouseholdDescription(household, headName),
    code: household.code || '',
    head_name: headName || '',
    address: formatHouseholdAddress(household),
  };
};