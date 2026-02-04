import { withSerwist } from '@serwist/turbopack';
import type { NextConfig } from 'next';

/**
 * Next.js configuration with PWA support via Serwist
 *
 * Serwist provides native Turbopack integration for service worker
 * generation without requiring webpack. Configuration is kept minimal
 * to avoid over-engineering.
 */
const nextConfig: NextConfig = {
  // Native Turbopack support via @serwist/turbopack
  // All PWA configuration is handled by withSerwist wrapper
};

export default withSerwist(nextConfig);
