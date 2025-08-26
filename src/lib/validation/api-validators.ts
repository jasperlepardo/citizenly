/**
 * API Request Validation Utilities
 * Common validation functions for API routes
 */

import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).max(1000).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const psgcCodeSchema = z.object({
  code: z.string().min(2).max(12).regex(/^\d+$/, 'PSGC code must contain only digits')
    .refine(code => [2, 4, 6, 9, 10, 12].includes(code.length), {
      message: 'PSGC code must be 2, 4, 6, 9, 10, or 12 digits long',
    }),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  query: z.string().min(1).max(100).optional(),
  search: z.string().min(1).max(100).optional(),
}).refine(data => data.q || data.query || data.search, {
  message: 'At least one search parameter is required',
});

export const subdivisionIdSchema = z.object({
  subdivision_id: z.string().optional().transform(val => {
    if (!val) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  }),
});

// Validation helper functions
export function validatePagination(searchParams: URLSearchParams) {
  return paginationSchema.safeParse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  });
}

export function validatePsgcCode(searchParams: URLSearchParams) {
  return psgcCodeSchema.safeParse({
    code: searchParams.get('code'),
  });
}

export function validateSearchQuery(searchParams: URLSearchParams) {
  return searchQuerySchema.safeParse({
    q: searchParams.get('q'),
    query: searchParams.get('query'), 
    search: searchParams.get('search'),
  });
}

// Additional validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const residentIdSchema = z.object({
  id: uuidSchema,
});

export const bulkOperationSchema = z.object({
  operation: z.enum(['delete', 'activate', 'deactivate', 'update_sectoral']),
  resident_ids: z.array(uuidSchema).min(1).max(100),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const regionCodeSchema = z.object({
  region: z.string().regex(/^\d{2}$/, 'Region code must be 2 digits').optional(),
});

export const cityCodeSchema = z.object({
  city: z.string().regex(/^\d{6}$/, 'City code must be 6 digits').optional(),
});

export const barangayCodeSchema = z.object({
  barangay_code: z.string().regex(/^\d+$/, 'Barangay code must contain only digits').optional(),
});

// Generic validation error response
export function createValidationErrorResponse(errors: z.ZodIssue[]) {
  return {
    error: 'Validation failed',
    validationErrors: errors.reduce((acc, issue) => {
      const path = issue.path.join('.');
      if (!acc[path]) acc[path] = [];
      acc[path].push(issue.message);
      return acc;
    }, {} as Record<string, string[]>),
  };
}

// Validation helpers
export function validateResidentId(params: { id: string }) {
  return residentIdSchema.safeParse(params);
}

export function validateBulkOperation(data: unknown) {
  return bulkOperationSchema.safeParse(data);
}

export function validateRegionCode(searchParams: URLSearchParams) {
  return regionCodeSchema.safeParse({
    region: searchParams.get('region'),
  });
}

export function validateCityCode(searchParams: URLSearchParams) {
  return cityCodeSchema.safeParse({
    city: searchParams.get('city'),
  });
}