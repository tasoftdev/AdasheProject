import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    dangerouslyAllowSVG: true,
    unoptimized: false,
  },
  serverExternalPackages: ['@prisma/client'],
};


export default nextConfig;
