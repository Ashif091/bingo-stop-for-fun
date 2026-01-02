import type { NextConfig } from "next";
// @ts-expect-error - next-pwa doesn't have types
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Use webpack instead of Turbopack for compatibility with next-pwa
  // This is empty but forces Next.js to use webpack
  webpack: (config) => {
    return config;
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
});

export default pwaConfig(nextConfig);
