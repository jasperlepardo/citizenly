/** @type {import('jest').Config} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: path.resolve(__dirname, '../../'),
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Root directory for Jest
  rootDir: path.resolve(__dirname, '../../'),
  
  // Setup files to run before tests
  // Default setup for jsdom tests
  setupFilesAfterEnv: ['<rootDir>/config/jest/jest.setup.js'],
  // Allow per-test overrides for node environment to bypass window-dependent setup
  setupFiles: [],

  // Test environment
  // Use jsdom globally, but allow per-file overrides (we set node env in API tests via file annotation)
  testEnvironment: 'jsdom',

  // Module path mapping to handle Next.js absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
  ],

  // Files to ignore during testing
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    '<rootDir>/build/',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Coverage settings - focus on core business logic
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/app/**/*.{js,jsx,ts,tsx}', // Exclude Next.js app directory files
    '!src/components/atoms/**/*.{js,jsx,ts,tsx}', // Exclude atomic UI components during development
    '!src/components/molecules/**/*.{js,jsx,ts,tsx}', // Exclude molecular UI components during development
    '!src/middleware.ts', // Exclude Next.js middleware
  ],

  // Coverage thresholds - temporarily disabled during development
  // Will be re-enabled when test coverage improves
  // coverageThreshold: {
  //   // Design system with tests should maintain high coverage
  //   'src/design-system/utils.ts': {
  //     branches: 80,
  //     functions: 85,
  //     lines: 85,
  //     statements: 85,
  //   },
  //   // Lib utils should have high coverage
  //   'src/lib/utils.ts': {
  //     branches: 90,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Global test timeout (30 seconds)
  testTimeout: 30000,

  // Maximum number of concurrent workers
  maxWorkers: '50%',

  // Pass with no tests - allows CI to succeed when no test files exist
  passWithNoTests: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
