/**
 * Geographic Utilities
 * Consolidated geographic data utilities aligned with database schema
 */

import type { CompleteAddress } from '@/types/addresses';

// CompleteAddress interface moved to @/types/addresses - removed duplicate
// AddressComponent was identical to CompleteAddress - using CompleteAddress type alias
export type AddressComponent = CompleteAddress;

/**
 * Format complete address from components
 */
export function formatFullAddress(address: Partial<CompleteAddress>): string {
  if (!address) return '';

  const parts = [
    address.barangay_name,
    address.city_municipality_name,
    address.province_name,
    address.region_name,
  ].filter(Boolean);

  return parts.join(', ') || '';
}

/**
 * Format barangay display name
 */
export function formatBarangayName(name: string): string {
  if (!name) return '';

  // Add "Barangay" prefix if not already present
  if (name.toLowerCase().startsWith('barangay ')) {
    return name;
  }

  return `Barangay ${name}`;
}

/**
 * Format city/municipality display name
 */
export function formatCityName(name: string, type: string): string {
  if (!name) return '';

  const cityType = type?.toLowerCase();

  if (cityType === 'city' && !name.toLowerCase().includes('city')) {
    return `${name} City`;
  }

  if (cityType === 'municipality' && !name.toLowerCase().includes('municipality')) {
    return `Municipality of ${name}`;
  }

  return name;
}

/**
 * Extract PSGC level from code length
 */
export function getPsgcLevel(
  code: string
): 'region' | 'province' | 'city' | 'barangay' | 'unknown' {
  if (!code) return 'unknown';

  const length = code.replace(/\D/g, '').length;

  switch (length) {
    case 2:
      return 'region';
    case 4:
      return 'province';
    case 6:
      return 'city';
    case 9:
      return 'barangay';
    default:
      return 'unknown';
  }
}

/**
 * Validate PSGC code format
 */
export function isValidPsgcCode(
  code: string,
  level?: 'region' | 'province' | 'city' | 'barangay'
): boolean {
  if (!code) return false;

  const digitsOnly = code.replace(/\D/g, '');
  const detectedLevel = getPsgcLevel(code);

  if (level && detectedLevel !== level) {
    return false;
  }

  return detectedLevel !== 'unknown';
}

/**
 * Format address for search display
 */
export function formatSearchAddress(address: Partial<CompleteAddress>): string {
  if (!address) return '';

  const parts = [];

  if (address.barangay_name) {
    parts.push(formatBarangayName(address.barangay_name));
  }

  if (address.city_municipality_name && address.city_municipality_type) {
    parts.push(formatCityName(address.city_municipality_name, address.city_municipality_type));
  }

  if (address.province_name) {
    parts.push(address.province_name);
  }

  return parts.join(', ') || '';
}

/**
 * Check if address is in Metro Manila
 */
export function isMetroManilaAddress(address: Partial<CompleteAddress>): boolean {
  if (!address.region_code) return false;

  // NCR (National Capital Region) code
  return address.region_code === '13' || address.region_code === '130000000';
}

/**
 * Extract parent codes from PSGC code
 */
export function extractParentCodes(barangayCode: string): {
  regionCode: string;
  provinceCode: string;
  cityCode: string;
} {
  if (!barangayCode || barangayCode.length < 9) {
    return { regionCode: '', provinceCode: '', cityCode: '' };
  }

  const digits = barangayCode.replace(/\D/g, '');

  return {
    regionCode: digits.substring(0, 2),
    provinceCode: digits.substring(0, 4),
    cityCode: digits.substring(0, 6),
  };
}

/**
 * Normalize address search term
 */
export function normalizeAddressSearch(searchTerm: string): string {
  if (!searchTerm) return '';

  return searchTerm
    .toLowerCase()
    .replace(/barangay\s+/g, '') // Remove "barangay" prefix for search
    .replace(/city\s*$/g, '') // Remove "city" suffix for search
    .replace(/municipality\s+of\s+/g, '') // Remove "municipality of" prefix
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}
