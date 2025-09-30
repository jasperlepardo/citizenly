/**
 * Address Helper Functions
 * Pure domain logic for address-related operations
 * No infrastructure dependencies
 */

import type { AddressLabels, HouseholdTypeLabels } from '@/types/domain/addresses/addresses';

/**
 * Lookup household type labels (pure business logic)
 */
export function lookupHouseholdTypeLabels(householdData: {
  householdType?: string;
  tenureStatus?: string;
  householdUnit?: string;
  householdHeadPosition?: string;
}): HouseholdTypeLabels {
  const labels: HouseholdTypeLabels = {};

  // Household Type mapping
  const householdTypeMap: Record<string, string> = {
    nuclear: 'Nuclear Family',
    single_parent: 'Single Parent',
    extended: 'Extended Family',
    childless: 'Childless',
    one_person: 'One Person',
    non_family: 'Non-Family',
    other: 'Other',
  };

  // Tenure Status mapping
  const tenureStatusMap: Record<string, string> = {
    owned: 'Owned',
    owned_with_mortgage: 'Owned with Mortgage',
    rented: 'Rented',
    occupied_for_free: 'Occupied for Free',
    occupied_without_consent: 'Occupied without Consent',
    others: 'Others',
  };

  // Household Unit mapping
  const householdUnitMap: Record<string, string> = {
    single_house: 'Single House',
    duplex: 'Duplex',
    apartment: 'Apartment',
    townhouse: 'Townhouse',
    condominium: 'Condominium',
    boarding_house: 'Boarding House',
    institutional: 'Institutional',
    makeshift: 'Makeshift',
    others: 'Others',
  };

  // Household Head Position mapping
  const householdHeadPositionMap: Record<string, string> = {
    father: 'Father',
    mother: 'Mother',
    son: 'Son',
    daughter: 'Daughter',
    grandmother: 'Grandmother',
    grandfather: 'Grandfather',
    father_in_law: 'Father-in-law',
    mother_in_law: 'Mother-in-law',
    brother_in_law: 'Brother-in-law',
    sister_in_law: 'Sister-in-law',
    spouse: 'Spouse',
    sibling: 'Sibling',
    guardian: 'Guardian',
    ward: 'Ward',
    other: 'Other',
  };

  if (householdData.householdType) {
    labels.householdTypeLabel =
      householdTypeMap[householdData.householdType] || householdData.householdType;
  }

  if (householdData.tenureStatus) {
    labels.tenureStatusLabel =
      tenureStatusMap[householdData.tenureStatus] || householdData.tenureStatus;
  }

  if (householdData.householdUnit) {
    labels.householdUnitLabel =
      householdUnitMap[householdData.householdUnit] || householdData.householdUnit;
  }

  if (householdData.householdHeadPosition) {
    labels.householdHeadPositionLabel =
      householdHeadPositionMap[householdData.householdHeadPosition] ||
      householdData.householdHeadPosition;
  }

  return labels;
}

/**
 * Format complete address from components (pure business logic)
 */
export function formatFullAddress(addressComponents: {
  streetNumber?: string;
  streetName?: string;
  subdivisionName?: string;
  barangayName?: string;
  cityName?: string;
  provinceName?: string;
  regionName?: string;
}): string {
  const parts = [
    addressComponents.streetNumber,
    addressComponents.streetName,
    addressComponents.subdivisionName,
    addressComponents.barangayName,
    addressComponents.cityName,
    addressComponents.provinceName,
    addressComponents.regionName,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Validate address completeness (business rule validation)
 */
export function validateAddressCompleteness(address: {
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  barangayCode?: string;
}): { isComplete: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!address.regionCode) missingFields.push('Region');
  if (!address.provinceCode) missingFields.push('Province');
  if (!address.cityCode) missingFields.push('City/Municipality');
  if (!address.barangayCode) missingFields.push('Barangay');

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}