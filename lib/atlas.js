// Livdar Atlas: a separate project (repo livdar-atlas, its own Vercel project)
// that serves data driven city, weather and airport pages under six reserved
// path prefixes on livdar.com. This file is the whole contract on the eSIM side.
//
// Nothing changes on livdar.com until ATLAS_ORIGIN is set in the Vercel project.
// Unset it and every rule below disappears on the next deploy: that is the
// rollback. No eSIM path is shadowed; tests/atlas-routing.test.mjs proves it.

export const ATLAS_PREFIXES = [
  '/en/cities', '/en/airports',
  '/de/staedte', '/de/flughaefen',
  '/ro/orase', '/ro/aeroporturi',
];

export function atlasOrigin() {
  const o = (process.env.ATLAS_ORIGIN || '').trim().replace(/\/+$/, '');
  return /^https:\/\/[a-z0-9.-]+$/i.test(o) ? o : null;
}

export function atlasRewrites(origin = atlasOrigin()) {
  if (!origin) return [];
  return ATLAS_PREFIXES.flatMap((p) => [
    { source: p + '/', destination: origin + p + '/' },
    { source: p + '/:path*', destination: origin + p + '/:path*/' },
  ]).concat([
    { source: '/sitemap-atlas.xml', destination: origin + '/sitemap-atlas.xml' },
    { source: '/sitemap-atlas/:file', destination: origin + '/sitemap-atlas/:file' },
    { source: '/_atlas/:path*', destination: origin + '/_atlas/:path*' },
  ]);
}
