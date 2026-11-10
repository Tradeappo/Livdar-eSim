// Atlas SEO Cloudflare staging Worker. Original Next.js app and Vercel projects are unchanged.
// Routes are enabled only after verified snapshots have been exported to R2.
// Uses exact URL lookups (never invents SEO pages) and fails closed when storage is unavailable.
const normalized = (pathname) => {
  let p;
  try { p = decodeURI(pathname); } catch { return null; }
  if (!p.startsWith('/') || p.includes('..') || p.includes('\\') || /[\x00-\x1f]/.test(p)) return null;
  p = p.replace(/\/+/g, '/');
  return p === '/' ? '/' : p.endsWith('/') ? p : p + '/';
};
const keyForPage = (path) => 'atlas/html' + path + 'index.html';
const META_KEY = 'atlas/metadata/route-manifest.json';
const NON_INDEX = { 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' };
let manifestCache = null;

async function manifest(env) {
  if (manifestCache) return manifestCache;
  if (!env.ATLAS_R2) return null;
  const object = await env.ATLAS_R2.get(META_KEY);
  if (!object) return null;
  const doc = await object.json();
  if (doc.schema !== 1 || !Array.isArray(doc.paths)) throw new Error('Invalid Atlas route manifest');
  manifestCache = { ...doc, set: new Set(doc.paths) };
  return manifestCache;
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/__health') {
      return Response.json({
        service: 'livdar-atlas', environment: 'staging',
        r2Bound: !!env.ATLAS_R2, dataReady: !!(env.ATLAS_R2 && await env.ATLAS_R2.head(META_KEY)),
        productionChanged: false
      }, { headers: NON_INDEX });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method Not Allowed', {status:405, headers: NON_INDEX});
    if (!env.ATLAS_R2) return new Response('Atlas data not installed', {status:503, headers: NON_INDEX});
    try {
      const index = await manifest(env);
      if (!index) return new Response('Atlas route manifest not installed', {status:503, headers: NON_INDEX});
      const isSitemap = /^\/sitemap-atlas\/[a-zA-Z0-9-]+\.xml$/.test(url.pathname);
      let key, contentType;
      if (isSitemap) {
        if (!index.sitemaps?.includes(url.pathname)) return new Response('Not Found', {status:404, headers: NON_INDEX});
        key = 'atlas/xml' + url.pathname; contentType='application/xml; charset=utf-8';
      } else {
        const path = normalized(url.pathname);
        if (!path || !index.set.has(path)) return new Response('Not Found', {status:404, headers: NON_INDEX});
        key = keyForPage(path); contentType='text/html; charset=utf-8';
      }
      const cache = caches.default;
      const cacheKey = new Request('https://atlas-staging.internal'+url.pathname);
      const cached = await cache.match(cacheKey);
      if (cached) return request.method === 'HEAD' ? new Response(null, cached) : cached;
      const object = await env.ATLAS_R2.get(key);
      if (!object) return new Response('Atlas snapshot is missing', {status:503, headers: NON_INDEX});
      const headers = new Headers({ 'content-type': contentType, 'cache-control':'public, max-age=0, s-maxage=3600', 'x-atlas-origin':'cloudflare-r2', 'x-robots-tag':'noindex, nofollow' });
      const response = new Response(object.body, { status:200, headers });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return request.method === 'HEAD' ? new Response(null, {status:200,headers}) : response;
    } catch(error) {
      console.error('Atlas Worker error', String(error));
      return new Response('Atlas temporarily unavailable', {status:503, headers: NON_INDEX});
    }
  }
};