import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // Remove console.log in production, but keep errors/warnings
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Production-ready optimizations
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
