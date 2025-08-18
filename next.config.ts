import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for better development practices
  reactStrictMode: true,
  
  // Optimize images
  images: {
    domains: ['lh3.googleusercontent.com'], // Allow Google profile images
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
