// What an Atlas URL answers, decided in one place for pages, metadata,
// sitemaps and QA.
//
//   production (VERCEL_ENV=production)  only "published" pages exist; everything else is a 404
//   preview and local                    "approved" pages render too, so a lot can be reviewed
//                                        before it is published; previews are never indexable
//
// A page is indexable when it is published and the site-wide indexing switch
// (lib/indexing.js) allows it. Nothing here is generated at build time beyond
// the published pages; everything else renders on request and is cached.

import { loadDataset } from './data.js';
import { resolvePath, pageKey, pathFor, parseKey } from './taxonomy.js';
import { buildModel } from './model.js';
import { hubModel } from './hub.js';
import { LOCALES, SEGMENTS, SITE_ORIGIN } from './i18n.js';
import { indexingAllowed } from '../indexing.js';
import { getLocale } from '../i18n.js';

export function isProduction(env = process.env) {
  return env.VERCEL_ENV === 'production';
}

export function stateOf(ds, key) {
  const e = ds.registry.entries[key];
  return e ? e.state : null;
}

export function isLiveKey(ds) {
  return (key) => stateOf(ds, key) === 'published';
}

export function servable(ds, key, env = process.env) {
  const s = stateOf(ds, key);
  return s === 'published' || (!isProduction(env) && s === 'approved');
}

// Resolves /{lang}/{segment}/{...path}/ into a page model, or null (404).
export function atlasModel(lang, segmentName, pathParts = [], env = process.env, ds = loadDataset()) {
  if (!LOCALES.includes(lang)) return null;
  const kind = Object.keys(SEGMENTS).find((k) => SEGMENTS[k][lang] === segmentName);
  if (!kind) return null;
  const isLive = isLiveKey(ds);
  if (!pathParts.length) {
    const listed = isProduction(env) ? isLive : (key) => ['published', 'approved'].includes(stateOf(ds, key));
    const hub = hubModel(ds, lang, kind, listed);
    return hub ? { model: hub, published: true } : null;
  }
  const page = resolvePath(ds, '/' + [lang, segmentName, ...pathParts].join('/') + '/');
  if (!page) return null;
  const key = pageKey(page);
  if (!servable(ds, key, env)) return null;
  const model = buildModel(ds, page, isLive);
  return model ? { model, published: stateOf(ds, key) === 'published' } : null;
}

// hreflang cluster: the page itself plus every published translation.
export function atlasAlternates(ds, model) {
  const isLive = isLiveKey(ds);
  const pairs = model.alternates.filter((a) => a.path && (a.locale === model.locale || isLive(a.key)));
  const languages = {};
  pairs.forEach((a) => { const l = getLocale(a.locale); if (l) languages[l.hreflang] = SITE_ORIGIN + a.path; });
  const fallback = pairs.find((a) => a.locale === 'en') || pairs.find((a) => a.locale === model.locale);
  if (fallback) languages['x-default'] = SITE_ORIGIN + fallback.path;
  return { languages, paths: Object.fromEntries(pairs.map((a) => [a.locale, a.path])) };
}

export function atlasIndexable(published, env = process.env) {
  return Boolean(published) && indexingAllowed(env);
}

// Every key this environment may answer for: published in production, and
// approved as well outside it, which is what a preview review needs.
export function servableKeys(ds, env = process.env) {
  const states = isProduction(env) ? ['published'] : ['published', 'approved'];
  return Object.entries(ds.registry.entries).filter(([, e]) => states.includes(e.state)).map(([k]) => k);
}

// Static params for one segment. The parent layout pins dynamicParams for this
// route tree, so a page that is not listed here is a 404: the list is the
// contract, and it holds exactly the pages this environment may serve.
//
// Scale: the cap keeps one build bounded. A lot larger than the cap is
// published in waves, and the wave that is not built yet simply is not served
// until its build runs, which is the same guarantee, never a thin page.
export const STATIC_CAP = 5000;
export function atlasStaticParams(lang, segmentName, ds = loadDataset(), env = process.env) {
  const kind = Object.keys(SEGMENTS).find((k) => SEGMENTS[k][lang] === segmentName);
  if (!kind) return [];
  const out = [];
  servableKeys(ds, env).forEach((key) => {
    if (out.length >= STATIC_CAP) return;
    const p = parseKey(key);
    if (p.locale !== lang || (kind === 'airport') !== (p.family === 'airport')) return;
    const path = pathFor(ds, p);
    if (path) out.push({ path: path.split('/').filter(Boolean).slice(2) });
  });
  if (out.length) out.push({ path: [] });
  return out;
}
