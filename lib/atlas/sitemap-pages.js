// Sitemap entries for the Atlas data pages.
//
// The files are split by language and by surface rather than by family,
// because surface is the unit the cohort metrics are read at: if the tools
// pages index at half the rate of the move pages, a per surface file says so
// from the crawl log without anybody joining two datasets together.
//
// Nothing here can list a page that is not in the manifest, for the same
// reason nothing can serve one. The manifest is the single statement of what
// is published, and the sitemap, the routes and QA all read it.

import { pages } from './serve-pages.js';

const PREFIX = 'atlas-pages-';

export const idFor = (locale, surface) => PREFIX + locale + '-' + surface;

export function sitemapIds() {
  const ids = new Set();
  for (const p of pages()) ids.add(idFor(p.locale, p.surface));
  return [...ids].sort().map((id) => ({ id }));
}

export const isPagesSitemap = (id) => String(id || '').startsWith(PREFIX);

// Entries for one file. Priority follows measured demand rather than being a
// constant, because a sitemap that gives every page the same priority gives a
// crawler no information at all. The scale is bounded and coarse on purpose:
// it ranks pages within the site and claims nothing beyond that.
export function sitemapEntries(id, { absolute, lastModified }) {
  if (!isPagesSitemap(id)) return [];
  const rest = String(id).slice(PREFIX.length);
  const cut = rest.lastIndexOf('-');
  if (cut < 1) return [];
  const locale = rest.slice(0, cut);
  const surface = rest.slice(cut + 1);

  const rows = pages().filter((p) => p.locale === locale && p.surface === surface);
  if (!rows.length) return [];
  const top = Math.max(...rows.map((p) => p.volume || 0), 1);

  return rows.map((p) => ({
    url: absolute(p.path),
    lastModified,
    // Annual statistics change once a year. Saying weekly would be a claim
    // the data does not support and a crawler learns to ignore.
    changeFrequency: 'monthly',
    priority: Math.round((0.4 + 0.5 * (Math.log10((p.volume || 0) + 1) / Math.log10(top + 1))) * 100) / 100,
    alternates: p.alternates?.length
      ? {
        languages: Object.fromEntries(p.alternates
          .filter((a) => a.hreflang !== 'x-default')
          .map((a) => [a.hreflang, a.href])),
      }
      : undefined,
  }));
}
