/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compression for production
  compress: process.env.NODE_ENV === 'production',

  // Image configuration
  images: {
    domains: ['localhost', 'blackbird-production.up.railway.app'],
  },

  // Build error handling
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Enable SWC minification
  swcMinify: true,

  // API headers configuration
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
