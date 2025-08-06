/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔧 Standalone output is disabled intentionally (normal build for Docker)
  // Do NOT enable 'standalone' unless you plan to copy .next/standalone in Docker

  // ✅ Enable compression in production
  compress: process.env.NODE_ENV === 'production',

  // ✅ Allowed external image sources
  images: {
    domains: ['localhost', 'blackbird-portal.railway.app'],
  },

  // ✅ Strict mode for build (disable skipping errors)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ✅ Use SWC for faster and smaller builds
  swcMinify: true,

  // ✅ Prevent build-time crash from clientModules bug
  experimental: {
    instrumentationHook: false,
    // 👇 OPTIONAL: disable serverActions if you don’t use them
    // serverActions: false
  },

  // ✅ Set headers for API routes (like no-cache)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
