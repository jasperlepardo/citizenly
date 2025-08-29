/**
 * Streets API Route
 * Returns geo streets with search functionality, optionally filtered by barangay and subdivision
 * Query parameters: ?barangay_code=BARANGAY_CODE&subdivision_id=SUBDIVISION_ID&search=SEARCH_TERM
 */

import { PSGCHandlers } from '@/lib/api/psgc-handlers';

// Use consolidated PSGC handler - eliminates 70 lines of duplicate code
export const GET = PSGCHandlers.streets;
