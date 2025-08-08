/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-require-imports */
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const nextConfig = {
  eslint: {
    // Ignore ESLint during builds to prevent warnings from failing deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checks enabled for actual errors
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  // Remove standalone output for Vercel deployment
  poweredByHeader: false,
  compress: true,

  // Build optimizations
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Environment variables for build
  env: {
    NEXT_PUBLIC_APP_NAME: 'RBI System',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || require('./package.json').version,
  },
  // Serve Storybook at /storybook path
  async rewrites() {
    return [
      {
        source: '/storybook',
        destination: '/storybook-static/index.html',
      },
      {
        source: '/storybook/:path*',
        destination: '/storybook-static/:path*',
      },
    ];
  },
  // Exclude Storybook files from build
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.stories\.(js|jsx|ts|tsx|mdx)$/,
      use: 'ignore-loader',
    });

    // Add bundle analyzer plugin when ANALYZE=true
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    // Webpack optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Tree shaking improvements
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    return config;
  },
  // Use default page extensions but exclude stories files via webpack
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;
