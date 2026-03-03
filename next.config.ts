import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

// Base configuration with turbopack root setting
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

  // ✅ Explicitly set the Turbopack root to your project directory
  turbopack: {
    root: process.cwd(), // uses the current working directory (your project)
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