import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — a stray lockfile in the home directory otherwise
  // makes Next infer the wrong root for output file tracing (breaks Vercel).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
