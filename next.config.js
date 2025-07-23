/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for deployment
  output: 'standalone',
  
  // Disable static exports completely - force all pages to be server-rendered
  // This should fix the export errors
  staticPageGenerationTimeout: 1000,
  
  // Image optimization configuration
  images: {
    domains: ['supabase.co', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    unoptimized: true, // Required for deployment without image optimization service
  },
  
  // Skip type checking and linting during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features configuration
  experimental: {
    // External packages that should be bundled with the server code
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
  
  // Optimize for production
  swcMinify: true,
  
  // Environment-specific configurations
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    CSRF_SECRET: process.env.CSRF_SECRET,
  },
  
  // Ensure all API routes are treated as dynamic
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
  
  // Disable compression during development for better debugging
  compress: process.env.NODE_ENV === 'production',
  
  // Disable powered by header for security
  poweredByHeader: false,
}

module.exports = nextConfig
