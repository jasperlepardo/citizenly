/**
 * Provinces API Route
 * Returns Philippine provinces, optionally filtered by region
 * Query parameter: ?region=REGION_CODE
 */

import { PSGCHandlers } from '@/lib/api/psgc-handlers';

// Use consolidated PSGC handler - eliminates 42 lines of duplicate code
export const GET = PSGCHandlers.provinces;
