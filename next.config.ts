import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles above the repo.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
