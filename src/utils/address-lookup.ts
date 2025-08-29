import { supabase } from '@/lib';
import type { AddressLabels, HouseholdTypeLabels } from '@/types/addresses';

/**
 * Lookup address labels from their codes/IDs
 */
export async function lookupAddressLabels(addressData: {
  regionCode?: string;
  provinceCode?: string;
  cityMunicipalityCode?: string;
  barangayCode?: string;
  streetId?: string;
  subdivisionId?: string;
}): Promise<AddressLabels> {
  const labels: AddressLabels = {};

  try {
    // Lookup region
    if (addressData.regionCode) {
      const { data: region } = await supabase
        .from('psgc_regions')
        .select('name')
        .eq('code', addressData.regionCode)
        .single();
      if (region) labels.regionLabel = region.name;
    }

    // Lookup province
    if (addressData.provinceCode) {
      const { data: province } = await supabase
        .from('psgc_provinces')
        .select('name')
        .eq('code', addressData.provinceCode)
        .single();
      if (province) labels.provinceLabel = province.name;
    }

    // Lookup city/municipality
    if (addressData.cityMunicipalityCode) {
      const { data: city } = await supabase
        .from('psgc_cities_municipalities')
        .select('name')
        .eq('code', addressData.cityMunicipalityCode)
        .single();
      if (city) labels.cityLabel = city.name;
    }

    // Lookup barangay
    if (addressData.barangayCode) {
      const { data: barangay } = await supabase
        .from('psgc_barangays')
        .select('name')
        .eq('code', addressData.barangayCode)
        .single();
      if (barangay) labels.barangayLabel = barangay.name;
    }

    // Lookup street
    if (addressData.streetId) {
      const { data: street } = await supabase
        .from('geo_streets')
        .select('name')
        .eq('id', addressData.streetId)
        .single();
      if (street) labels.streetLabel = street.name;
    }

    // Lookup subdivision
    if (addressData.subdivisionId) {
      const { data: subdivision } = await supabase
        .from('geo_subdivisions')
        .select('name')
        .eq('id', addressData.subdivisionId)
        .single();
      if (subdivision) labels.subdivisionLabel = subdivision.name;
    }
  } catch (error) {
    console.warn('Error looking up address labels:', error);
  }

  return labels;
}

/**
 * Lookup household type labels
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
 * Lookup household head name from residents table
 */
export async function lookupHouseholdHeadLabel(
  householdHeadId?: string
): Promise<string | undefined> {
  if (!householdHeadId) return undefined;

  try {
    const { data: resident } = await supabase
      .from('residents')
      .select('first_name, middle_name, last_name, extension_name')
      .eq('id', householdHeadId)
      .single();

    if (resident) {
      return [
        resident.first_name,
        resident.middle_name,
        resident.last_name,
        resident.extension_name,
      ]
        .filter(Boolean)
        .join(' ');
    }
  } catch (error) {
    console.warn('Error looking up household head:', error);
  }

  return undefined;
}
