// Fetch EVERY exported Atlas URL and every sitemap from a deployed Worker and prove each
// response is exactly what it should be.
//
// "Exactly" means byte-identical: each page body is compared, by sha256, with what the
// same Worker bundle renders locally from the export (cloudflare/simulate.mjs --serve),
// and each sitemap with the file the exporter wrote. Identity on all 6,812 pages proves
// three things at once that a sample cannot: R2 holds the right object for every URL, no
// published page is missing (a missing object would be a 404 here), and the deployed
// Worker is the build that was tested. The SEO content of that build is proven separately,
// against the Next.js production renderer, by compare-cloudflare.mjs.
//
// Per page it also checks the headers that decide indexing: status 200, text/html, the
// manifest's version, and X-Robots-Tag present on staging / absent on production.
//
// Usage:
//   ATLAS_ORIGIN=<deployed>  ATLAS_LOCAL=<simulate --serve origin>  \
//   node scripts/atlas/sweep-cloudflare.mjs [--production] [--out FILE]

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const ORIGIN = (process.env.ATLAS_ORIGIN || '').replace(/\/$/, '');
const LOCAL = (process.env.ATLAS_LOCAL || '').replace(/\/$/, '');
if (!ORIGIN || !LOCAL) throw new Error('ATLAS_ORIGIN (deployed) and ATLAS_LOCAL (simulate --serve) are required');
const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const DIR = argOf('dir', '.atlas-cloudflare-export');
const OUT = argOf('out', 'reports/atlas-cloudflare-sweep.json');
const PRODUCTION = process.argv.includes('--production');
const PARALLEL = Number(process.env.ATLAS_SWEEP_PARALLEL || 8);

const manifest = JSON.parse(await readFile(DIR + '/manifest.json', 'utf8'));
const index = JSON.parse(await readFile(DIR + '/upload-index.json', 'utf8'));
const pages = Object.keys(index.objects).filter((k) => !k.startsWith('sitemap:'));
const sitemapIds = Object.keys(index.objects).filter((k) => k.startsWith('sitemap:') && k !== 'sitemap:index').map((k) => k.slice(8));
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

async function get(origin, path) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const r = await fetch(origin + path, { redirect: 'manual', headers: { 'user-agent': 'livdar-atlas-sweep/1' } });
      const body = Buffer.from(await r.arrayBuffer());
      if (r.status >= 500 && attempt < 3) { await new Promise((ok) => setTimeout(ok, 500 * 2 ** attempt)); continue; }
      return { status: r.status, headers: Object.fromEntries(r.headers.entries()), body };
    } catch (error) {
      if (attempt === 3) return { status: 0, headers: {}, body: Buffer.from(String(error)) };
      await new Promise((ok) => setTimeout(ok, 500 * 2 ** attempt));
    }
  }
  return null;
}

const failures = [];
const stats = { pages: 0, identical: 0, cacheHit: 0, cacheMiss: 0, bytes: 0, latencyMs: [] };

let cursor = 0;
async function worker() {
  while (cursor < pages.length) {
    const path = pages[cursor];
    cursor += 1;
    const t0 = performance.now();
    const [deployed, local] = await Promise.all([get(ORIGIN, path), get(LOCAL, path)]);
    stats.latencyMs.push(performance.now() - t0);
    stats.pages += 1;
    stats.bytes += deployed.body.length;
    const h = deployed.headers;
    if (h['x-atlas-cache'] === 'hit') stats.cacheHit += 1; else if (h['x-atlas-cache'] === 'miss') stats.cacheMiss += 1;
    const problems = [];
    if (deployed.status !== 200) problems.push('status ' + deployed.status);
    if (!String(h['content-type'] || '').startsWith('text/html')) problems.push('content-type ' + h['content-type']);
    if (h['x-atlas-version'] !== manifest.version) problems.push('serves version ' + h['x-atlas-version'] + ', export is ' + manifest.version);
    if (PRODUCTION && h['x-robots-tag']) problems.push('production page carries X-Robots-Tag: ' + h['x-robots-tag']);
    if (!PRODUCTION && !/noindex/.test(h['x-robots-tag'] || '')) problems.push('staging page without noindex header');
    if (deployed.status === 200 && local.status === 200 && sha(deployed.body) !== sha(local.body)) problems.push('body differs from the local render of the same build');
    if (problems.length) failures.push({ path, problems }); else stats.identical += 1;
    if (stats.pages % 1000 === 0) console.log('swept', stats.pages, 'of', pages.length, 'failures', failures.length);
  }
}
await Promise.all(Array.from({ length: PARALLEL }, worker));

// Sitemaps: the production URL of every child, and the Atlas index, byte for byte.
const sitemapFailures = [];
let sitemapUrls = 0;
for (const id of [...sitemapIds, 'index']) {
  const path = id === 'index' ? '/sitemap-atlas/index.xml' : '/sitemap/' + id + '.xml';
  const file = await readFile(DIR + '/sitemaps/' + id + '.xml');
  const r = await get(ORIGIN, path);
  if (r.status !== 200) { sitemapFailures.push({ id, problem: 'status ' + r.status }); continue; }
  if (sha(r.body) !== sha(file)) { sitemapFailures.push({ id, problem: 'body differs from the exported file' }); continue; }
  if (PRODUCTION && r.headers['x-robots-tag']) sitemapFailures.push({ id, problem: 'production sitemap carries X-Robots-Tag' });
  sitemapUrls += (r.body.toString('utf8').match(/<loc>/g) || []).length;
}

const lat = stats.latencyMs.sort((a, b) => a - b);
const pct = (p) => +lat[Math.min(lat.length - 1, Math.floor(lat.length * p))].toFixed(1);
const report = {
  sweptAt: new Date().toISOString(),
  origin: ORIGIN,
  mode: PRODUCTION ? 'production' : 'staging',
  version: manifest.version,
  pages: { total: pages.length, identical: stats.identical, failed: failures.length, cacheHit: stats.cacheHit, cacheMiss: stats.cacheMiss, megabytes: +(stats.bytes / 1048576).toFixed(1) },
  latencyMs: { p50: pct(0.5), p90: pct(0.9), p99: pct(0.99) },
  sitemaps: { files: sitemapIds.length + 1, ok: sitemapIds.length + 1 - sitemapFailures.length, failed: sitemapFailures.length, urlsListed: sitemapUrls },
  failures: failures.slice(0, 50),
  sitemapFailures,
};
await writeFile(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ pages: report.pages, latencyMs: report.latencyMs, sitemaps: report.sitemaps }, null, 1));
process.exit(failures.length || sitemapFailures.length ? 1 : 0);
