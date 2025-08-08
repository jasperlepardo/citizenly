/**
 * ESLint Configuration - Development Environment
 * Relaxed rules for faster feedback during development
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const baseConfig = require('./.eslintrc.js');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // Relax TypeScript any warnings in development
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',

    // Allow console logs in development
    'no-console': 'off',

    // Relax React hook dependency warnings
    'react-hooks/exhaustive-deps': 'warn',

    // Allow unescaped entities for faster development
    'react/no-unescaped-entities': 'warn',

    // Relax import rules
    'import/no-unresolved': 'warn',
  },

  settings: {
    ...baseConfig.settings,
    // Development-specific settings
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
