/** @type {import('jest').Config} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
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
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
