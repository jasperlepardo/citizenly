import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.storybook/**',
      '**/coverage/**',
      '**/public/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.stories.*',
      '**/*.story.*',
      '**/stories/**',
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      '@next/next/no-img-element': 'warn',
      'import/no-anonymous-default-export': 'warn',

      // Production readiness rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',

      // File naming and organization rules
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      // Prevent common TypeScript issues
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off', // Disabled due to parser config issue
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disabled due to parser config issue
      '@typescript-eslint/prefer-optional-chain': 'off', // Disabled due to parser config issue

      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-alert': 'warn', // Downgraded from error to warning for legitimate confirm() usage
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Specific rules for lib files to enforce naming conventions
  {
    files: ['src/lib/**/*.ts', 'src/lib/**/*.tsx'],
    rules: {},
  },

  // Disable rules for story files
  {
    files: ['**/*.stories.*', '**/*.story.*'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Relax rules for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-script-url': 'off',
    },
  },

  // Allow console usage in scripts
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
