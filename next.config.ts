import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
});

const nextConfig: NextConfig = {
  /* Turbopack for dev, webpack for build (Serwist doesn't support Turbopack) */
  /* See: https://github.com/serwist/serwist/issues/54 */
  turbopack: {},
};

export default withSerwist(nextConfig);
