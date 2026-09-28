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
  //
  // The cohort manifests belong on this list for the same reason and were
  // missing from it, which cost the Atlas its whole first week. A build reads
  // them from the checkout, so all 500 pages prerendered and served
  // correctly; then `revalidate` came round a day later, the function looked
  // for a manifest that had never been copied next to it, found nothing, and
  // replaced each good page with a 404 as its turn came. Anything `pages()`
  // in lib/atlas/serve-pages.js opens has to be matched here, and
  // tests/atlas-function-bundle.test.mjs now fails if it is not.
  outputFileTracingIncludes: {
    '/**': [
      './data/atlas/entities/**',
      './data/atlas/cohorts/*-pages.json',
      './data/atlas/registry.json',
      './data/atlas/slugs.json',
      './data/atlas/manifest.json',
    ],
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
