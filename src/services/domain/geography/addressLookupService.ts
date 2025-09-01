import { supabase } from '../../../lib/data/supabase';
import type { AddressLabels, HouseholdTypeLabels } from '../../../types/domain/addresses/addresses';

/**
 * Helper to lookup a single address component
 */
async function lookupAddressComponent(
  table: string,
  field: string,
  value: string | undefined
): Promise<string | undefined> {
  if (!value) return undefined;
  
  try {
    const { data } = await supabase
      .from(table)
      .select('name')
      .eq(field, value)
      .single();
    return data?.name;
  } catch {
    return undefined;
  }
}

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
    // Define lookup configurations
    const lookupConfigs = [
      { code: addressData.regionCode, table: 'psgc_regions', field: 'code', labelKey: 'regionLabel' },
      { code: addressData.provinceCode, table: 'psgc_provinces', field: 'code', labelKey: 'provinceLabel' },
      { code: addressData.cityMunicipalityCode, table: 'psgc_cities_municipalities', field: 'code', labelKey: 'cityLabel' },
      { code: addressData.barangayCode, table: 'psgc_barangays', field: 'code', labelKey: 'barangayLabel' },
      { code: addressData.streetId, table: 'geo_streets', field: 'id', labelKey: 'streetLabel' },
      { code: addressData.subdivisionId, table: 'geo_subdivisions', field: 'id', labelKey: 'subdivisionLabel' },
    ];

    // Perform lookups in parallel for better performance
    const results = await Promise.all(
      lookupConfigs.map(async (config) => ({
        labelKey: config.labelKey,
        value: await lookupAddressComponent(config.table, config.field, config.code)
      }))
    );

    // Assign results to labels object
    results.forEach(({ labelKey, value }) => {
      if (value) {
        (labels as any)[labelKey] = value;
      }
    });
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
