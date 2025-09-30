/**
 * Jest Setup File
 * Global test configuration and utilities for Citizenly RBI System
 */

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Create mock objects that will be used by jest.mock calls
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    filter: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    single: jest.fn(),
  })),
};

const mockCrypto = {
  hashPhilSysNumber: jest.fn().mockResolvedValue('hashed_philsys_number'),
  maskPhilSysNumber: jest.fn().mockReturnValue('****-****-1234'),
  validatePhilSysNumber: jest.fn().mockReturnValue(true),
};

const mockDatabase = {
  getRegions: jest.fn().mockResolvedValue([
    { code: '01', name: 'Region I (Ilocos Region)' },
    { code: '13', name: 'National Capital Region (NCR)' },
  ]),
  getProvincesByRegion: jest.fn().mockResolvedValue([
    { code: '0128', name: 'Ilocos Norte' },
    { code: '0129', name: 'Ilocos Sur' },
  ]),
  getCitiesByProvince: jest.fn().mockResolvedValue([
    { code: '012801', name: 'Laoag City', type: 'City' },
    { code: '012802', name: 'Batac City', type: 'City' },
  ]),
  getBarangaysByCity: jest.fn().mockResolvedValue([
    { code: '01280101', name: 'Barangay 1' },
    { code: '01280102', name: 'Barangay 2' },
  ]),
  getMetroManilaCities: jest.fn().mockResolvedValue([
    { code: '137401', name: 'Manila', type: 'City' },
    { code: '137402', name: 'Quezon City', type: 'City' },
  ]),
  testDatabaseConnection: jest.fn().mockResolvedValue({
    success: true,
    data: {
      regions: 17,
      provinces: 86,
      cities: 1637,
      barangays: 38372,
    },
  }),
};

const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
};


// Set up module mocks that will be used across tests
jest.mock('../../src/lib/data/supabase', () => ({ supabase: mockSupabase }));
jest.mock('../../src/lib/security/crypto', () => mockCrypto);
// Note: connection-pool module was removed - mock removed
jest.mock('../../src/contexts/AuthContext.tsx', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => children,
}));

// Global test utilities
global.testUtils = {
  // Mock user data for testing
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'barangay_admin',
    barangay_code: '01280101',
  },

  // Mock resident data
  mockResident: {
    id: 'test-resident-id',
    first_name: 'Juan',
    middle_name: 'Cruz',
    last_name: 'Dela Cruz',
    suffix: null,
    birthdate: '1990-05-15',
    gender: 'male',
    civil_status: 'married',
    philsys_number: '1234-5678-9012',
    household_code: 'RRPPMMBBB-SSSS-TTTT-HHHH',
    family_position: 'head',
    is_labor_force: true,
    is_employed: true,
    is_senior_citizen: false,
    is_pwd: false,
  },

  // Mock household data
  mockHousehold: {
    id: 'test-household-id',
    code: 'RRPPMMBBB-SSSS-TTTT-HHHH',
    household_type: 'nuclear',
    total_members: 4,
    head_name: 'Juan Dela Cruz',
    barangay_code: '01280101',
  },

  // Common test props
  mockProps: {
    disabled: false,
    required: false,
    className: '',
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    onError: jest.fn(),
  },
};

// Console warnings and errors should fail tests in CI
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress expected warnings in tests
  console.error = (message, ...args) => {
    // Allow specific expected warnings
    const expectedWarnings = [
      'Warning: ReactDOM.render is deprecated',
      'Warning: An invalid form control',
      'Warning: validateDOMNesting',
      '[ERROR]', // Allow secure logger error messages
      'An update to %s inside a test was not wrapped in act(...)', // Allow React act warnings in tests
    ];

    if (
      typeof message === 'string' &&
      expectedWarnings.some(warning => message.includes(warning))
    ) {
      return;
    }

    originalError(message, ...args);

    // Fail tests on unexpected console errors in CI
    if (process.env.CI) {
      throw new Error(`Unexpected console.error: ${message}`);
    }
  };

  console.warn = (message, ...args) => {
    // Allow specific expected warnings
    const expectedWarnings = [
      'Warning: ReactDOM.render is deprecated',
      'PhilSys number format warning',
      "Color token 'invalid.path' not found. Using fallback.",
      "Color token 'invalid.color' not found. Using fallback.",
    ];

    if (
      typeof message === 'string' &&
      expectedWarnings.some(warning => message.includes(warning))
    ) {
      return;
    }

    originalWarn(message, ...args);

    // Fail tests on unexpected console warnings in CI
    if (process.env.CI) {
      throw new Error(`Unexpected console.warn: ${message}`);
    }
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock window.matchMedia for responsive components (in jsdom only)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
