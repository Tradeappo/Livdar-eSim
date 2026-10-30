// Feature-flagged on-demand ISR for the Atlas data routes.
//
// DEFAULT OFF. With the flag unset, ON_DEMAND is false, seedFrom() returns the
// full parameter list and the routes export dynamicParams=false, so a build is
// byte-for-byte what it is today: all 6,500 pages prerendered. Production is
// unaffected until the flag is deliberately turned on.
//
// With ATLAS_ONDEMAND=1, only a small seed of each segment is prebuilt and the
// rest of the catalogue renders on first request, then is held in the ISR cache
// for `revalidate` seconds. Nothing about a page's URL, metadata, canonical,
// hreflang, structured data or sitemap entry changes: the same route renderer
// and the same serve-pages lookup run whether a page was seeded or built on
// demand, so a lazily built page returns the identical HTML with HTTP 200. The
// sitemap and hreflang enumerate serve-pages.pages() independently of the
// prerender strategy, so they stay complete either way.
//
// The seed is deliberately a plain "first N of the segment" here so the
// prototype has no new data dependency. SEED_RANK is the single hook to swap in
// demand-ranked seeding later (top pages by GSC clicks/impressions from the data
// already under data/atlas/measurements/) without touching the routes.

export const ON_DEMAND = process.env.ATLAS_ONDEMAND === '1';

// Pages prebuilt per segment when the flag is on. Small on purpose: the whole
// point is that the long tail is not in the build.
export const SEED_SIZE = Number(process.env.ATLAS_ONDEMAND_SEED || 10);

// Optional ranker: (paramsForSegment) => orderedParams. Left as identity for the
// prototype; a later change points this at the GSC-demand ordering.
export const SEED_RANK = (params) => params;

export function seedFrom(params) {
  if (!ON_DEMAND) return params;
  return SEED_RANK(params).slice(0, SEED_SIZE);
}
