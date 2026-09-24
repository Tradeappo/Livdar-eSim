// Serving the Atlas data pages.
//
// The existing `serve.js` resolves the three eSIM era families out of the
// entity dataset. These families are different: their models are built ahead
// of time, checked by cohort QA and written to a manifest, so serving is a
// lookup rather than a build. That is deliberate. A page that is rendered
// from the same object QA inspected cannot drift from the object QA passed,
// and a request never triggers a recomputation of a country's statistics.
//
// Nothing here can serve a page that is not in the manifest. A URL under an
// Atlas segment that the cohort does not contain is a 404, not an empty
// page, because the alternative is a soft 404 on every combination somebody
// guesses.

import { readFileSync, existsSync } from 'node:fs';
import { ATLAS_SEGMENTS, FAMILY_SEGMENT } from './atlas-urls.js';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);
const MANIFEST = 'data/atlas/cohorts/cohort-001-pages.json';

let cache = null;
export function pages() {
  if (cache) return cache;
  const u = new URL(MANIFEST, ROOT);
  cache = existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')).pages : [];
  return cache;
}

let byPath = null;
function indexByPath() {
  if (byPath) return byPath;
  byPath = new Map(pages().map((p) => [p.path, p]));
  return byPath;
}

export function resetServeCache() { cache = null; byPath = null; }

// Which segment a language uses for a group, and the reverse. The reverse is
// what a request needs: the route file knows its own folder name and has to
// find out which group and language it belongs to.
export function groupOfSegment(lang, segment) {
  for (const [group, byLang] of Object.entries(ATLAS_SEGMENTS)) {
    if (byLang[lang] === segment) return group;
  }
  return null;
}

export const segmentFor = (group, lang) => ATLAS_SEGMENTS[group]?.[lang] || null;

// Resolve one request. The path is rebuilt from its parts and looked up
// exactly, so a trailing slash difference or an extra segment misses rather
// than matching loosely.
export function servePage(lang, segment, parts = []) {
  if (!groupOfSegment(lang, segment)) return null;
  const leaf = (parts || []).filter(Boolean);
  if (leaf.length !== 1) return null;
  const path = '/' + lang + '/' + segment + '/' + leaf[0] + '/';
  const model = indexByPath().get(path);
  if (!model) return null;
  return { model, path };
}

// Every path this segment serves, for build time generation. A page not in
// this list is not generated ahead of time and is not served on request
// either, which is the same statement made twice on purpose.
export function staticParamsFor(lang, segment) {
  const group = groupOfSegment(lang, segment);
  if (!group) return [];
  const prefix = '/' + lang + '/' + segment + '/';
  return pages()
    .filter((p) => p.path.startsWith(prefix))
    .map((p) => ({ path: [p.path.slice(prefix.length).replace(/\/$/, '')] }));
}

// The alternates a page declares, as paths rather than absolute URLs, which
// is the shape the header component wants for its language switcher.
export function alternatePathsFor(model) {
  const out = {};
  for (const a of model.alternates || []) {
    if (a.hreflang === 'x-default') continue;
    out[a.hreflang] = a.href.replace(/^https?:\/\/[^/]+/, '');
  }
  return out;
}

// Which groups exist, so the route files and a test can agree on the list
// without either of them holding a copy of it.
export const groups = () => Object.keys(ATLAS_SEGMENTS);
export const familiesServed = () => Object.keys(FAMILY_SEGMENT);
