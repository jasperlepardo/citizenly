import type { StorybookConfig } from '@storybook/nextjs-vite';
import { join } from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/stories/**/*.mdx',
  ],
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
  // Use absolute path for static directories
  staticDirs: [join(__dirname, '..', 'public')],
  async viteFinal(config) {
    // Ensure React is available globally
    config.define = {
      ...config.define,
      global: 'globalThis',
    };

    // Make sure React is available in the global scope
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [...(config.optimizeDeps?.include ?? []), 'react', 'react-dom', '@storybook/blocks'],
    };

    // Configure Node.js polyfills for browser environment
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': join(__dirname, '../src'),
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

    // Configure Rollup options to properly handle Storybook modules
    const existingExternal = config.build?.rollupOptions?.external;
    const externalArray: string[] = [];

    if (Array.isArray(existingExternal)) {
      externalArray.push(...existingExternal.filter(ext => typeof ext === 'string'));
    } else if (typeof existingExternal === 'string') {
      externalArray.push(existingExternal);
    }

    config.build = {
      ...config.build,
      rollupOptions: {
        ...config.build?.rollupOptions,
        external: (id: string) => {
          // Allow Storybook's own modules but externalize addon imports
          if (
            id.includes('@storybook/') &&
            (id.includes('blocks') ||
              id.includes('test') ||
              id.includes('addon-actions') ||
              id.includes('addon-controls') ||
              id.includes('testing-library'))
          ) {
            return true;
          }
          // Check existing external config
          if (Array.isArray(existingExternal)) {
            return existingExternal.some(ext => {
              if (typeof ext === 'string') return ext === id;
              if (ext instanceof RegExp) return ext.test(id);
              if (typeof ext === 'function') return ext(id, undefined, false);
              return false;
            });
          } else if (typeof existingExternal === 'string') {
            return existingExternal === id;
          } else if (existingExternal instanceof RegExp) {
            return existingExternal.test(id);
          } else if (typeof existingExternal === 'function') {
            return existingExternal(id, undefined, false);
          }
          return false;
        },
      },
    };

    return config;
  },
};
export default config;
