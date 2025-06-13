import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Enable experimental features if needed
  },
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL:
      process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8000",
  },
};

export default nextConfig;
