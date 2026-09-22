/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: true,
  // The Atlas entity store is read from disk at request time by shard, so the
  // shard files have to travel with the function. File tracing cannot see a
  // path built at runtime, which is why they are listed rather than imported:
  // importing them would pull thirty thousand records into every bundle,
  // which is the thing the sharding exists to avoid.
  outputFileTracingIncludes: {
    '/**': ['./data/atlas/entities/**', './data/atlas/registry.json', './data/atlas/slugs.json', './data/atlas/manifest.json'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
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
