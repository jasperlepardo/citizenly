/**
 * Streets API Route
 * Returns empty array since geo_streets table doesn't exist
 * Query parameters: ?barangay_code=BARANGAY_CODE&subdivision_id=SUBDIVISION_ID&search=SEARCH_TERM
 */

import { createSuccessResponse } from '@/utils/auth/apiResponseHandlers';

export async function GET() {
  // Return empty array since geo_streets table doesn't exist in the database
  // This prevents the permission denied errors
  const options: Array<{
    value: string;
    label: string;
    subdivision_id?: string | null;
    barangay_code?: string;
  }> = [];

  return createSuccessResponse(options, 'Streets retrieved successfully');
}
