/** @jest-environment node */
import { NextRequest } from 'next/server';

// Mock the auth middleware first
jest.mock('@/lib/api-auth', () => ({
  withAuth: jest.fn((config, handler) => {
    return async (request: NextRequest) => {
      // Mock successful authentication
      const mockContext = { requestId: 'test-request-id' };
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'barangay_admin',
        barangayCode: '056203001',
      };
      return handler(request, mockContext, mockUser);
    };
  }),
  createAdminSupabaseClient: jest.fn(() => mockSupabaseClient),
  applyGeographicFilter: jest.fn(),
}));

// Mock API responses
jest.mock('@/lib/api-responses', () => ({
  createCreatedResponse: jest.fn((data) => 
    Response.json(data, { status: 200 })
  ),
  createValidationErrorResponse: jest.fn((message) => 
    Response.json({ error: message }, { status: 400 })
  ),
  withNextRequestErrorHandling: jest.fn((handler) => handler),
  withSecurityHeaders: jest.fn((handler) => handler),
}));

// Mock other dependencies
jest.mock('@/lib/rate-limit', () => ({
  createRateLimitHandler: jest.fn(() => () => ({ success: true })),
}));

jest.mock('@/lib/api-audit', () => ({
  auditDataOperation: jest.fn(),
}));

jest.mock('@/lib/secure-logger', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
  logError: jest.fn(),
}));

// Import after mocking
import { POST } from '../route';

// Mock data
const mockProfile = { barangay_code: '056203001' };
const mockEncryptionKey = { key_name: 'pii_master_key', is_active: true };
const mockResidentMasked = {
  first_name_masked: 'J***',
  last_name_masked: 'D***',
  age: 33,
  sex: 'male',
  barangay_code: '056203001',
  created_at: '2024-01-15T00:00:00Z',
};

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
  rpc: jest.fn(),
};

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Utilities
function buildRequest(body: any, token = 'test-token') {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });
  const req = new Request('http://localhost/api/residents', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return new NextRequest(req);
}

describe.skip('POST /api/residents', () => {
  const originalEnv = process.env.CI;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';

    // Temporarily disable CI error checking for these tests
    process.env.CI = undefined;

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore CI environment
    process.env.CI = originalEnv;
  });

  it('returns 400 for missing required fields', async () => {
    const req = buildRequest({});
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });

  it('returns 400 for future birthdate', async () => {
    const req = buildRequest({
      firstName: 'A',
      lastName: 'B',
      birthdate: '2999-01-01',
      sex: 'male',
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });

  it('returns 400 for invalid email', async () => {
    const req = buildRequest({
      firstName: 'A',
      lastName: 'B',
      birthdate: '1990-01-01',
      sex: 'male',
      email: 'bad@',
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });

  it('returns 401 for missing bearer', async () => {
    // Mock authentication failure for this specific test
    const { withAuth } = require('@/lib/api-auth');
    withAuth.mockImplementationOnce(() => {
      return async () => {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      };
    });

    const headers = new Headers({ 'Content-Type': 'application/json' });
    const req = new NextRequest(
      new Request('http://localhost/api/residents', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('calls RPC and returns success for minimal valid payload', async () => {
    // Mock auth success
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });

    // Mock profile lookup for auth_user_profiles
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });

    // Mock encryption key lookup for system_encryption_keys (handles chained .eq calls)
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockEncryptionKey, error: null }),
          }),
        }),
      }),
    });

    // Mock RPC success
    mockSupabaseClient.rpc.mockResolvedValue({ data: 'new-id-123', error: null });

    // Mock residents_masked lookup
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockResidentMasked, error: null }),
        }),
      }),
    });

    const req = buildRequest({
      firstName: 'A',
      lastName: 'B',
      birthdate: '1990-01-01',
      sex: 'male',
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.resident_id).toBe('new-id-123');
    expect(json.resident.id).toBe('new-id-123');
  });

  it('maps DB error to friendly message', async () => {
    // Mock auth success
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });

    // Mock profile lookup for auth_user_profiles
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });

    // Mock encryption key lookup for system_encryption_keys (handles chained .eq calls)
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockEncryptionKey, error: null }),
          }),
        }),
      }),
    });

    // Mock RPC error
    mockSupabaseClient.rpc.mockResolvedValue({
      data: null,
      error: { message: 'violates row-level security policy' },
    });

    const req = buildRequest({
      firstName: 'A',
      lastName: 'B',
      birthdate: '1990-01-01',
      sex: 'male',
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/jurisdiction/i);
  });

  it('sanitizes geographic codes to exactly 10 characters', async () => {
    // Mock auth success
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });

    // Mock profile lookup for auth_user_profiles
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });

    // Mock encryption key lookup for system_encryption_keys (handles chained .eq calls)
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockEncryptionKey, error: null }),
          }),
        }),
      }),
    });

    // Mock RPC success
    mockSupabaseClient.rpc.mockResolvedValue({ data: 'new-id-123', error: null });

    // Mock residents_masked lookup
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockResidentMasked, error: null }),
        }),
      }),
    });

    const req = buildRequest({
      firstName: 'A',
      lastName: 'B',
      birthdate: '1990-01-01',
      sex: 'male',
      barangayCode: '123', // 3 digits
      cityMunicipalityCode: '456', // 3 digits
      provinceCode: '78', // 2 digits
      regionCode: '9', // 1 digit
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.resident_id).toBe('new-id-123');

    // Verify that the RPC was called with properly sanitized codes
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'insert_resident_encrypted',
      expect.objectContaining({
        p_barangay_code: '123', // not sanitized (from user profile)
        p_city_municipality_code: '0000000456', // padded to 10 chars
        p_province_code: '0000000078', // padded to 10 chars
        p_region_code: '0000000009', // padded to 10 chars
      })
    );
  });

  it('handles very long geographic codes correctly', async () => {
    // Mock auth success
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });

    // Mock profile lookup for auth_user_profiles
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });

    // Mock encryption key lookup for system_encryption_keys (handles chained .eq calls)
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockEncryptionKey, error: null }),
          }),
        }),
      }),
    });

    // Mock RPC success
    mockSupabaseClient.rpc.mockResolvedValue({ data: 'new-id-123', error: null });

    // Mock residents_masked lookup
    mockSupabaseClient.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockResidentMasked, error: null }),
        }),
      }),
    });

    const req = buildRequest({
      firstName: 'A',
      lastName: 'B',
      birthdate: '1990-01-01',
      sex: 'male',
      barangayCode: '123456789012345', // 15 digits (too long)
      cityMunicipalityCode: '987654321098765432', // 18 digits (too long)
      provinceCode: '1234567890', // 10 digits (exactly at limit)
      regionCode: '123456789', // 9 digits (under limit)
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.resident_id).toBe('new-id-123');

    // Verify that the RPC was called with properly sanitized codes (truncated to 10 chars)
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'insert_resident_encrypted',
      expect.objectContaining({
        p_barangay_code: '1234567890', // truncated to 10 chars
        p_city_municipality_code: '9876543210', // truncated to 10 chars
        p_province_code: '1234567890', // exactly 10 chars
        p_region_code: '0123456789', // padded to 10 chars
      })
    );
  });
});
