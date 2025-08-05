/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  // Environment variables for build
  env: {
    NEXT_PUBLIC_APP_NAME: 'RBI System',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
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
    ]
  },
  // Exclude Storybook files from build
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.stories\.(js|jsx|ts|tsx|mdx)$/,
      use: 'ignore-loader',
    })
    return config
  },
  // Exclude Storybook files and directories
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('stories')),
}

module.exports = nextConfig