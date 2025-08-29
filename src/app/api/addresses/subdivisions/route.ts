/**
 * Subdivisions API Route
 * Returns geo subdivisions with search functionality, optionally filtered by barangay
 * Query parameters: ?barangay_code=BARANGAY_CODE&search=SEARCH_TERM
 */

import { PSGCHandlers } from '@/lib/api/psgc-handlers';

// Use consolidated PSGC handler - eliminates 64 lines of duplicate code
export const GET = PSGCHandlers.subdivisions;
