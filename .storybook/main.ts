import type { StorybookConfig } from '@storybook/nextjs-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      builder: {
        viteConfigPath: undefined,
      },
    },
  },
  staticDirs: ['../public'],
  async viteFinal(config) {
    // Ensure React is available globally
    config.define = {
      ...config.define,
      global: 'globalThis',
    };

    // Make sure React is available in the global scope
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [...(config.optimizeDeps?.include ?? []), 'react', 'react-dom'],
    };

    // Configure Node.js polyfills for browser environment
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': resolve(__dirname, '../src'),
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        util: 'util',
        buffer: 'buffer',
        process: 'process/browser',
      },
    };

    config.define = {
      ...config.define,
      global: 'globalThis',
      'process.env': {},
    };

    return config;
  },
};
export default config;
