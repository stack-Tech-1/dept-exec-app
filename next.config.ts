// C:\Users\SMC\Documents\GitHub\dept-exec-app\next.config.ts
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

// Base configuration without PWA (for development)
const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // ✅ Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

// Only add PWA configuration in production
if (isProduction) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });
  
  // Apply PWA plugin to config
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}