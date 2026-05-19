import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't bundle node:sqlite — it's a Node built-in, load at runtime
  serverExternalPackages: ['node:sqlite'],

  // Bundle the SQLite DB file into every serverless function on Vercel
  outputFileTracingIncludes: {
    '/':               ['./data/**'],
    '/islands/[slug]': ['./data/**'],
    '/recall':         ['./data/**'],
    '/listen':         ['./data/**'],
    '/add':            ['./data/**'],
    '/pre-input':      ['./data/**'],
  },
};

export default nextConfig;
