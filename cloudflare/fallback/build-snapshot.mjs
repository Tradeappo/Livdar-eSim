// Package the non-Atlas half of livdar.com from an existing Next.js production build, so
// Cloudflare can serve it while the Vercel origin cannot.
//
// NOTHING IS BUILT HERE. It reads the output `next build` already wrote to .next/ — the
// prerendered HTML of every eSIM page, the RSC payloads client navigation fetches, the
// prerendered route handlers (robots.txt, the sitemap index, the eSIM sitemaps,
// llms.txt), /_next/static and public/ — and copies it, byte for byte, with the status
// and headers Next recorded for each file in its .meta. The build must be of the commit
// production runs; the manifest records the build id and the commit so that is checkable.
//
// What it leaves out, on purpose:
//   - every Atlas path, and the Atlas sitemaps: the Atlas Worker serves those, and the
//     routes send them there before this fallback is ever asked;
//   - the two dynamic API routes (/api/runtime, /api/programmatic/eligibility): no page
//     calls either, and the fallback answers them 503 while the origin is down.
//
// Usage: node cloudflare/fallback/build-snapshot.mjs [--next .next] [--out .atlas-fallback-snapshot]

import { readFile, writeFile, mkdir, rm, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { isAtlasPath } from '../../lib/atlas/atlas-edge.js';

const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const NEXT = argOf('next', '.next');
const OUT = argOf('out', '.atlas-fallback-snapshot');
const APP = join(NEXT, 'server', 'app');

// The legacy Atlas generation's segments (lib/atlas/i18n.js SEGMENTS), owned by the Atlas.
const LEGACY = new Set(['cities', 'airports', 'staedte', 'flughaefen', 'orase', 'aeroporturi']);
const isAtlas = (path) => isAtlasPath(path) || LEGACY.has(path.split('/')[2] || '');

// IndexNow's key is served by a force-dynamic route that reads INDEXNOW_KEY, so the build
// holds no output for it. Vercel stores the value as a plain variable whose own comment
// says "Public by design: the site serves it at /indexnow-key.txt", which is why it can be
// copied into a static fallback without being a secret in one.
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '0bcf9bf83bfa571444cc5bb9d4ca226d316e614ae87d3523';

if (!existsSync(APP)) throw new Error(APP + ' does not exist: this packages an existing `next build`, it does not run one');
const buildId = (await readFile(join(NEXT, 'BUILD_ID'), 'utf8')).trim();
let commit = null;
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* no git */ }

// The commit production runs (the current Vercel production deployment). The snapshot is
// only a faithful fallback if the site source it was built from is that commit's, so the
// check is recorded rather than assumed: git diff of every path that shapes the output.
const PRODUCTION_COMMIT = argOf('production-commit', '8d6f1e2df56fbec4e36736ef890837e5f0901530');
const SOURCE_PATHS = ['app', 'components', 'lib', 'data', 'public', 'middleware.js', 'next.config.mjs', 'package.json', 'package-lock.json'];
let sourceMatchesProduction = null;
try {
  execFileSync('git', ['diff', '--quiet', PRODUCTION_COMMIT, 'HEAD', '--', ...SOURCE_PATHS]);
  sourceMatchesProduction = true;
} catch (error) { sourceMatchesProduction = error.status === 1 ? false : null; }
if (sourceMatchesProduction === false && !process.argv.includes('--allow-source-drift')) {
  throw new Error('the site source differs from production commit ' + PRODUCTION_COMMIT + '; a fallback built from it would serve pages production does not');
}

const PREFIX = 'atlas/_origin-fallback/' + buildId + '/';
// Binary is decided by content type, not file name: a route handler's output is a .body
// file whatever it contains.
const isBinary = (type) => !/^(text\/|application\/(javascript|json|xml)|image\/svg)/.test(type);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const entries = {};
const objects = [];
async function add(urlPath, file, { type, status = 200, headers = {}, rscFile = null }) {
  // A binary file is stored as base64 TEXT under <key>.b64 and decoded by the Worker.
  // The ingest route that writes the bucket carries text bodies only, and there is one
  // binary in the whole site (the 70 KB social card), so this is cheaper than a second
  // write path.
  const binary = isBinary(type);
  const key = PREFIX + 'o' + urlPath.replace(/\/$/, '/index') + (binary ? '.b64' : '');
  const raw = await readFile(file);
  const body = binary ? Buffer.from(raw.toString('base64')) : raw;
  objects.push({ key, file, type, binary: false, encoded: binary, bytes: body.length, md5: createHash('md5').update(body).digest('hex') });
  const entry = { key, type, status };
  if (binary) { entry.encoding = 'base64'; entry.sha256 = createHash('sha256').update(raw).digest('hex'); }
  if (Object.keys(headers).length) entry.headers = headers;
  if (rscFile) {
    const rkey = key + '.rsc';
    const rbody = await readFile(rscFile);
    objects.push({ key: rkey, file: rscFile, type: 'text/x-component', binary: false, bytes: rbody.length, md5: createHash('md5').update(rbody).digest('hex') });
    entry.rsc = rkey;
  }
  entries[urlPath] = entry;
}

// Headers Next stored per output that are about its own cache, not about the response a
// reader gets. x-nextjs-* and x-next-cache-tags are internal; content-type is set from
// the entry. Everything else (cache-control, x-robots-tag) is kept as Next sent it.
const keepHeaders = (h = {}) => Object.fromEntries(Object.entries(h).filter(([k]) => !/^x-next(js)?-/.test(k) && k !== 'content-type'));

// 1. Prerendered pages.
let pages = 0;
for await (const file of walk(APP)) {
  if (!file.endsWith('.html')) continue;
  const rel = '/' + relative(APP, file).split(sep).join('/').replace(/\.html$/, '');
  if (rel === '/_not-found') continue;
  const urlPath = rel === '/index' ? '/' : rel + '/';
  if (isAtlas(urlPath)) continue;
  const metaFile = file.replace(/\.html$/, '.meta');
  const meta = existsSync(metaFile) ? JSON.parse(await readFile(metaFile, 'utf8')) : {};
  const rsc = file.replace(/\.html$/, '.rsc');
  await add(urlPath, file, { type: 'text/html; charset=utf-8', status: meta.status || 200, headers: keepHeaders(meta.headers), rscFile: existsSync(rsc) ? rsc : null });
  pages += 1;
}
// The 404 page, under a name no URL can reach.
{
  const meta = JSON.parse(await readFile(join(APP, '_not-found.meta'), 'utf8'));
  await add('/__not-found__/', join(APP, '_not-found.html'), { type: 'text/html; charset=utf-8', status: 404, headers: keepHeaders(meta.headers), rscFile: join(APP, '_not-found.rsc') });
}

// 2. Prerendered route handlers: robots.txt, sitemap.xml, the eSIM sitemaps, llms.txt,
//    the v41 assets. The Atlas sitemaps are the Atlas Worker's.
let handlers = 0;
for await (const file of walk(APP)) {
  if (!file.endsWith('.body')) continue;
  const urlPath = '/' + relative(APP, file).split(sep).join('/').replace(/\.body$/, '');
  if (urlPath.startsWith('/sitemap/atlas-')) continue;
  const meta = JSON.parse(await readFile(file.replace(/\.body$/, '.meta'), 'utf8'));
  await add(urlPath, file, { type: meta.headers?.['content-type'] || 'application/octet-stream', status: meta.status || 200, headers: keepHeaders(meta.headers) });
  handlers += 1;
}

// 3. /_next/static, content-hashed by Next, so immutable.
let statics = 0;
const typeOf = (f) => (f.endsWith('.js') ? 'application/javascript; charset=utf-8' : f.endsWith('.css') ? 'text/css; charset=utf-8'
  : f.endsWith('.json') ? 'application/json' : f.endsWith('.svg') ? 'image/svg+xml' : f.endsWith('.png') ? 'image/png'
  : /\.jpe?g$/.test(f) ? 'image/jpeg' : f.endsWith('.webp') ? 'image/webp' : f.endsWith('.gif') ? 'image/gif' : f.endsWith('.ico') ? 'image/x-icon'
  : f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.txt') ? 'text/plain; charset=utf-8' : 'application/octet-stream');
for await (const file of walk(join(NEXT, 'static'))) {
  const urlPath = '/_next/static/' + relative(join(NEXT, 'static'), file).split(sep).join('/');
  await add(urlPath, file, { type: typeOf(file), headers: { 'cache-control': 'public, max-age=31536000, immutable' } });
  statics += 1;
}

// 4. public/.
for await (const file of walk('public')) {
  if (file.endsWith('.gitkeep')) continue;
  const urlPath = '/' + relative('public', file).split(sep).join('/');
  await add(urlPath, file, { type: typeOf(file), headers: { 'cache-control': 'public, max-age=0, must-revalidate' } });
}

// 5. Everything the build has no file for is listed so the Worker knows it, rather than
//    guessing from a 404.
const special = {
  '/indexnow-key.txt': { body: INDEXNOW_KEY + '\n', type: 'text/plain; charset=utf-8', headers: { 'cache-control': 'public, max-age=300, s-maxage=300' } },
};

// Write the objects and the manifest.
await rm(OUT, { recursive: true, force: true });
for (const o of objects) {
  const target = join(OUT, 'objects', o.key);
  await mkdir(dirname(target), { recursive: true });
  const raw = await readFile(o.file);
  await writeFile(target, o.encoded ? raw.toString('base64') : raw);
}
const manifest = {
  schema: 1,
  buildId,
  commit,
  productionCommit: PRODUCTION_COMMIT,
  sourceMatchesProduction,
  createdAt: new Date().toISOString(),
  prefix: PREFIX,
  counts: { pages, handlers, statics, objects: objects.length },
  bytes: objects.reduce((n, o) => n + o.bytes, 0),
  entries,
  special,
};
await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest));
await writeFile(join(OUT, 'objects.json'), JSON.stringify(objects.map(({ key, type, binary, bytes, md5 }) => ({ key, type, binary, bytes, md5 })), null, 1));
console.log(JSON.stringify({ buildId, commit, ...manifest.counts, megabytes: +(manifest.bytes / 1048576).toFixed(2), encodedBinary: objects.filter((o) => o.encoded).map((o) => o.key), out: OUT }, null, 1));
