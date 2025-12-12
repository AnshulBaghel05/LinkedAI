import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // We run tsc --noEmit separately, so skip during build to avoid memory issues
    ignoreBuildErrors: true,
  },
  // Exclude Bull from server component bundling (uses Node.js child_process and other Node APIs)
  serverExternalPackages: ['bull', 'ioredis'],
  // Turbopack configuration (required for Next.js 16)
  turbopack: {},
};

export default nextConfig;
