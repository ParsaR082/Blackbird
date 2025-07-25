/** @type {import('next').NextConfig} */
const nextConfig = {
  // حذف output: 'standalone'
  // حذف staticPageGenerationTimeout
  images: {
    unoptimized: true,
    domains: ['supabase.co', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // حذف experimental
  swcMinify: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    CSRF_SECRET: process.env.CSRF_SECRET,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  compress: process.env.NODE_ENV === 'production',
  poweredByHeader: false,
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })

module.exports = withBundleAnalyzer(nextConfig)
