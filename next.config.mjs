import { readFileSync } from 'node:fs';

// Scope the Atlas data tracing per route. Keys are matched with
// picomatch({ dot: true, contains: true }) against the normalized route and the
// includes of every matching key are combined, so:
//   '\\[lang\\]'  adds the small shared data to every /[lang]/... page and to
//                  nothing under /api or the static routes (Fix B), and
//   '/<segment>/' adds only that route's own group shard.
// A page's hreflang cluster is wholly inside one group (FAMILY_SEGMENT), so this
// split keeps alternates complete. The whole-Atlas consumers (the /[lang]/atlas
// directory, the sitemap and robots, which enumerate every page) get every shard.
// If the shards have not been generated (e.g. `next dev` without the prebuild
// step) it falls back to the previous safe-but-heavy single include.
function atlasTracingIncludes() {
  const SMALL = [
    './data/atlas/registry.json',
    './data/atlas/slugs.json',
    './data/atlas/manifest.json',
    './data/atlas/cohorts/by-group/languages.json',
  ];
  const ENTITIES = './data/atlas/entities/**';
  let seg;
  try {
    seg = JSON.parse(readFileSync(new URL('./data/atlas/cohorts/by-group/segment-groups.json', import.meta.url), 'utf8'));
  } catch {
    return { '/**': [ENTITIES, './data/atlas/cohorts/*-pages.json', ...SMALL] };
  }
  const shard = (g) => './data/atlas/cohorts/by-group/' + g + '-pages.json';
  const ALL = seg.groups.map(shard);
  const inc = {
    // languages.json (2 KB) everywhere, so languagesServed() (called by the
    // header/footer on every page) can never resolve a missing file to a 500.
    '/**': ['./data/atlas/cohorts/by-group/languages.json'],
    // entities + small shared data for every localized route; not /api or static.
    '\\[lang\\]': [ENTITIES, ...SMALL],
    // whole-Atlas consumers need every group shard.
    '/atlas': ALL,
    sitemap: [...ALL, ENTITIES, ...SMALL],
    robots: [...ALL, ENTITIES, ...SMALL],
  };
  // each Atlas data route carries only its own group's page shard.
  for (const [segment, group] of Object.entries(seg.segToGroup)) {
    inc['/' + segment + '/'] = [shard(group)];
  }
  return inc;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: true,
  // Atlas data is read from disk at request time and cannot be traced from a
  // runtime-built path, so it is listed explicitly. It used to be a single
  // '/**' include that copied the whole ~68 MB cohort set into every function;
  // it is now scoped per route by atlasTracingIncludes() (above), so a route
  // carries only the group shard it serves. serve-pages.js still throws rather
  // than serving an empty cohort if a shard is missing from the bundle.
  outputFileTracingIncludes: atlasTracingIncludes(),
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
