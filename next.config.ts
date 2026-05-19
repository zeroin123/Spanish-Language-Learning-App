import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to bundle the SQLite database file into serverless functions
  outputFileTracingIncludes: {
    '/**': ['./data/**'],
  },
};

export default nextConfig;
