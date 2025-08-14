/**
 * Jest Setup - Development Environment
 * Development-specific test setup and mocks
 */

// Suppress console warnings in development tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out known development warnings
  const message = args[0]?.toString() || '';

  // Suppress React development warnings
  if (message.includes('Warning: ReactDOM.render is deprecated')) {
    return;
  }

  // Suppress prop type warnings in development
  if (message.includes('Warning: Failed prop type')) {
    return;
  }

  // Call original warn for other messages
  originalWarn(...args);
};

// Mock environment variables for development
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_ENV = 'development';

// Mock heavy modules for faster tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

// Mock Chart.js for development tests
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Fast mock for Supabase in development
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));
