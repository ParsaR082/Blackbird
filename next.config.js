/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable standalone for testing
  // output: 'standalone',
  
  // Enable compression for production
  compress: process.env.NODE_ENV === 'production',
  
  // Configure image domains
  images: {
    domains: ['localhost', 'blackbird-portal.railway.app'],
  },
  
  // Don't ignore build errors for TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Disable instrumentation in production to prevent clientModules error
  experimental: {
    instrumentationHook: false,
  },
  
  // Configure headers for API routes
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