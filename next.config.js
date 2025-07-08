/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway-specific optimizations
  output: 'standalone',
  
  images: {
    domains: ['supabase.co', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'mongoose'],
  },
  
  // Optimize for Railway deployment
  swcMinify: true,
  
  // Environment-specific configurations
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  
  // Disable static optimization for pages that use API routes with cookies/headers
  async rewrites() {
    return []
  },
  
  // Ensure API routes are treated as dynamic
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
    ]
  },
  
  // Railway webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize for Railway's build environment
    if (isServer) {
      config.externals.push('mongodb', 'mongoose')
    }
    
    return config
  },
}

module.exports = nextConfig 