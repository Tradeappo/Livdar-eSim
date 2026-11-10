// The Livdar Atlas serving engine on Cloudflare.
//
// HOW A REQUEST IS RESOLVED, and why there is no route table. The exporter writes one R2
// object per published page, keyed by the page's own URL path
// (pages/de/wetter/rom/model.json). Resolving a request is therefore one R2 GET, and the
// object's ABSENCE is the 404. The first version of this Worker kept a route-manifest.json
// listing every path and consulted it before fetching: that is a second statement of what
// is published, it has to be downloaded and parsed on a cold start, and at the target
// scale it is a 100-million-entry JSON file in a 128 MB isolate. A bucket listing cannot
// disagree with itself, so the list is gone.
//
// WHAT STOPS AN EMPTY BUCKET LOOKING LIKE 100 MILLION 404s. A missing object is only
// allowed to mean "no such page" while the dataset itself is known to be present. So the
// manifest (one small object) is loaded first and its absence makes EVERY request a 503.
// That is the fail-closed direction: a crawler that gets 503 comes back, a crawler that
// gets 404 drops the URL from the index, and dropping 6,812 live URLs because a binding
// was misconfigured is the one outcome this migration must not produce. R2 throwing is
// likewise a 503, never a 404.
//
// WHAT MAKES IT SCALE from 6,812 to 100,000,000 pages: nothing in the request path grows
// with the catalogue. One GET for the manifest (cached in the isolate and in the edge
// cache), one GET for the page, one render. No listing, no index, no scan. Adding pages
// adds objects, which R2 does not charge per-object to hold and does not limit in count.
//
// Production livdar.com, its Vercel project, its DNS and its sitemap are untouched by
// this file. Every response carries noindex.

import { renderDocument } from './render.jsx';
// The site's stylesheets, concatenated into the bundle at build time by
// cloudflare/build.mjs. Next.js emitted these as hashed files from app/globals.css,
// app/shop.css and app/atlas.css; here they are one immutable asset, served by the
// Worker so a staging page is not a wall of unstyled text and so an SEO audit that
// renders the page sees the same layout as production.
import { STYLESHEET_CSS, STYLESHEET_ETAG } from './assets.generated.js';

const MANIFEST_KEY = 'manifest.json';
const DATASET_PREFIX = 'atlas/';

// Headers that must never be absent, whatever the outcome. A staging deployment that
// Google indexes competes with livdar.com for livdar.com's own queries, so noindex is
// attached at the one place every response passes through rather than per branch.
const guard = (extra = {}) => ({
  'x-robots-tag': 'noindex, nofollow, noarchive',
  'x-atlas-env': 'staging',
  ...extra,
});

const TEXT = (body, status, extra) => new Response(body, {
  status,
  headers: guard({ 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', ...extra }),
});

// ---------------------------------------------------------------------------
// Path handling. A published Atlas URL always ends in a slash, so one spelling of a page
// is canonical and the cache cannot hold two entries for it. Anything that could escape
// the key space (traversal, backslashes, control characters, a double slash) is rejected
// outright rather than normalised into something that might match a different object.
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
// The dataset manifest. Held in the isolate for MANIFEST_TTL so a burst of requests on
// one colo costs one R2 read rather than one per request, and re-read after that so a
// new export is picked up without a deploy. `version` is part of every cache key, which
// is what makes a re-export invalidate the edge cache without a purge: the new version
// simply has different keys and the old entries age out.
// ---------------------------------------------------------------------------
const MANIFEST_TTL_MS = 60_000;
let manifestCache = null;

async function loadManifest(env) {
  const now = Date.now();
  if (manifestCache && manifestCache.at + MANIFEST_TTL_MS > now) return manifestCache.doc;
  const object = await env.ATLAS_R2.get(DATASET_PREFIX + MANIFEST_KEY);
  if (!object) {
    manifestCache = null;
    return null;
  }
  const doc = await object.json();
  if (doc.schema !== 2 || !doc.version || !Array.isArray(doc.locales)) {
    throw new Error('Atlas manifest is present but not schema 2');
  }
  manifestCache = { at: now, doc };
  return doc;
}

// ---------------------------------------------------------------------------
// Serving a page.
// ---------------------------------------------------------------------------
async function servePage(request, env, ctx, url, manifest) {
  const path = normalisePath(url.pathname);
  if (!path) return TEXT('Not Found', 404);

  // A URL that is not under a language the dataset publishes cannot be an Atlas page, so
  // it is answered without an R2 read at all. This is the cheap gate that keeps a crawler
  // or a scanner walking random paths from turning into one class-B operation each.
  const lang = path.split('/')[1];
  if (!lang || !manifest.locales.includes(lang)) return TEXT('Not Found', 404);

  const cache = caches.default;
  // The version in the cache key is the invalidation mechanism: a new export changes
  // every key at once, atomically, with no purge call and no window in which half the
  // site is old and half is new.
  const cacheKey = new Request('https://atlas.livdar.internal/v/' + manifest.version + path, { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) {
    const headers = new Headers(hit.headers);
    headers.set('x-atlas-cache', 'hit');
    return new Response(request.method === 'HEAD' ? null : hit.body, { status: hit.status, headers });
  }

  const object = await env.ATLAS_R2.get(pageKeyFor(path));
  // Not found is a real 404: the page is not published. The dataset is known to be
  // present, because the manifest loaded, so this cannot be the whole-site failure.
  if (!object) return TEXT('Not Found', 404);

  const record = await object.json();
  const html = renderDocument(record, { locales: manifest.locales, noindex: true });

  const headers = guard({
    'content-type': 'text/html; charset=utf-8',
    // s-maxage lets the edge hold it; max-age=0 keeps a browser from holding a staging
    // page. Pages are annual statistics, so a day at the edge is conservative.
    'cache-control': 'public, max-age=0, s-maxage=86400',
    'x-atlas-cache': 'miss',
    'x-atlas-kind': record.kind,
    'x-atlas-version': manifest.version,
    'x-atlas-locale': record.locale,
    'vary': 'Accept-Encoding',
  });
  if (record.lastmod) headers['last-modified'] = new Date(record.lastmod + 'T00:00:00Z').toUTCString();

  const response = new Response(html, { status: 200, headers });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return request.method === 'HEAD'
    ? new Response(null, { status: 200, headers: response.headers })
    : response;
}

// ---------------------------------------------------------------------------
// Sitemaps. Served from the files the exporter generated with the repository's own
// sitemap generators, so the URLs, lastmod, changefreq, priority and hreflang are the
// ones app/sitemap.js produces. The production sitemap is NOT affected by this Worker;
// these are served under /sitemap-atlas/ so both can exist during the cutover.
// ---------------------------------------------------------------------------
async function serveSitemap(request, env, ctx, id, manifest) {
  const known = id === 'index' || manifest.sitemaps.some((s) => s.id === id);
  if (!known) return TEXT('Not Found', 404);
  const object = await env.ATLAS_R2.get(sitemapKeyFor(id));
  // A sitemap the manifest promises and the bucket does not hold is an incomplete
  // import, not a missing file: 503 so a crawler retries rather than recording that the
  // sitemap is gone.
  if (!object) return TEXT('Atlas sitemap is listed in the manifest but missing from storage', 503);
  const headers = guard({
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=0, s-maxage=3600',
    'x-atlas-version': manifest.version,
  });
  return new Response(request.method === 'HEAD' ? null : object.body, { status: 200, headers });
}

// ---------------------------------------------------------------------------
// Ingest. How the 6,812 objects got into R2 without issuing a second set of credentials.
//
// R2's S3 API needs an access key pair, and minting one is an account-level change. The
// Worker already holds the only binding that is needed, so the import is pushed through
// it: the exporter's uploader POSTs batches here with a bearer token held as a Worker
// secret, and the Worker writes them to the bucket. Idempotent by construction — a PUT of
// the same key with the same body is the same object — and the uploader skips keys whose
// sha256 R2 already reports, which is what makes a 118 MB import resumable.
//
// It refuses to run at all when ATLAS_INGEST_TOKEN is unset, so the normal state of this
// Worker is one with no write path. Once production traffic is cut over, the secret is
// deleted and this becomes unreachable code.
// ---------------------------------------------------------------------------
async function ingest(request, env) {
  const token = env.ATLAS_INGEST_TOKEN;
  if (!token) return TEXT('Ingest is disabled', 404);
  const offered = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  // Constant-time-ish comparison: length first, then every byte, so a wrong token does
  // not leak its correct prefix through response timing.
  let ok = offered.length === token.length;
  for (let i = 0; i < token.length; i += 1) ok = ok && offered[i] === token[i];
  if (!ok) return TEXT('Forbidden', 403);

  // GET lists what the bucket already holds, with R2's etag (the md5 of the body for a
  // single-part put) and size. This is what makes the import idempotent WITHOUT a local
  // progress file: the uploader asks what is there, hashes what it has, and sends only
  // the difference. A resumed import after a lost container skips the 6,000 objects that
  // already landed instead of rewriting them, which is the difference between a free
  // re-run and 6,889 billable class-A operations.
  if (request.method === 'GET') {
    const prefix = new URL(request.url).searchParams.get('prefix') || DATASET_PREFIX;
    if (!prefix.startsWith(DATASET_PREFIX)) return TEXT('prefix must start with ' + DATASET_PREFIX, 400);
    const out = {};
    let cursor;
    let truncated = true;
    while (truncated) {
      const listing = await env.ATLAS_R2.list({ prefix, limit: 1000, cursor });
      for (const o of listing.objects) out[o.key] = { etag: o.etag, size: o.size };
      truncated = listing.truncated;
      cursor = listing.cursor;
      // One request lists at most this many so a huge bucket cannot run the isolate out
      // of time or memory; the uploader pages with ?prefix= instead.
      if (Object.keys(out).length >= 60_000) break;
    }
    return Response.json({ prefix, count: Object.keys(out).length, objects: out, complete: !truncated }, { headers: guard({ 'cache-control': 'no-store' }) });
  }

  if (request.method === 'DELETE') {
    // Retirement and rollback. A page that leaves the registry has to leave the edge, or
    // the Worker keeps serving a URL the Atlas has withdrawn. Keys are given explicitly,
    // one per line; there is no prefix delete, because "delete everything under /en/" is
    // one typo away from unpublishing a language.
    const keys = (await request.text()).split('\n').map((l) => l.trim()).filter(Boolean);
    const bad = keys.filter((k) => !k.startsWith(DATASET_PREFIX));
    if (bad.length) return TEXT('keys must start with ' + DATASET_PREFIX, 400);
    for (const key of keys) await env.ATLAS_R2.delete(key);
    manifestCache = null;
    return Response.json({ deleted: keys.length }, { headers: guard({ 'cache-control': 'no-store' }) });
  }

  if (request.method !== 'POST') return TEXT('Method Not Allowed', 405);

  // Body is NDJSON: one {key, body, contentType} per line. A batch rather than one
  // request per object, because 6,889 round trips from a container is the slow part.
  const text = await request.text();
  const results = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let item;
    try { item = JSON.parse(line); } catch { results.push({ error: 'bad json line' }); continue; }
    if (!item.key || typeof item.body !== 'string') { results.push({ key: item.key || null, error: 'key and body required' }); continue; }
    if (!item.key.startsWith(DATASET_PREFIX)) { results.push({ key: item.key, error: 'key must start with ' + DATASET_PREFIX }); continue; }
    await env.ATLAS_R2.put(item.key, item.body, {
      httpMetadata: { contentType: item.contentType || 'application/json; charset=utf-8' },
    });
    results.push({ key: item.key, bytes: item.body.length, ok: true });
  }
  // The isolate's manifest copy is stale the moment a new manifest is written.
  manifestCache = null;
  return Response.json({ written: results.filter((r) => r.ok).length, errors: results.filter((r) => r.error) }, { headers: guard({ 'cache-control': 'no-store' }) });
}

// ---------------------------------------------------------------------------
// Observability. One endpoint that answers "is the dataset actually there", because
// "the Worker deployed" and "the Atlas is being served" are different facts and the
// first one is the one that is easy to mistake for the second.
// ---------------------------------------------------------------------------
async function health(env) {
  const body = {
    service: 'livdar-atlas',
    environment: 'staging',
    r2Bound: Boolean(env.ATLAS_R2),
    ingestEnabled: Boolean(env.ATLAS_INGEST_TOKEN),
    productionChanged: false,
  };
  if (!env.ATLAS_R2) {
    return Response.json({ ...body, dataReady: false, reason: 'ATLAS_R2 binding missing' }, { status: 503, headers: guard({ 'cache-control': 'no-store' }) });
  }
  let manifest = null;
  try { manifest = await loadManifest(env); } catch (error) { body.manifestError = String(error.message || error); }
  if (!manifest) {
    return Response.json({ ...body, dataReady: false, reason: body.manifestError || 'dataset manifest not in R2' }, { status: 503, headers: guard({ 'cache-control': 'no-store' }) });
  }
  return Response.json({
    ...body,
    dataReady: true,
    version: manifest.version,
    exportedAt: manifest.createdAt,
    counts: manifest.counts,
    locales: manifest.locales,
    sitemaps: manifest.sitemaps.length + 1,
  }, { headers: guard({ 'cache-control': 'no-store' }) });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/__health') return health(env);
    if (url.pathname === '/__ingest') return ingest(request, env);

    // The stylesheet. Content-addressed by its own hash and immutable, so it is fetched
    // once per visitor however many Atlas pages they read, and needs no R2 read at all.
    if (url.pathname === '/_atlas/assets/atlas.css') {
      if (request.headers.get('if-none-match') === STYLESHEET_ETAG) {
        return new Response(null, { status: 304, headers: guard({ etag: STYLESHEET_ETAG }) });
      }
      return new Response(request.method === 'HEAD' ? null : STYLESHEET_CSS, {
        headers: guard({ 'content-type': 'text/css; charset=utf-8', 'cache-control': 'public, max-age=31536000, immutable', etag: STYLESHEET_ETAG }),
      });
    }

    // robots.txt exists so that if the staging host is ever discovered, the answer does
    // not depend on a header surviving a proxy.
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', { headers: guard({ 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }) });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') return TEXT('Method Not Allowed', 405, { allow: 'GET, HEAD' });
    if (!env.ATLAS_R2) return TEXT('Atlas storage is not bound to this Worker', 503);

    try {
      const manifest = await loadManifest(env);
      // No manifest means the dataset is not installed. Everything is 503, deliberately,
      // so an incomplete or wiped import can never be mistaken for "these pages do not
      // exist" by a crawler that would then drop them.
      if (!manifest) return TEXT('Atlas dataset is not installed in storage', 503);

      const sitemap = url.pathname.match(/^\/sitemap-atlas\/([A-Za-z0-9-]{1,120})\.xml$/);
      if (sitemap) return serveSitemap(request, env, ctx, sitemap[1], manifest);

      if (url.pathname === '/') {
        return Response.json({ service: 'livdar-atlas', environment: 'staging', version: manifest.version, health: '/__health' }, { headers: guard({ 'cache-control': 'no-store' }) });
      }

      return servePage(request, env, ctx, url, manifest);
    } catch (error) {
      // An infrastructure fault is a 503 and is logged. It is never a 404: a 404 teaches
      // Google the page is gone, and this branch does not know that.
      console.error('atlas-worker', url.pathname, String(error && error.stack || error));
      return TEXT('Atlas temporarily unavailable', 503, { 'retry-after': '120' });
    }
  },
};
