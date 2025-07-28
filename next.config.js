/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['supabase.co', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: false, // Enable type checking for better error detection
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint for better code quality
  },
  swcMinify: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
  },
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
  compress: process.env.NODE_ENV === 'production',
  poweredByHeader: false,
}

module.exports = nextConfig
