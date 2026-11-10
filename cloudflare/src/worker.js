// The Livdar Atlas serving engine on Cloudflare.
//
// HOW A REQUEST IS RESOLVED, and why there is no route table. The exporter writes one R2
// object per published page, keyed by the page's own URL path
// (atlas/pages/de/wetter/muenchen/model.json). Resolving a request is one R2 GET, and the
// object's ABSENCE is the 404. A route manifest listing every path would be a second
// statement of what is published, and at the target scale a 100-million-entry JSON file
// in a 128 MB isolate. A bucket listing cannot disagree with itself.
//
// WHAT STOPS AN EMPTY BUCKET LOOKING LIKE 100 MILLION 404s. A missing object may only
// mean "no such page" while the dataset is known to be present, so the manifest is loaded
// first and its absence makes EVERY request a 503. A crawler that gets 503 comes back; a
// crawler that gets 404 drops the URL. R2 throwing is likewise 503, never 404.
//
// WHAT MAKES IT SCALE: nothing in the request path grows with the catalogue. One GET for
// the manifest (held in the isolate), one GET for the page, one render.
//
// ONE SCRIPT, TWO DEPLOYMENTS. The same bundle runs as livdar-atlas-staging and as
// livdar-atlas (production). They differ only in configuration:
//   ATLAS_ENV          'production' on the production Worker; anything else is staging
//   ATLAS_HOSTS        the hosts a production page may be indexable on (livdar.com)
//   ATLAS_GTM_ID       the tag container, printed only on an indexable production page
//   ATLAS_CLARITY_ID   Clarity, likewise
//   ATLAS_INGEST_TOKEN the write path; set on staging only, never on production
// A page is indexable only when ATLAS_ENV is 'production' AND the request arrived on one
// of ATLAS_HOSTS. Both, not either: the production Worker answering on workers.dev is
// still noindex, so it cannot become a second indexable copy of livdar.com, and the
// staging Worker can never become indexable whatever host reaches it.

import { renderDocument } from './render.jsx';
import { ASSETS, ASSET_BODIES, BUILD_ID } from './assets.generated.js';

const DATASET_PREFIX = 'atlas/';
const MANIFEST_KEY = DATASET_PREFIX + 'manifest.json';

// ---------------------------------------------------------------------------
// Environment.
// ---------------------------------------------------------------------------
export function configFor(env, url) {
  const production = env.ATLAS_ENV === 'production';
  const hosts = new Set(String(env.ATLAS_HOSTS || 'livdar.com').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean));
  const indexable = production && hosts.has(url.hostname.toLowerCase());
  return {
    production,
    indexable,
    name: production ? 'production' : 'staging',
    gtmId: indexable ? String(env.ATLAS_GTM_ID || '') : '',
    clarityId: indexable ? String(env.ATLAS_CLARITY_ID || '') : '',
  };
}

// The headers every response carries. The three security headers are the ones
// next.config.mjs sets on every path, and HSTS is the one Vercel adds on its custom
// domains (max-age=63072000, observed on livdar.com), so a page moving to Cloudflare
// keeps the same response policy. The noindex trio is attached here, at the one place
// every response passes through, whenever the page is not indexable.
function baseHeaders(cfg, extra = {}) {
  const h = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'SAMEORIGIN',
    'x-atlas-env': cfg.name,
    ...extra,
  };
  if (cfg.indexable) h['strict-transport-security'] = 'max-age=63072000';
  else h['x-robots-tag'] = 'noindex, nofollow, noarchive';
  return h;
}

const text = (cfg, body, status, extra) => new Response(body, {
  status,
  headers: baseHeaders(cfg, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', ...extra }),
});

// A 404 a person can read. The status is what a crawler acts on; the body is for the
// reader who followed a bad link, and it says where the Atlas is in their language.
// noindex in the markup as well, as Next.js prints on its own 404.
function notFound(cfg, lang) {
  const home = lang ? '/' + lang + '/atlas/' : null;
  const body = '<!DOCTYPE html><html lang="' + (lang || 'en') + '"><head><meta charset="utf-8"/>'
    + '<meta name="viewport" content="width=device-width, initial-scale=1"/>'
    + '<meta name="robots" content="noindex"/><title>404: This page could not be found.</title>'
    + '<link rel="stylesheet" href="' + ASSETS.css.path + '"/></head>'
    + '<body><main id="main" class="atlas"><div class="wrap atlas-wrap"><h1>404</h1>'
    + '<p>This page could not be found.</p>'
    + (home ? '<p><a href="' + home + '">Livdar Atlas</a></p>' : '')
    + '</div></main></body></html>';
  return new Response(body, {
    status: 404,
    headers: baseHeaders(cfg, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' }),
  });
}

// ---------------------------------------------------------------------------
// Path handling. Anything that could escape the key space (traversal, backslashes,
// control characters, a double slash) is rejected outright rather than normalised into
// something that might match a different object.
// ---------------------------------------------------------------------------
export function normalisePath(pathname) {
  let p;
  try { p = decodeURIComponent(pathname); } catch { return null; }
  if (!p.startsWith('/')) return null;
  if (p.includes('..') || p.includes('\\') || p.includes('//') || /[\u0000-\u001f\u007f]/.test(p)) return null;
  if (p.length > 1024) return null;
  return p.endsWith('/') ? p : p + '/';
}

export const pageKeyFor = (path) => DATASET_PREFIX + 'pages' + path + 'model.json';
export const sitemapKeyFor = (id) => DATASET_PREFIX + 'sitemaps/' + id + '.xml';

// ---------------------------------------------------------------------------
// The dataset manifest, held in the isolate for a minute so a burst on one colo costs
// one R2 read. `version` is part of every cache key: a re-export changes every key at
// once, so the edge cache is invalidated atomically with no purge call.
// ---------------------------------------------------------------------------
const MANIFEST_TTL_MS = 60_000;
let manifestCache = null;

async function loadManifest(env) {
  const now = Date.now();
  if (manifestCache && manifestCache.at + MANIFEST_TTL_MS > now) return manifestCache.doc;
  const object = await env.ATLAS_R2.get(MANIFEST_KEY);
  if (!object) { manifestCache = null; return null; }
  const doc = await object.json();
  if (doc.schema !== 2 || !doc.version || !Array.isArray(doc.locales)) throw new Error('Atlas manifest is present but not schema 2');
  doc.sitemapIds = new Set(doc.sitemaps.map((s) => s.id));
  manifestCache = { at: now, doc };
  return doc;
}

// ---------------------------------------------------------------------------
// Logging. Structured, so Workers observability can filter on it. Every 5xx is logged;
// successful renders are sampled, because a log line per request is a cost line per
// request at 100M requests a month.
// ---------------------------------------------------------------------------
const log = (level, event, data) => {
  const line = JSON.stringify({ event, ...data });
  if (level === 'error') console.error(line); else console.log(line);
};

// ---------------------------------------------------------------------------
// Pages.
// ---------------------------------------------------------------------------
const BROWSER_CACHE = 'public, max-age=0, must-revalidate';
const EDGE_TTL = 86400;

async function servePage(request, env, ctx, url, manifest, cfg) {
  // Next.js runs with trailingSlash: true, so /de/wetter/muenchen answered 308 to
  // /de/wetter/muenchen/. Serving 200 at both would make every page two URLs.
  if (!url.pathname.endsWith('/')) {
    const path = normalisePath(url.pathname);
    if (!path) return notFound(cfg, null);
    return new Response(null, { status: 308, headers: baseHeaders(cfg, { location: path + url.search, 'cache-control': BROWSER_CACHE }) });
  }
  const path = normalisePath(url.pathname);
  if (!path) return notFound(cfg, null);

  // Not one of the dataset's languages: cannot be an Atlas page, answered without an R2
  // read, so a scanner walking random paths does not become one billed read each.
  const lang = path.split('/')[1];
  if (!lang || !manifest.locales.includes(lang)) return notFound(cfg, null);

  // The cache key carries the dataset version, the build and the environment. The
  // version and build make a re-export or a deploy invalidate everything at once; the
  // environment keeps an indexable production page and a noindex staging page of the
  // same path from ever being served in each other's place.
  const cacheKey = new Request('https://atlas.livdar.internal/' + cfg.name + '/' + (cfg.indexable ? 'i' : 'n') + '/' + manifest.version + '/' + BUILD_ID + path);
  const etag = '"' + manifest.version + '-' + BUILD_ID + '-' + (cfg.indexable ? 'i' : 'n') + '"';
  const cache = caches.default;

  const conditional = request.headers.get('if-none-match');
  let response = await cache.match(cacheKey);
  let cacheState = 'hit';

  if (!response) {
    cacheState = 'miss';
    const object = await env.ATLAS_R2.get(pageKeyFor(path));
    if (!object) return notFound(cfg, lang);
    const record = await object.json();
    const html = renderDocument(record, { locales: manifest.locales, noindex: !cfg.indexable, gtmId: cfg.gtmId, clarityId: cfg.clarityId });
    const headers = baseHeaders(cfg, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': BROWSER_CACHE,
      etag,
      'x-atlas-kind': record.kind,
      'x-atlas-version': manifest.version,
      'x-atlas-locale': record.locale,
      vary: 'Accept-Encoding',
    });
    if (record.lastmod) headers['last-modified'] = new Date(record.lastmod + 'T00:00:00Z').toUTCString();
    response = new Response(html, { status: 200, headers });
    // The copy kept at the edge carries its own TTL; the browser-facing header stays
    // max-age=0 so readers always revalidate and a deploy reaches them at once.
    const stored = new Response(html, { status: 200, headers: { ...headers, 'cache-control': 'public, s-maxage=' + EDGE_TTL } });
    ctx.waitUntil(cache.put(cacheKey, stored));
    if (Math.random() < 0.01) log('info', 'atlas.render', { path, kind: record.kind, env: cfg.name, bytes: html.length });
  }

  const headers = new Headers(response.headers);
  headers.set('cache-control', BROWSER_CACHE);
  headers.set('x-atlas-cache', cacheState);
  // A crawler revalidating a page it already holds gets a 304 with no body, which is what
  // keeps a re-crawl of 100M URLs from re-downloading 100M pages.
  if (conditional && conditional.split(',').map((t) => t.trim()).includes(etag)) {
    headers.delete('content-type');
    return new Response(null, { status: 304, headers });
  }
  return new Response(request.method === 'HEAD' ? null : response.body, { status: 200, headers });
}

// ---------------------------------------------------------------------------
// Sitemaps. Production URLs are /sitemap/atlas-*.xml, the URLs app/sitemap.js has always
// published them at and that Search Console already knows, so no sitemap URL changes in
// the cutover. /sitemap-atlas/ is the staging alias of the same files. The index at
// /sitemap.xml also lists the eSIM sitemaps, so it is not the Atlas's and stays on the
// origin.
// ---------------------------------------------------------------------------
async function serveSitemap(request, env, id, manifest, cfg) {
  const known = id === 'index' || manifest.sitemapIds.has(id);
  if (!known) return notFound(cfg, null);
  const object = await env.ATLAS_R2.get(sitemapKeyFor(id));
  // A sitemap the manifest promises and the bucket lacks is an incomplete import, not a
  // missing file: 503 so a crawler retries instead of recording the sitemap as gone.
  if (!object) {
    log('error', 'atlas.sitemap_missing', { id, version: manifest.version });
    return text(cfg, 'Atlas sitemap is listed in the manifest but missing from storage', 503, { 'retry-after': '120' });
  }
  const headers = baseHeaders(cfg, {
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    'x-atlas-version': manifest.version,
    etag: '"' + object.etag + '"',
  });
  const conditional = request.headers.get('if-none-match');
  if (conditional && conditional.includes(object.etag)) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : object.body, { status: 200, headers });
}

// ---------------------------------------------------------------------------
// Static assets: the stylesheet and the islands script, embedded in the bundle and
// content-addressed, so they need no R2 read and can be cached for a year.
// ---------------------------------------------------------------------------
function serveAsset(request, pathname, cfg) {
  const body = ASSET_BODIES[pathname];
  if (body == null) return notFound(cfg, null);
  const asset = pathname === ASSETS.css.path ? ASSETS.css : ASSETS.islands;
  const headers = baseHeaders(cfg, { 'content-type': asset.type, 'cache-control': 'public, max-age=31536000, immutable', etag: asset.etag });
  if (request.headers.get('if-none-match') === asset.etag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : body, { headers });
}

// ---------------------------------------------------------------------------
// Ingest: how the dataset gets into R2 without a second set of credentials. The uploader
// sends batches here with a bearer token held as a Worker secret, and the Worker writes
// them through its binding. Refused entirely when ATLAS_INGEST_TOKEN is unset, which is
// the production Worker's permanent state.
// ---------------------------------------------------------------------------
async function ingest(request, env, cfg) {
  const token = env.ATLAS_INGEST_TOKEN;
  if (!token || cfg.production) return notFound(cfg, null);
  const offered = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  let ok = offered.length === token.length;
  for (let i = 0; i < token.length; i += 1) ok = ok && offered[i] === token[i];
  if (!ok) return text(cfg, 'Forbidden', 403);

  // GET lists what the bucket holds, with R2's etag (the md5 of a single-part body), so
  // the uploader can send only what changed and delete only what was retired.
  if (request.method === 'GET') {
    const prefix = new URL(request.url).searchParams.get('prefix') || DATASET_PREFIX;
    if (!prefix.startsWith(DATASET_PREFIX)) return text(cfg, 'prefix must start with ' + DATASET_PREFIX, 400);
    const out = {};
    let cursor;
    let truncated = true;
    while (truncated) {
      const listing = await env.ATLAS_R2.list({ prefix, limit: 1000, cursor });
      for (const o of listing.objects) out[o.key] = { etag: o.etag, size: o.size };
      truncated = listing.truncated;
      cursor = listing.cursor;
      if (Object.keys(out).length >= 60_000) break;
    }
    return Response.json({ prefix, count: Object.keys(out).length, objects: out, complete: !truncated }, { headers: baseHeaders(cfg, { 'cache-control': 'no-store' }) });
  }

  // DELETE retires named keys, one per line. No prefix delete: "everything under /en/" is
  // one typo away from unpublishing a language.
  if (request.method === 'DELETE') {
    const keys = (await request.text()).split('\n').map((l) => l.trim()).filter(Boolean);
    if (keys.some((k) => !k.startsWith(DATASET_PREFIX))) return text(cfg, 'keys must start with ' + DATASET_PREFIX, 400);
    for (let i = 0; i < keys.length; i += 1000) await env.ATLAS_R2.delete(keys.slice(i, i + 1000));
    manifestCache = null;
    return Response.json({ deleted: keys.length }, { headers: baseHeaders(cfg, { 'cache-control': 'no-store' }) });
  }

  if (request.method !== 'POST') return text(cfg, 'Method Not Allowed', 405);
  const body = await request.text();
  const results = [];
  for (const line of body.split('\n')) {
    if (!line.trim()) continue;
    let item;
    try { item = JSON.parse(line); } catch { results.push({ error: 'bad json line' }); continue; }
    if (!item.key || typeof item.body !== 'string') { results.push({ key: item.key || null, error: 'key and body required' }); continue; }
    if (!item.key.startsWith(DATASET_PREFIX)) { results.push({ key: item.key, error: 'key must start with ' + DATASET_PREFIX }); continue; }
    await env.ATLAS_R2.put(item.key, item.body, { httpMetadata: { contentType: item.contentType || 'application/json; charset=utf-8' } });
    results.push({ key: item.key, ok: true });
  }
  manifestCache = null;
  return Response.json({ written: results.filter((r) => r.ok).length, errors: results.filter((r) => r.error) }, { headers: baseHeaders(cfg, { 'cache-control': 'no-store' }) });
}

// ---------------------------------------------------------------------------
// Health: "the Worker deployed" and "the Atlas is being served" are different facts, and
// the first one is the one that is easy to mistake for the second.
// ---------------------------------------------------------------------------
async function health(env, cfg) {
  const body = { service: 'livdar-atlas', environment: cfg.name, indexable: cfg.indexable, build: BUILD_ID, r2Bound: Boolean(env.ATLAS_R2), ingestEnabled: Boolean(env.ATLAS_INGEST_TOKEN) && !cfg.production };
  const json = (data, status) => Response.json(data, { status, headers: baseHeaders(cfg, { 'cache-control': 'no-store' }) });
  if (!env.ATLAS_R2) return json({ ...body, dataReady: false, reason: 'ATLAS_R2 binding missing' }, 503);
  let manifest = null;
  try { manifest = await loadManifest(env); } catch (error) { body.manifestError = String(error.message || error); }
  if (!manifest) return json({ ...body, dataReady: false, reason: body.manifestError || 'dataset manifest not in R2' }, 503);
  return json({ ...body, dataReady: true, version: manifest.version, sourceCommit: manifest.sourceCommit || null, exportedAt: manifest.createdAt, counts: manifest.counts, locales: manifest.locales, sitemaps: manifest.sitemaps.length + 1 }, 200);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cfg = configFor(env, url);

    if (url.pathname === '/__health') return health(env, cfg);
    if (url.pathname === '/__ingest') return ingest(request, env, cfg);
    if (url.pathname.startsWith('/_atlas/assets/')) return serveAsset(request, url.pathname, cfg);

    // A staging host must say "do not crawl" in robots.txt as well as in headers, so the
    // answer does not depend on a header surviving a proxy. On an indexable production
    // host robots.txt belongs to the origin and is never routed here; if it ever is, the
    // Worker refuses to answer for it rather than publish a Disallow on livdar.com.
    if (url.pathname === '/robots.txt') {
      if (cfg.indexable) return notFound(cfg, null);
      return new Response('User-agent: *\nDisallow: /\n', { headers: baseHeaders(cfg, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }) });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') return text(cfg, 'Method Not Allowed', 405, { allow: 'GET, HEAD' });
    if (!env.ATLAS_R2) return text(cfg, 'Atlas storage is not bound to this Worker', 503, { 'retry-after': '120' });

    try {
      const manifest = await loadManifest(env);
      if (!manifest) return text(cfg, 'Atlas dataset is not installed in storage', 503, { 'retry-after': '120' });

      const sitemap = url.pathname.match(/^\/sitemap\/(atlas-[A-Za-z0-9-]{1,120})\.xml$/)
        || url.pathname.match(/^\/sitemap-atlas\/([A-Za-z0-9-]{1,120})\.xml$/);
      if (sitemap) return serveSitemap(request, env, sitemap[1], manifest, cfg);

      if (url.pathname === '/') {
        return Response.json({ service: 'livdar-atlas', environment: cfg.name, version: manifest.version, health: '/__health' }, { headers: baseHeaders(cfg, { 'cache-control': 'no-store' }) });
      }
      return await servePage(request, env, ctx, url, manifest, cfg);
    } catch (error) {
      // An infrastructure fault is a 503 and is logged. Never a 404: a 404 teaches Google
      // the page is gone, and this branch does not know that.
      log('error', 'atlas.error', { path: url.pathname, env: cfg.name, error: String(error && error.stack || error).slice(0, 2000) });
      return text(cfg, 'Atlas temporarily unavailable', 503, { 'retry-after': '120' });
    }
  },
};
