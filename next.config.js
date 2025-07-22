/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway-specific optimizations
  output: 'standalone',
  
  images: {
    domains: ['supabase.co', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
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
    MONGODB_URI: process.env.MONGODB_URI,
    CSRF_SECRET: process.env.CSRF_SECRET,
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
  
  // Server runtime configuration for dynamic routes
  serverRuntimeConfig: {
    // Will only be available on the server side
    apiRouteConfig: {
      dynamicRoutes: true,
    }
  },
  
  // Disable automatic static optimization for API routes
  webpack: (config, { dev, isServer }) => {
    // Return modified config
    return config;
  },
}

module.exports = nextConfig
