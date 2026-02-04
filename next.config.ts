import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Native Turbopack support via @serwist/turbopack
};

export default withSerwist(nextConfig);
