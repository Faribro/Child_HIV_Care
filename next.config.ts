import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Cache compilation data in memory instead of slow disk writes
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
