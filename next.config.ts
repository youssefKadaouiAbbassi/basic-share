import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
});

const nextConfig: NextConfig = {
  /* Turbopack disabled for build - Serwist doesn't support it yet */
  /* See: https://github.com/serwist/serwist/issues/54 */
  /* Using --webpack flag in build script */
};

export default withSerwist(nextConfig);
