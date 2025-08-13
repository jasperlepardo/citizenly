import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.tsx'],
    include: ['src/**/*.{test,spec}.{js,ts,tsx}', 'src/**/__tests__/**/*.{js,ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec,stories}.{js,ts,tsx}',
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/tests/**',
        'src/storybook/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Service layer should have higher coverage
        'src/services/**': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
