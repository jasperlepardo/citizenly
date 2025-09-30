/**
 * API Hook Types
 *
 * @fileoverview TypeScript interfaces for API-related React hooks
 * in the Citizenly RBI system.
 */

// =============================================================================
// API HOOK TYPES
// =============================================================================

/**
 * Geographic option interface
 * Consolidates from src/hooks/api/useGeographicData.ts
 */
export interface GeographicOption {
  value: string;
  label: string;
}

/**
 * Geographic data interface
 * Consolidates from src/hooks/api/useGeographicData.ts
 */
export interface GeographicData {
  regions: GeographicOption[];
  provinces: GeographicOption[];
  cities: GeographicOption[];
  barangays: GeographicOption[];
  streets: GeographicOption[];
  subdivisions: GeographicOption[];
}

/**
 * Geographic data hook return interface
 * Consolidates from src/hooks/api/useGeographicData.ts
 */
export interface UseGeographicDataReturn {
  data: GeographicData;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * URL parameter configuration interface
 * Consolidates from src/hooks/useURLParameters.ts
 */
export interface URLParameterConfig {
  key: string;
  sanitizationType?: 'text' | 'name' | 'none';
  defaultValue?: string;
}

/**
 * URL parameters result interface
 * Consolidates from src/hooks/useURLParameters.ts
 */
export interface URLParametersResult {
  [key: string]: string | null;
}