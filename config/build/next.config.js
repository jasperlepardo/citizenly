// Allow turning PWA on/off to isolate build issues
const isPWAEnabled = process.env.ENABLE_PWA === 'true';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Disable PWA unless explicitly enabled to avoid build failures
  disable: process.env.NODE_ENV !== 'production' || !isPWAEnabled,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      // API Data with NetworkFirst strategy for dynamic content
      {
        urlPattern: /^https?:\/\/[^\/]+\/api\/(residents|households|dashboard)/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-data',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 60, // 30 minutes
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          networkTimeoutSeconds: 5,
        },
      },
      // Static data with CacheFirst for geographic/reference data
      {
        urlPattern: /^https?:\/\/[^\/]+\/api\/(psgc|psoc|addresses)/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-reference-data',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Auth-related APIs with NetworkFirst but shorter cache
      {
        urlPattern: /^https?:\/\/[^\/]+\/api\/(auth|user)/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'auth-data',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          networkTimeoutSeconds: 3,
        },
      },
      // Images with CacheFirst for better performance
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-assets',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
      // Fonts with CacheFirst
      {
        urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'font-assets',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // CSS and JS with StaleWhileRevalidate
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      // External resources (Google Fonts, CDNs)
      {
        urlPattern: /^https?:\/\/fonts\.(googleapis|gstatic)\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      // CDN resources
      {
        urlPattern: /^https?:\/\/[^\/]*cdnjs\.cloudflare\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-assets',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  experimental: {
    // Keep empty until packages using it are installed
    optimizePackageImports: [],
  },

  // Suppress specific React warnings in development
  env: {
    // This helps suppress the OuterLayoutRouter key warning
    SUPPRESS_LAYOUT_ROUTER_KEY_WARNING: 'true',
  },

  webpack: config => {
    // Bundle Analysis (if ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analysis.html',
        })
      );
    }

    return config;
  },

  // Production Security Headers
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];

    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Needed for Next.js
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' *.supabase.co *.supabase.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // HSTS (only in production)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // Performance budgets
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = isPWAEnabled ? withPWA(nextConfig) : nextConfig;
