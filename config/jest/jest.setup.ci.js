/**
 * Jest Setup - CI Environment
 * CI-specific test setup with comprehensive validation
 */

// Strict error handling in CI
const originalError = console.error;
console.error = (...args) => {
  originalError(...args);

  // Fail tests on React errors in CI
  const message = args[0]?.toString() || '';
  if (message.includes('Warning:') || message.includes('Error:')) {
    throw new Error(`Console error in CI: ${message}`);
  }
};

// Set CI environment variables
process.env.NODE_ENV = 'test';
process.env.CI = 'true';
process.env.NEXT_PUBLIC_APP_ENV = 'ci';

// Configure test timeout for CI
jest.setTimeout(30000);

// Mock browser APIs not available in CI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Comprehensive Supabase mock for CI
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      containedBy: jest.fn().mockReturnThis(),
      rangeGt: jest.fn().mockReturnThis(),
      rangeGte: jest.fn().mockReturnThis(),
      rangeLt: jest.fn().mockReturnThis(),
      rangeLte: jest.fn().mockReturnThis(),
      rangeAdjacent: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Track test performance in CI
const testStartTimes = new Map();

beforeEach(() => {
  testStartTimes.set(expect.getState().currentTestName, Date.now());
});

afterEach(() => {
  const testName = expect.getState().currentTestName;
  const startTime = testStartTimes.get(testName);
  if (startTime) {
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      // 5 second threshold
      console.warn(`⚠️ Slow test detected: ${testName} (${duration}ms)`);
    }
    testStartTimes.delete(testName);
  }
});
