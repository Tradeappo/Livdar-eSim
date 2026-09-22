import { atlasRewrites } from './lib/atlas.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Livdar Atlas routes, forwarded before any eSIM route is matched. Empty
  // unless ATLAS_ORIGIN is set (see lib/atlas.js).
  async rewrites() {
    return { beforeFiles: atlasRewrites(), afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [
      { source: '/esim', destination: '/en/esim/', permanent: true },
      { source: '/guides', destination: '/en/guides/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
