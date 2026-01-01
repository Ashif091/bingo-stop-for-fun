import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack warnings about root directory
  experimental: {
    // Using custom server with Socket.io
  },
};

export default nextConfig;
