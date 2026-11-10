// Prove the origin fallback serves the non-Atlas site as the Next.js app does.
//
// Every URL in the snapshot — each eSIM page, its RSC payload, every route handler, every
// /_next/static file, public/ — is fetched from the reference (`next start` on the same
// production build) and from the deployed fallback Worker, and compared on status,
// Location, content type and the sha256 of the body. Then the behaviour around the pages:
// the root and locale redirects the middleware makes, trailingSlash's 308, next.config's
// redirects, www -> apex, the 404 page and its status, and the API routes, which the
// fallback must answer 503 rather than pretend.
//
// Against workers.dev, the fallback's origin is livdar.com itself. While Vercel answers
// 402, every response here comes from the snapshot, which is the path being proven, and
// the run asserts that it did (x-livdar-origin: snapshot).
//
// Usage: ATLAS_ORIGIN_A=<next start> ATLAS_ORIGIN_B=<fallback> node scripts/atlas/verify-fallback.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const A = (process.env.ATLAS_ORIGIN_A || '').replace(/\/$/, '');
const B = (process.env.ATLAS_ORIGIN_B || '').replace(/\/$/, '');
if (!A || !B) throw new Error('ATLAS_ORIGIN_A (next start) and ATLAS_ORIGIN_B (fallback) are required');
const DIR = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : '.atlas-fallback-snapshot';
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'reports/atlas-fallback-verify.json';
const manifest = JSON.parse(await readFile(DIR + '/manifest.json', 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');

async function get(origin, path, headers = {}) {
  const r = await fetch(origin + path, { redirect: 'manual', headers: { 'user-agent': 'livdar-fallback-verify/1', ...headers } });
  const body = Buffer.from(await r.arrayBuffer());
  return { status: r.status, location: r.headers.get('location'), type: (r.headers.get('content-type') || '').split(';')[0], origin: r.headers.get('x-livdar-origin'), robots: r.headers.get('x-robots-tag'), body };
}

const rows = [];
async function compare(path, { headers = {}, label = path, expectStatus } = {}) {
  const [a, b] = await Promise.all([get(A, path, headers), get(B, path, headers)]);
  const problems = [];
  if (expectStatus != null) { if (b.status !== expectStatus) problems.push('status ' + b.status + ', expected ' + expectStatus); }
  else if (a.status !== b.status) problems.push('status ' + a.status + ' vs ' + b.status);
  if (expectStatus == null && a.location !== b.location) {
    // Next writes a relative Location; either form is the same redirect.
    const abs = (l) => (l ? new URL(l, 'https://livdar.com').pathname + new URL(l, 'https://livdar.com').search : l);
    if (abs(a.location) !== abs(b.location)) problems.push('location ' + a.location + ' vs ' + b.location);
  }
  if (a.status === 200 && b.status === 200) {
    if (a.type !== b.type) problems.push('content-type ' + a.type + ' vs ' + b.type);
    if (sha(a.body) !== sha(b.body)) problems.push('body differs (' + a.body.length + ' vs ' + b.body.length + ' bytes)');
  }
  // robots.txt on a host that is not production is the fallback's Disallow, by design:
  // a copy of livdar.com on workers.dev must not be crawled. Assert that instead.
  if (path === '/robots.txt' && /noindex/.test(b.robots || '')) {
    const i = problems.findIndex((p) => p.startsWith('body differs'));
    if (i > -1) problems.splice(i, 1);
    if (!b.body.toString().includes('Disallow: /')) problems.push('non-production robots.txt does not disallow');
  }
  if (b.origin !== 'snapshot') problems.push('served by "' + b.origin + '", not the snapshot');
  rows.push({ path: label, status: [a.status, b.status], problems });
}

// Every snapshot URL, and the RSC payload of every page.
const paths = Object.keys(manifest.entries).filter((p) => p !== '/__not-found__/');
for (const p of paths) await compare(p);
for (const p of paths.filter((p) => manifest.entries[p].rsc)) await compare(p, { headers: { rsc: '1' }, label: p + ' [rsc]' });

// The behaviour around the pages.
await compare('/', { label: '/ (accept-language de)', headers: { 'accept-language': 'de-DE,de;q=0.9' } });
await compare('/', { label: '/ (accept-language ro)', headers: { 'accept-language': 'ro' } });
await compare('/', { label: '/ (no accept-language)' });
await compare('/es/', { label: '/es/ (locale without an eSIM market)' });
await compare('/en/esim', { label: '/en/esim (no trailing slash)' });
await compare('/esim', { label: '/esim (next.config redirect)' });
await compare('/guides', { label: '/guides (next.config redirect)' });
await compare('/en/esim/this-page-does-not-exist/', { label: 'unknown eSIM page' });
await compare('/indexnow-key.txt');
await compare('/api/runtime', { expectStatus: 503, label: '/api/runtime (server code: 503 while the origin is down)' });

// www -> apex, the Vercel domain setting. The workers.dev host cannot be www, so the
// redirect is checked by asking the fallback as www through its own URL is not possible;
// it is covered by tests/atlas-cloudflare-fallback.test.mjs on the built bundle instead.

const failed = rows.filter((r) => r.problems.length);
const report = { verifiedAt: new Date().toISOString(), reference: A, fallback: B, snapshot: manifest.buildId, productionCommit: manifest.productionCommit, sourceMatchesProduction: manifest.sourceMatchesProduction, checked: rows.length, identical: rows.length - failed.length, failed: failed.length, failures: failed.slice(0, 200) };
await writeFile(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ checked: report.checked, identical: report.identical, failed: report.failed, examples: failed.slice(0, 6) }, null, 1));
process.exit(failed.length ? 1 : 0);
