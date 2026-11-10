// The origin fallback, on its BUILT bundle, against a scripted origin.
//
// The deployed fallback has only ever met an origin answering 402, so these are the
// behaviours a live run cannot show: that a healthy origin is passed through untouched,
// that an app's own 404 is the app's answer and not an outage, that the breaker stops a
// dead origin costing a round trip per request and lets it back after, and the production
// host rules (indexable on livdar.com, www -> apex).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const BUNDLE = new URL('cloudflare/dist/fallback-worker.js', ROOT);
const SNAPSHOT = new URL('.atlas-fallback-snapshot/', ROOT).pathname;
const skip = !existsSync(BUNDLE) ? 'run `node cloudflare/fallback/build.mjs` first'
  : !existsSync(join(SNAPSHOT, 'manifest.json')) ? 'run `node cloudflare/fallback/build-snapshot.mjs` first' : false;

const r2 = {
  async get(key) {
    const file = key === 'atlas/_origin-fallback/manifest.json' ? join(SNAPSHOT, 'manifest.json') : join(SNAPSHOT, 'objects', key);
    if (!existsSync(file)) return null;
    const text = readFileSync(file, 'utf8');
    return { body: text, text: async () => text, json: async () => JSON.parse(text) };
  },
};

let worker;
async function load() {
  // A fresh module per test, so the breaker state does not leak between them.
  worker = (await import(pathToFileURL(BUNDLE.pathname).href + '?t=' + Math.random())).default;
}

function withOrigin(handler) {
  const calls = [];
  globalThis.fetch = async (req) => { calls.push(new URL(req.url).pathname); return handler(req); };
  return calls;
}
const env = (extra = {}) => ({ ATLAS_R2: r2, FALLBACK_ENV: 'production', FALLBACK_HOSTS: 'livdar.com,www.livdar.com', ...extra });
const get = (url, headers = {}) => worker.fetch(new Request(url, { headers }), env());

test('a healthy origin is passed through untouched', { skip }, async () => {
  await load();
  withOrigin(() => new Response('from vercel', { status: 200, headers: { 'x-from': 'origin' } }));
  const res = await get('https://livdar.com/en/esim/');
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'from vercel');
  assert.equal(res.headers.get('x-from'), 'origin');
  assert.equal(res.headers.get('x-livdar-origin'), null, 'an origin response on livdar.com must come back exactly as the origin sent it');
});

test("the app's own 404 is passed through, not replaced by the snapshot", { skip }, async () => {
  await load();
  withOrigin(() => new Response('app not found', { status: 404 }));
  const res = await get('https://livdar.com/en/esim/nowhere/');
  assert.equal(res.status, 404);
  assert.equal(await res.text(), 'app not found');
});

test('402, 5xx, a Vercel platform error and a dead origin all fall back to the snapshot', { skip }, async () => {
  for (const origin of [
    () => new Response('Payment required', { status: 402, headers: { 'x-vercel-error': 'DEPLOYMENT_DISABLED' } }),
    () => new Response('bad gateway', { status: 502 }),
    () => new Response('nope', { status: 404, headers: { 'x-vercel-error': 'DEPLOYMENT_NOT_FOUND' } }),
    () => { throw new TypeError('connection refused'); },
  ]) {
    await load();
    withOrigin(origin);
    const res = await get('https://livdar.com/en/esim/');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-livdar-origin'), 'snapshot');
    const html = await res.text();
    assert.ok(html.includes('<link rel="canonical" href="https://livdar.com/en/esim/"'), 'the snapshot page is not the production page');
    // On livdar.com the snapshot is production: indexable, HSTS, no noindex.
    assert.equal(res.headers.get('x-robots-tag'), null);
    assert.equal(res.headers.get('strict-transport-security'), 'max-age=63072000');
  }
});

test('after a failure the origin is skipped for the breaker window, then tried again', { skip }, async () => {
  await load();
  const calls = withOrigin(() => new Response('', { status: 402 }));
  await get('https://livdar.com/en/');
  await get('https://livdar.com/de/');
  await get('https://livdar.com/ro/');
  assert.equal(calls.length, 1, 'a dead origin was asked ' + calls.length + ' times inside the breaker window');
  const realNow = Date.now;
  Date.now = () => realNow() + 31_000;
  try {
    withOrigin(() => new Response('back', { status: 200 }));
    const res = await get('https://livdar.com/en/');
    assert.equal(await res.text(), 'back', 'the origin was not retried after the breaker window');
  } finally { Date.now = realNow; }
});

test('while serving the snapshot it keeps the redirects the app made', { skip }, async () => {
  await load();
  withOrigin(() => new Response('', { status: 402 }));
  const loc = async (url, headers) => { const r = await get(url, headers); return [r.status, r.headers.get('location')]; };
  assert.deepEqual(await loc('https://www.livdar.com/en/esim/?a=1'), [308, 'https://livdar.com/en/esim/?a=1'], 'www -> apex, as the Vercel domain setting does');
  assert.deepEqual(await loc('https://livdar.com/en/esim'), [308, '/en/esim/']);
  assert.deepEqual(await loc('https://livdar.com/esim'), [308, '/esim/']);
  assert.deepEqual(await loc('https://livdar.com/esim/'), [308, '/en/esim/']);
  assert.deepEqual(await loc('https://livdar.com/', { 'accept-language': 'de-DE' }), [307, '/de/']);
  const nf = await get('https://livdar.com/en/esim/does-not-exist/');
  assert.equal(nf.status, 404);
  const api = await get('https://livdar.com/api/runtime');
  assert.equal(api.status, 503);
  assert.equal(api.headers.get('retry-after'), '120');
});

test('the snapshot serves catch-all route chunks, whose names contain "..."', { skip }, async () => {
  await load();
  withOrigin(() => new Response('', { status: 402 }));
  const manifest = JSON.parse(readFileSync(join(SNAPSHOT, 'manifest.json'), 'utf8'));
  const chunk = Object.keys(manifest.entries).find((p) => p.includes('[...slug]'));
  assert.ok(chunk, 'no [...slug] chunk in the snapshot');
  assert.equal((await get('https://livdar.com' + chunk)).status, 200);
  // The URL parser removes '..' segments (literal or %2e%2e) before the Worker sees the
  // path, on Cloudflare as here, so no traversal form can reach outside the snapshot:
  // whatever it normalises to, it is not served as a file.
  for (const p of ['/_next/static/../../etc/passwd', '/_next/static/%2e%2e/%2e%2e/etc/passwd', '/_next/static/chunks/..%2f..%2fmanifest.json']) {
    const res = await get('https://livdar.com' + p);
    assert.notEqual(res.status, 200, p + ' was served');
  }
});

test('on any host but livdar.com the fallback is noindex and its robots.txt disallows', { skip }, async () => {
  await load();
  withOrigin(() => new Response('', { status: 402 }));
  const page = await worker.fetch(new Request('https://livdar-origin-fallback.example.workers.dev/en/esim/'), env());
  assert.match(page.headers.get('x-robots-tag') || '', /noindex/);
  const robots = await worker.fetch(new Request('https://livdar-origin-fallback.example.workers.dev/robots.txt'), env());
  assert.match(await robots.text(), /Disallow: \//);
  const prodRobots = await get('https://livdar.com/robots.txt');
  assert.match(await prodRobots.text(), /Allow: \//, 'production robots.txt is not the production file');
});
