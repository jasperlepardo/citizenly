/**
 * Regions API Route
 * Returns all Philippine regions in SelectField format
 */

import { PSGCHandlers } from '@/lib/api/psgc-handlers';

// Use consolidated PSGC handler - eliminates 35 lines of duplicate code
export const GET = PSGCHandlers.regions;
