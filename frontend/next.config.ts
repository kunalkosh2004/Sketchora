import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output lets the Docker image run without `next start`.
  output: "standalone",
};

export default nextConfig;
