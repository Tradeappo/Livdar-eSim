// livdar-origin-fallback: the non-Atlas half of livdar.com, kept up while its origin is not.
//
// WHAT IT IS FOR. Vercel is answering HTTP 402 for every livdar.com URL. Once the zone is
// on Cloudflare, this Worker runs on the catch-all route `livdar.com/*` (and
// `www.livdar.com/*`). The 107 Atlas routes are more specific and win, so the Atlas never
// reaches it.
//
// WHAT IT DOES, in order:
//   1. Pass the request to the origin, untouched, and return the origin's answer.
//   2. Only if the origin FAILS — 402, any 5xx, a Vercel platform error header, a timeout,
//      a refused connection — answer instead from a snapshot of the same production
//      build (cloudflare/fallback/build-snapshot.mjs) held in R2.
// So it heals itself. The moment Vercel serves again, so does livdar.com, through the
// same route, with nothing to switch back. After a failure the origin is skipped for 30
// seconds per isolate, so an outage does not add a doomed round trip to every request.
//
// While serving from the snapshot it reproduces what the Next.js app did around its
// pages: the www -> apex 308 (the Vercel domain setting), trailingSlash's 308,
// next.config's /esim and /guides redirects, the middleware's locale redirects (by
// running the app's own lib/routing.js), the RSC payload for client navigation, the 404
// page with status 404, and the response headers from next.config. It cannot run server
// code, so the two dynamic API routes answer 503 with retry-after until the origin
// returns, and so does any non-GET request.
//
// Indexable only as production on livdar.com, exactly like the Atlas Worker: on any other
// host every response carries noindex.

import { decide } from '../../lib/routing.js';

const MANIFEST_KEY = 'atlas/_origin-fallback/manifest.json';
const ORIGIN_TIMEOUT_MS = 8000;
const BREAKER_MS = 30_000;

let manifestCache = null;
let originDownUntil = 0;

const securityHeaders = (cfg) => {
  const h = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'SAMEORIGIN',
  };
  if (cfg.indexable) h['strict-transport-security'] = 'max-age=63072000';
  else h['x-robots-tag'] = 'noindex, nofollow, noarchive';
  return h;
};

export function configFor(env, url) {
  const hosts = new Set(String(env.FALLBACK_HOSTS || 'livdar.com,www.livdar.com').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean));
  const production = env.FALLBACK_ENV === 'production';
  return { production, indexable: production && hosts.has(url.hostname.toLowerCase()) };
}

// Whether an origin response means "the origin is not serving". A 404 from the app is the
// app speaking and is passed through; a Vercel platform error is not the app at all.
export function originFailed(response) {
  if (!response) return true;
  if (response.status === 402 || response.status >= 500) return true;
  const platformError = response.headers.get('x-vercel-error');
  return Boolean(platformError) && platformError !== 'NOT_FOUND';
}

async function tryOrigin(request, env) {
  if (Date.now() < originDownUntil) return { response: null, reason: 'breaker-open' };
  // On the zone, fetch(request) goes to the origin named in the zone's DNS (the Vercel
  // record), never back into a Worker. ORIGIN_URL exists only so the Worker can be tested
  // on workers.dev against the real origin.
  const target = env.ORIGIN_URL ? new Request(env.ORIGIN_URL.replace(/\/$/, '') + new URL(request.url).pathname + new URL(request.url).search, request) : request;
  try {
    const response = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(ORIGIN_TIMEOUT_MS) });
    if (originFailed(response)) {
      originDownUntil = Date.now() + BREAKER_MS;
      return { response: null, reason: 'origin-' + response.status + (response.headers.get('x-vercel-error') ? '-' + response.headers.get('x-vercel-error') : '') };
    }
    return { response, reason: 'ok' };
  } catch (error) {
    originDownUntil = Date.now() + BREAKER_MS;
    return { response: null, reason: 'origin-unreachable' };
  }
}

// Held for a minute, so a re-uploaded snapshot is picked up without a deploy.
const MANIFEST_TTL_MS = 60_000;
let manifestAt = 0;
async function loadManifest(env) {
  if (manifestCache && Date.now() - manifestAt < MANIFEST_TTL_MS) return manifestCache;
  const object = await env.ATLAS_R2.get(MANIFEST_KEY);
  if (!object) return manifestCache;
  manifestCache = await object.json();
  manifestAt = Date.now();
  return manifestCache;
}

function respond(cfg, body, status, headers, request, reason) {
  const h = new Headers({ ...headers, ...securityHeaders(cfg), 'x-livdar-origin': 'snapshot', 'x-livdar-fallback-reason': reason });
  return new Response(request.method === 'HEAD' ? null : body, { status, headers: h });
}

async function serveSnapshot(request, env, url, cfg, reason) {
  const redirect = (location, status) => respond(cfg, null, status, { location, 'cache-control': 'public, max-age=0, must-revalidate' }, request, reason);

  // www -> apex, which is what the Vercel domain setting does (308).
  if (url.hostname.toLowerCase().startsWith('www.')) {
    return redirect('https://' + url.hostname.slice(4) + url.pathname + url.search, 308);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return respond(cfg, 'The application is temporarily unavailable.\n', 503, { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '120', 'cache-control': 'no-store' }, request, reason);
  }
  const manifest = await loadManifest(env);
  if (!manifest) {
    return respond(cfg, 'The application is temporarily unavailable.\n', 503, { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '120', 'cache-control': 'no-store' }, request, reason + '+no-snapshot');
  }
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { path = url.pathname; }
  // Traversal means a SEGMENT that is '.' or '..'. Not '..' anywhere: Next names its
  // catch-all route chunks after their folders, /_next/static/chunks/app/[lang]/[...slug]/,
  // and rejecting those 404ed the JavaScript of every eSIM page.
  if (path.includes('\\') || path.split('/').some((seg) => seg === '..' || seg === '.')) return notFound(request, env, manifest, cfg, reason);

  // Server code the snapshot cannot run.
  if (path.startsWith('/api/')) {
    return respond(cfg, JSON.stringify({ error: 'temporarily unavailable' }), 503, { 'content-type': 'application/json', 'retry-after': '120', 'cache-control': 'no-store' }, request, reason);
  }

  const special = manifest.special[path];
  if (special) return respond(cfg, special.body, 200, { 'content-type': special.type, ...special.headers }, request, reason);

  // A file: an exact entry or nothing.
  const isFile = /\.[A-Za-z0-9]+$/.test(path);
  if (isFile) {
    // robots.txt on a non-production host must not invite a crawl of this copy.
    if (path === '/robots.txt' && !cfg.indexable) {
      return respond(cfg, 'User-agent: *\nDisallow: /\n', 200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }, request, reason);
    }
    const entry = manifest.entries[path];
    if (!entry) return notFound(request, env, manifest, cfg, reason);
    return fromR2(request, env, entry.key, entry.status, { 'content-type': entry.type, ...entry.headers }, cfg, reason, manifest, entry.encoding);
  }

  // A page. trailingSlash: true first, as Next applies it before anything else.
  if (!path.endsWith('/')) return redirect(url.pathname + '/' + url.search, 308);
  // next.config.mjs redirects().
  if (path === '/esim/') return redirect('/en/esim/', 308);
  if (path === '/guides/') return redirect('/en/guides/', 308);
  // The middleware, by its own rules (lib/routing.js), on the paths its matcher covers.
  const d = decide(path, request.headers.get('accept-language'));
  if (d.action === 'redirect') return redirect(d.pathname + (d.keepSearch ? url.search : ''), d.status);

  const entry = manifest.entries[path];
  if (!entry) return notFound(request, env, manifest, cfg, reason);
  const isRsc = request.headers.get('rsc') === '1' || url.searchParams.has('_rsc');
  if (isRsc && entry.rsc) {
    return fromR2(request, env, entry.rsc, 200, { 'content-type': 'text/x-component', vary: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch', 'cache-control': 'public, max-age=0, must-revalidate' }, cfg, reason, manifest);
  }
  return fromR2(request, env, entry.key, entry.status, { 'content-type': entry.type, 'cache-control': 'public, max-age=0, must-revalidate', vary: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch', ...entry.headers }, cfg, reason, manifest);
}

async function fromR2(request, env, key, status, headers, cfg, reason, manifest, encoding) {
  const object = await env.ATLAS_R2.get(key);
  // Listed in the snapshot and missing from storage is an incomplete upload: 503, not 404.
  if (!object) return respond(cfg, 'The application is temporarily unavailable.\n', 503, { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '120', 'cache-control': 'no-store' }, request, reason + '+missing-object');
  // The one binary in the snapshot is stored as base64 text (see build-snapshot.mjs).
  const body = encoding === 'base64' ? Uint8Array.from(atob(await object.text()), (c) => c.charCodeAt(0)) : object.body;
  return respond(cfg, body, status, { ...headers, 'x-livdar-snapshot': manifest.buildId }, request, reason);
}

async function notFound(request, env, manifest, cfg, reason) {
  const entry = manifest.entries['/__not-found__/'];
  const object = entry ? await env.ATLAS_R2.get(entry.key) : null;
  return respond(cfg, object ? object.body : 'Not Found\n', 404, { 'content-type': object ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' }, request, reason);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cfg = configFor(env, url);

    if (url.pathname === '/__fallback-health') {
      const manifest = await loadManifest(env).catch(() => null);
      return Response.json({
        service: 'livdar-origin-fallback', production: cfg.production, indexable: cfg.indexable,
        snapshot: manifest ? { buildId: manifest.buildId, productionCommit: manifest.productionCommit, sourceMatchesProduction: manifest.sourceMatchesProduction, counts: manifest.counts } : null,
        originBreakerOpen: Date.now() < originDownUntil,
      }, { status: manifest ? 200 : 503, headers: { ...securityHeaders(cfg), 'cache-control': 'no-store' } });
    }

    const { response, reason } = await tryOrigin(request, env);
    if (response) {
      // The origin's own answer, unchanged, except that a non-production host is noindex.
      if (cfg.indexable) return response;
      const headers = new Headers(response.headers);
      headers.set('x-robots-tag', 'noindex, nofollow, noarchive');
      headers.set('x-livdar-origin', 'origin');
      return new Response(response.body, { status: response.status, headers });
    }
    try {
      return await serveSnapshot(request, env, url, cfg, reason);
    } catch (error) {
      console.error(JSON.stringify({ event: 'fallback.error', path: url.pathname, reason, error: String(error && error.stack || error).slice(0, 1000) }));
      return new Response('The application is temporarily unavailable.\n', { status: 503, headers: { ...securityHeaders(cfg), 'content-type': 'text/plain; charset=utf-8', 'retry-after': '120' } });
    }
  },
};
