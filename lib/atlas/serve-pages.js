// Serving the Atlas data pages.
//
// The models are built ahead of time, checked by cohort QA and written to a
// manifest, so serving is a lookup rather than a build. Nothing here can serve
// a page that is not in the manifest: a URL under an Atlas segment the cohort
// does not contain is a 404, because the alternative is a soft 404 on every
// combination somebody guesses.
//
// SHARDING (2026-10): the cohort manifests were one monolithic set (~68 MB,
// 6,000 of its 6,500 pages being city-weather) copied into EVERY serverless
// function by outputFileTracingIncludes['/**']. A route that serves salaries
// never needs the weather pages. scripts/atlas/shard-manifests.mjs now splits
// the cohorts into one shard per Atlas group under data/atlas/cohorts/by-group/,
// and this module loads only the group a request belongs to. next.config.mjs
// scopes the tracing to match. A hreflang cluster is `family::entity` and every
// family maps to exactly one group (FAMILY_SEGMENT), so a cluster is wholly
// inside one group and alternatesFor() stays complete after the split.
//
// The global pages() still loads every group, for the sitemap, robots and the
// /[lang]/atlas directory, which genuinely enumerate the whole Atlas. Those
// routes get every shard in their trace; data routes get only their own.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ATLAS_SEGMENTS, FAMILY_SEGMENT } from './atlas-urls.js';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);

export const GROUPS = Object.keys(ATLAS_SEGMENTS);
const shardRel = (group) => 'data/atlas/cohorts/by-group/' + group + '-pages.json';
// Back-compat for tests/tooling: the files read at request time are now the
// per-group shards rather than the raw cohort manifests.
export const MANIFESTS = GROUPS.map(shardRel);

// WHERE THE DATA ACTUALLY IS, and why one base is not enough. `ROOT` is right
// for this file unbundled and wrong once bundled into .next/server/chunks,
// where two levels up is .next/ while the traced data sits beside .next. So
// process.cwd() (the function root on Vercel and the repo root at build time)
// is tried first, then the module-relative URL. Only a location is added;
// nothing that worked before stops working. See the 2026-09-28 incident write-up
// in git history: a missing/unreachable manifest must THROW, never be read as an
// empty cohort, because an empty cohort answers every Atlas URL with a cached 404.
export function manifestCandidates(rel) {
  const out = [];
  try { out.push(join(process.cwd(), rel)); } catch { /* no cwd in this runtime */ }
  try { out.push(fileURLToPath(new URL(rel, ROOT))); } catch { /* unusual ROOT */ }
  return out;
}

function loadJsonBesideFunction(rel, describe) {
  const tried = manifestCandidates(rel);
  const found = tried.find((f) => existsSync(f));
  if (!found) {
    throw new Error(
      describe + ' missing from the deployment: ' + rel
      + ' (looked in: ' + tried.join(', ') + '). It is read at request time, so it has to be'
      + ' listed in outputFileTracingIncludes in next.config.mjs AND be reachable from one of'
      + ' the bases above. Serving nothing would turn Atlas pages into cached 404s.',
    );
  }
  return JSON.parse(readFileSync(found, 'utf8'));
}

const groupCache = new Map();
export function pagesForGroup(group) {
  if (!group) return [];
  if (groupCache.has(group)) return groupCache.get(group);
  const rows = loadJsonBesideFunction(shardRel(group), 'Atlas group shard').pages;
  groupCache.set(group, rows);
  return rows;
}

let allCache = null;
// Every page in every group. Only the whole-Atlas consumers (sitemap, robots,
// the directory) call this; a data route resolves through its own group.
export function pages() {
  if (allCache) return allCache;
  const out = [];
  for (const g of GROUPS) out.push(...pagesForGroup(g));
  allCache = out;
  return allCache;
}

// The locales the Atlas publishes in. Read from the tiny generated languages.json
// rather than loading every page, because the header, footer and language
// switcher call this on every page and must not drag the dataset into every
// function. Falls back to deriving it from pages() if the file is absent (dev
// without the shard step), which is the only path that still loads shards.
let localesCache = null;
export const languagesServed = () => {
  if (localesCache) return localesCache;
  try {
    localesCache = loadJsonBesideFunction('data/atlas/cohorts/by-group/languages.json', 'Atlas languages.json').locales;
  } catch {
    localesCache = [...new Set(pages().map((p) => p.locale || p.path.split('/')[1]))].sort();
  }
  return localesCache;
};

const byPathCache = new Map();
function indexFor(group) {
  if (byPathCache.has(group)) return byPathCache.get(group);
  const m = new Map(pagesForGroup(group).map((p) => [p.path, p]));
  byPathCache.set(group, m);
  return m;
}

export function resetServeCache() {
  groupCache.clear();
  byPathCache.clear();
  clusterCache.clear();
  allCache = null;
  localesCache = null;
}

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

// The group a page/model belongs to, from its family. This is the lookup that
// makes a cluster resolvable inside a single shard.
export const groupOfModel = (model) => (model ? FAMILY_SEGMENT[model.family] || null : null);

// Resolve one request. The path is rebuilt from its parts and looked up exactly,
// so a trailing slash difference or an extra segment misses rather than matching
// loosely. Only the request's own group shard is consulted.
export function servePage(lang, segment, parts = []) {
  const group = groupOfSegment(lang, segment);
  if (!group) return null;
  const leaf = (parts || []).filter(Boolean);
  if (leaf.length !== 1) return null;
  const path = '/' + lang + '/' + segment + '/' + leaf[0] + '/';
  const model = indexFor(group).get(path);
  if (!model) return null;
  return { model, path };
}

// Every path this segment serves, for build time generation. A page not in this
// list is not generated ahead of time and is not served on request either.
export function staticParamsFor(lang, segment) {
  const group = groupOfSegment(lang, segment);
  if (!group) return [];
  const prefix = '/' + lang + '/' + segment + '/';
  return pagesForGroup(group)
    .filter((p) => p.path.startsWith(prefix))
    .map((p) => ({ path: [p.path.slice(prefix.length).replace(/\/$/, '')] }));
}

// Every parameter pair this segment serves, across every language. The route
// generates its own parameters rather than inheriting them, so that all nine
// Atlas languages are generated and none becomes a 404 under dynamicParams=false.
export function allStaticParamsFor(segment) {
  const out = [];
  for (const lang of languagesServed()) {
    for (const p of staticParamsFor(lang, segment)) out.push({ lang, ...p });
  }
  return out;
}

export function alternatePathsFor(model) {
  const out = {};
  for (const a of alternatesFor(model)) {
    if (a.hreflang === 'x-default') continue;
    out[a.hreflang] = a.href.replace(/^https?:\/\/[^/]+/, '');
  }
  return out;
}

// The hreflang cluster of a page, across every cohort. Recomputed here rather
// than read from the manifest because a cluster split across cohorts would
// otherwise declare only its own half. The group shard merges every cohort, so
// the whole cluster is visible here, and a cluster never spans groups.
const CLUSTER = (p) => p.family + '::' + p.entity;

const clusterCache = new Map();
function clustersForGroup(group) {
  if (clusterCache.has(group)) return clusterCache.get(group);
  const m = new Map();
  for (const p of pagesForGroup(group)) {
    const k = CLUSTER(p);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(p);
  }
  clusterCache.set(group, m);
  return m;
}

// Every locale that publishes this family about this entity, whichever cohort it
// was selected in. One entry per locale, sorted, so the order does not depend on
// which manifest loaded first.
export function alternatesFor(model) {
  const group = groupOfModel(model);
  const siblings = group ? clustersForGroup(group).get(CLUSTER(model)) : null;
  if (!siblings || !siblings.length) return model.alternates || [];
  const seen = new Map();
  for (const s of siblings) if (!seen.has(s.locale)) seen.set(s.locale, s.canonical);
  const out = [...seen.entries()]
    .map(([hreflang, href]) => ({ hreflang, href }))
    .sort((a, b) => a.hreflang.localeCompare(b.hreflang));
  // x-default is English where English is in the cluster, because that is what a
  // reader outside all nine markets is most likely to read.
  const english = seen.get('en');
  return english ? [...out, { hreflang: 'x-default', href: english }] : out;
}

// The same map for the metadata, with x-default kept.
export function hreflangMapFor(model) {
  const out = {};
  for (const a of alternatesFor(model)) out[a.hreflang] = a.href.replace(/^https?:\/\/[^/]+/, '');
  return out;
}

// Which groups and families exist, so the route files and a test can agree on
// the list without either of them holding a copy of it.
export const groups = () => Object.keys(ATLAS_SEGMENTS);
export const familiesServed = () => Object.keys(FAMILY_SEGMENT);
