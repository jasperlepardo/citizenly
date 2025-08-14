/**
 * Jest Configuration - CI Environment
 * Comprehensive testing configuration for CI/CD
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,

  // CI-specific settings
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/lib/dev-config.ts',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Comprehensive reporting
  coverageReporters: ['text', 'lcov', 'html', 'json', 'clover'],

  // CI optimizations
  ci: true,
  maxWorkers: 2, // Limited workers for CI stability
  cache: false, // Disable cache for clean CI runs

  // Verbose output for debugging
  verbose: true,
  silent: false,

  // Timeout for CI environment
  testTimeout: 30000, // 30 seconds

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/config/jest/jest.setup.js', '<rootDir>/config/jest/jest.setup.ci.js'],

  // Include all test types in CI
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.integration.test.{ts,tsx}',
  ],

  // Fail fast on CI for quick feedback
  bail: 1,

  // Additional reporters for CI
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
      },
    ],
  ],
};
