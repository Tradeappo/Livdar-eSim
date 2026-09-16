// Which markets are published, and why.
//
// This used to be a boolean on each row of the LOCALES table, set by hand. That
// worked while there were three markets and it is exactly the kind of thing
// that rots: a locale could be flagged live before its pages existed, or stay
// flagged false after they arrived. The flag described an intention rather than
// a fact.
//
// A market is published here when it can actually serve a complete site: a home
// page, at least one destination, at least one guide, at least one region, the
// compatibility page, and both legal pages. Miss any of those and the market is
// not offered anywhere: not in the language selector, not in hreflang, not in
// the sitemap, not in the routing tree.
//
// The consequence is the useful part. Adding a market is adding its content.
// Nothing else has to be switched on, and nothing can be switched on early.

import { LOCALES } from './i18n.js';
import { missingForPublication, REQUIRED_FOR_PUBLICATION } from './content/index.js';

export { REQUIRED_FOR_PUBLICATION, missingForPublication };

export function isPublished(locale) {
  return missingForPublication(locale).length === 0;
}

// Every locale the infrastructure knows about, with its publication state. This
// is what the language selector, the quality gate and the roadmap all read, so
// none of them can disagree with each other.
export function marketStatus() {
  return LOCALES.map((l) => {
    const missing = missingForPublication(l.code);
    return {
      code: l.code,
      hreflang: l.hreflang,
      name: l.name,
      endonym: l.endonym,
      dir: l.dir,
      currency: l.currency,
      published: missing.length === 0,
      missing,
    };
  });
}

export function publishedMarkets() {
  return marketStatus().filter((m) => m.published);
}

export function publishedMarketCodes() {
  return publishedMarkets().map((m) => m.code);
}

export function pendingMarkets() {
  return marketStatus().filter((m) => !m.published);
}
