import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/engines'],
  },
};

export default nextConfig;
