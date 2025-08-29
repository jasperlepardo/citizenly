/**
 * Barangays API Route
 * Returns Philippine barangays, optionally filtered by city/municipality
 * Query parameter: ?city=CITY_CODE
 */

import { PSGCHandlers } from '@/lib/api/psgc-handlers';

// Use consolidated PSGC handler - eliminates 45 lines of duplicate code
export const GET = PSGCHandlers.barangays;
