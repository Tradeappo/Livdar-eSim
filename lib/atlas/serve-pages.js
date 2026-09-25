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
// Every approved cohort, not the first one. This read the first manifest by
// name, which was true while there was one cohort and quietly false the
// moment there were two: cohort 002 passed QA, was registered, and could not
// be served by the site that had just built it.
export const MANIFESTS = ['001', '002'].map((c) => 'data/atlas/cohorts/cohort-' + c + '-pages.json');

let cache = null;
export function pages() {
  if (cache) return cache;
  const out = [];
  for (const m of MANIFESTS) {
    const u = new URL(m, ROOT);
    if (existsSync(u)) out.push(...JSON.parse(readFileSync(u, 'utf8')).pages);
  }
  cache = out;
  return cache;
}

// Every language any manifest carries. The route needs this because it
// generates its own parameters rather than inheriting them.
export const languagesServed = () => [...new Set(pages().map((p) => p.locale || p.path.split('/')[1]))].sort();

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

// Every parameter pair this segment serves, across every language, which is
// what the route actually has to return.
//
// The route used to ask for one language and take it from the parent segment.
// The parent generates the three locales the eSIM site publishes, en, de and
// ro, so six of the nine Atlas languages could never be generated, and with
// `dynamicParams = false` a page that is not generated is a 404. The whole
// Atlas was unreachable in the built site and every check upstream of the
// build passed, because every one of them ran against the models rather than
// against the output.
export function allStaticParamsFor(segment) {
  const out = [];
  for (const lang of languagesServed()) {
    for (const p of staticParamsFor(lang, segment)) out.push({ lang, ...p });
  }
  return out;
}

// The alternates a page declares, as paths rather than absolute URLs, which
// is the shape the header component wants for its language switcher.
//
// x-default is dropped here because it is not a language and a switcher offering
// it would be offering a duplicate of English under a name nobody recognises.
export function alternatePathsFor(model) {
  const out = {};
  for (const a of model.alternates || []) {
    if (a.hreflang === 'x-default') continue;
    out[a.hreflang] = a.href.replace(/^https?:\/\/[^/]+/, '');
  }
  return out;
}

// The same map for the metadata, with x-default kept.
//
// These were one function and the switcher's need quietly removed the tag from
// all five hundred pages. Cohort QA has an x-default check and it passes, because
// it reads the model; the model declares it and the HTML never carried it. That
// is the same shape of failure as the middleware episode: a check that looks at
// the intention rather than at what the origin serves.
//
// x-default is what a search engine serves a reader whose language is none of the
// nine, so on a nine language set it is the difference between a Swedish reader
// getting English and getting whichever language sorted first.
export function hreflangMapFor(model) {
  const out = {};
  for (const a of model.alternates || []) out[a.hreflang] = a.href.replace(/^https?:\/\/[^/]+/, '');
  return out;
}

// Which groups exist, so the route files and a test can agree on the list
// without either of them holding a copy of it.
export const groups = () => Object.keys(ATLAS_SEGMENTS);
export const familiesServed = () => Object.keys(FAMILY_SEGMENT);
