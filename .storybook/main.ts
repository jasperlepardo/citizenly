import type { StorybookConfig } from '@storybook/nextjs';
import { join } from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Design system tokens stories
    '../src/design-system/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.js',
    },
  },
  features: {
    experimentalRSC: true,
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
