/**
 * Cities/Municipalities API Route
 * Returns Philippine cities and municipalities, optionally filtered by province
 * Query parameter: ?province=PROVINCE_CODE
 */

import { PSGCHandlers } from '@/lib/api/psgc-handlers';

// Use consolidated PSGC handler - eliminates 46 lines of duplicate code
export const GET = PSGCHandlers.cities;
