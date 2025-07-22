/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway-specific optimizations
  output: 'standalone',
  
  images: {
    domains: ['supabase.co', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    unoptimized: true, // Set to true for Railway deployment
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features configuration
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'mongoose'],
    // Exclude problematic files from tracing
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
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
}

module.exports = nextConfig
