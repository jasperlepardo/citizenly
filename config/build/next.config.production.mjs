/** @type {import('next').NextConfig} */

// Bundle analyzer
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? (await import('@next/bundle-analyzer')).default({ enabled: true })
  : (config) => config;

const nextConfig = {
  // Core optimizations
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    optimizePackageImports: [
      '@tanstack/react-query',
      'lodash',
      'date-fns',
      'lucide-react',
    ],
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // Compression and caching
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: process.env.NODE_ENV === 'production' ? ['your-domain.com'] : ['localhost'],
  },

  // Asset optimization
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
            // React Query chunk
            reactQuery: {
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
              name: 'react-query',
              chunks: 'all',
              priority: 20,
            },
            // UI components chunk
            ui: {
              test: /[\\/]src[\\/]components[\\/](atoms|molecules)[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      };
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Tree shaking for production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'lodash': 'lodash-es',
      };
    }

    return config;
  },

  // Environment-specific settings
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString(),
    NEXT_RUNTIME: 'nodejs',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects and rewrites for SEO
  async redirects() {
    return [
      // Add permanent redirects here
      {
        source: '/old-path/:slug*',
        destination: '/new-path/:slug*',
        permanent: true,
      },
    ];
  },

  // Environment-specific configurations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
    output: 'standalone',
    reactStrictMode: true,
  }),

  // Development-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: false, // Disable for development to avoid double API calls
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 5,
    },
  }),

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Instrumentation
  ...(process.env.ENABLE_INSTRUMENTATION === 'true' && {
    experimental: {
      instrumentationHook: true,
    },
  }),
};

export default withBundleAnalyzer(nextConfig);