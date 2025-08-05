/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  // Remove standalone output for Vercel deployment
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
    ];
  },
  // Exclude Storybook files from build
  webpack: config => {
    config.module.rules.push({
      test: /\.stories\.(js|jsx|ts|tsx|mdx)$/,
      use: 'ignore-loader',
    });
    return config;
  },
  // Use default page extensions but exclude stories files via webpack
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;
