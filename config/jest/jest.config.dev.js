/**
 * Jest Configuration - Development Environment
 * Fast testing configuration for development
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,

  // Development-specific settings
  collectCoverage: false, // Skip coverage for speed
  verbose: false, // Less verbose output
  silent: true, // Suppress test output for faster feedback

  // Performance optimizations
  maxWorkers: '50%', // Use half of available CPU cores
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Faster test execution
  testTimeout: 10000, // 10 seconds
  setupFilesAfterEnv: ['<rootDir>/config/jest/jest.setup.js', '<rootDir>/config/jest/jest.setup.dev.js'],

  // Watch mode optimizations
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],

  // Only test changed files in development
  onlyChanged: process.env.NODE_ENV === 'development',

  // Skip slow tests in development
  testPathIgnorePatterns: [
    ...(baseConfig.testPathIgnorePatterns || []),
    '<rootDir>/src/**/*.integration.test.(ts|tsx)',
    '<rootDir>/src/**/*.e2e.test.(ts|tsx)',
  ],
};
