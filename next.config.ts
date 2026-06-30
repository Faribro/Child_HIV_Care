import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native SWC bindings not available on this machine — webpack is used instead.
  // The --webpack flag is set in package.json scripts.
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
