import type { StorybookConfig } from '@storybook/nextjs';
import { join } from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/stories/**/*.mdx',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  // Use absolute path for static directories
  staticDirs: [join(__dirname, '..', 'public')],
  webpackFinal: async (config: any) => {
    // Configure webpack to resolve @ alias
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': join(__dirname, '../src'),
      },
    };
    return config;
  },
};
export default config;
