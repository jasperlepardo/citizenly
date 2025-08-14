/**
 * ESLint Configuration - CI Environment
 * Strict rules for comprehensive validation in CI/CD
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const baseConfig = require('./.eslintrc.json');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // Strict TypeScript rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',

    // No console logs in CI
    'no-console': ['error', { allow: ['warn', 'error'] }],

    // Strict React hook dependencies
    'react-hooks/exhaustive-deps': 'error',

    // Require proper JSX escaping
    'react/no-unescaped-entities': 'error',

    // Strict import rules
    'import/no-unresolved': 'error',

    // Additional strict rules for CI
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],

    // Accessibility requirements
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
  },

  // Additional plugins for CI validation
  plugins: [
    ...baseConfig.plugins,
    // Add security plugin if available
    // 'security'
  ],

  extends: [
    ...baseConfig.extends,
    // Add stricter configurations
    // 'plugin:security/recommended'
  ],

  settings: {
    ...baseConfig.settings,
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
};
