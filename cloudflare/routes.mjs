// The Cloudflare Worker routes that send Atlas traffic, and only Atlas traffic, to the
// production Worker.
//
// GENERATED, NOT WRITTEN. A hand-kept list of ~100 localised path prefixes is a list that
// drifts from the URLs the moment a segment is added. So the routes are derived from the
// same vocabulary that builds the URLs — ATLAS_SEGMENTS in lib/atlas/atlas-urls.js, the
// legacy SEGMENTS in lib/atlas/i18n.js — restricted to the languages the exported dataset
// actually publishes. tests/atlas-cloudflare-routes.test.mjs proves the list both ways:
// every published Atlas URL matches a route, and no URL of the rest of livdar.com does.
//
// WHY PER-SEGMENT PREFIXES AND NOT livdar.com/*. Routing the whole host through the
// Worker and proxying the rest to the origin would make the Atlas Worker the front door of
// the eSIM site: every eSIM request a Worker invocation, billed, and a single point of
// failure for pages it has nothing to do with. Cloudflare route patterns allow a wildcard
// only at the end of the path, so "/{lang}/*" is not an option either: it would take the
// eSIM pages in that language. One route per (language, segment) is the narrowest shape
// that covers the Atlas.
//
// Each pattern ends in "/*" after the segment, so /de/wetter/... is matched and
// /de/wetterbericht (a hypothetical eSIM path) is not. A path without the trailing slash
// (/de/wetter/muenchen) is still matched, and the Worker answers it with the same 308 to
// the slashed URL that Next.js's trailingSlash:true produced.
//
// Usage: node cloudflare/routes.mjs [--host livdar.com] [--out cloudflare/routes.production.json]

import { writeFile, readFile } from 'node:fs/promises';
import { ATLAS_SEGMENTS } from '../lib/atlas/atlas-urls.js';
import { SEGMENTS as LEGACY_SEGMENTS, LOCALES as LEGACY_LOCALES } from '../lib/atlas/i18n.js';

export const ASSET_PREFIX = '/_atlas/';
export const SITEMAP_PREFIX = '/sitemap/atlas-';

/** The route patterns for one host, from the vocabulary and the dataset's locales. */
export function atlasRoutes({ host = 'livdar.com', locales }) {
  if (!Array.isArray(locales) || !locales.length) throw new Error('atlasRoutes needs the locales the dataset publishes');
  const prefixes = new Set();
  for (const lang of locales) {
    for (const byLang of Object.values(ATLAS_SEGMENTS)) {
      if (byLang[lang]) prefixes.add('/' + lang + '/' + byLang[lang] + '/');
    }
    // The crawl directory and the country hubs under it.
    prefixes.add('/' + lang + '/atlas/');
  }
  // The legacy registry generation (/en/cities/..., /de/staedte/...). Its locales are its
  // own, not the dataset's: it publishes in en and de, and ro and the airport segments are
  // routed too so that the Atlas answers for every path the Atlas owns.
  for (const lang of LEGACY_LOCALES) {
    for (const byLang of Object.values(LEGACY_SEGMENTS)) prefixes.add('/' + lang + '/' + byLang[lang] + '/');
  }
  const patterns = [...prefixes].sort().map((p) => host + p + '*');
  patterns.push(host + SITEMAP_PREFIX + '*');
  patterns.push(host + ASSET_PREFIX + '*');
  return patterns;
}

/**
 * Cloudflare's route matching, for the test: the host must match exactly (no leading
 * wildcard is used here) and the path must start with the pattern's path before its
 * trailing "*". Query strings are not part of the match.
 */
export function matches(patterns, url) {
  const u = new URL(url);
  return patterns.some((p) => {
    const slash = p.indexOf('/');
    const host = p.slice(0, slash);
    const path = p.slice(slash);
    if (host !== u.hostname) return false;
    return path.endsWith('*') ? u.pathname.startsWith(path.slice(0, -1)) : u.pathname === path;
  });
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
  const host = argOf('host', 'livdar.com');
  const out = argOf('out', 'cloudflare/routes.production.json');
  const manifest = JSON.parse(await readFile(argOf('dir', '.atlas-cloudflare-export') + '/manifest.json', 'utf8'));
  const patterns = atlasRoutes({ host, locales: manifest.locales });
  await writeFile(out, JSON.stringify({ host, worker: 'livdar-atlas', locales: manifest.locales, count: patterns.length, patterns }, null, 1) + '\n');
  console.log(JSON.stringify({ host, routes: patterns.length, out }));
}
