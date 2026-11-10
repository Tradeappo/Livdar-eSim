// Compare every Atlas child sitemap as Cloudflare serves it with the same file as the
// Next.js app serves it, at the production URL /sitemap/<id>.xml.
//
// Next.js serialises its own sitemaps and the Worker serves the exporter's, so the bytes
// differ (element order, indentation); what must not differ is what a crawler reads. Both
// sides are parsed and compared per URL: the set of <loc>s, and for each one its lastmod
// (as an instant), changefreq, priority and the complete hreflang map.
//
// The ids come from the Next.js side's own index, /sitemap.xml, filtered to atlas-*, so a
// child Next publishes and the Worker lacks is caught as well as the other way round.
//
// Usage: ATLAS_ORIGIN_A=<next> ATLAS_ORIGIN_B=<worker> node scripts/atlas/compare-sitemaps.mjs [--out FILE]

import { writeFile } from 'node:fs/promises';

const A = (process.env.ATLAS_ORIGIN_A || '').replace(/\/$/, '');
const B = (process.env.ATLAS_ORIGIN_B || '').replace(/\/$/, '');
if (!A || !B) throw new Error('ATLAS_ORIGIN_A (Next.js) and ATLAS_ORIGIN_B (Worker) are required');
const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const OUT = argOf('out', 'reports/atlas-cloudflare-sitemaps.json');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

function parse(xml) {
  const out = new Map();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const u = m[1];
    const loc = decode((u.match(/<loc>([^<]+)<\/loc>/) || [, ''])[1].trim());
    const lastmod = (u.match(/<lastmod>([^<]+)<\/lastmod>/) || [, null])[1];
    const alternates = {};
    for (const a of u.matchAll(/<xhtml:link[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g)) alternates[a[1]] = decode(a[2]);
    out.set(loc, {
      lastmod: lastmod ? new Date(lastmod.trim()).toISOString() : null,
      changefreq: (u.match(/<changefreq>([^<]+)<\/changefreq>/) || [, null])[1],
      priority: (() => { const p = (u.match(/<priority>([^<]+)<\/priority>/) || [, null])[1]; return p == null ? null : Number(p); })(),
      alternates,
    });
  }
  return out;
}

const indexXml = await (await fetch(A + '/sitemap.xml')).text();
const ids = [...indexXml.matchAll(/\/sitemap\/(atlas-[A-Za-z0-9-]+)\.xml/g)].map((m) => m[1]);
if (!ids.length) throw new Error('the Next.js sitemap index lists no atlas-* children');

const files = [];
let urls = 0;
for (const id of ids) {
  const path = '/sitemap/' + id + '.xml';
  const [ra, rb] = await Promise.all([fetch(A + path), fetch(B + path)]);
  const row = { id, status: { next: ra.status, worker: rb.status }, differences: [] };
  if (ra.status !== 200 || rb.status !== 200) { row.differences.push('status'); files.push(row); continue; }
  const [ma, mb] = [parse(await ra.text()), parse(await rb.text())];
  urls += ma.size;
  for (const loc of ma.keys()) if (!mb.has(loc)) row.differences.push('missing on Cloudflare: ' + loc);
  for (const loc of mb.keys()) if (!ma.has(loc)) row.differences.push('extra on Cloudflare: ' + loc);
  for (const [loc, ea] of ma) {
    const eb = mb.get(loc);
    if (!eb) continue;
    for (const f of ['lastmod', 'changefreq', 'priority']) if (ea[f] !== eb[f]) row.differences.push(f + ' ' + loc + ': ' + ea[f] + ' vs ' + eb[f]);
    const ka = JSON.stringify(Object.entries(ea.alternates).sort());
    const kb = JSON.stringify(Object.entries(eb.alternates).sort());
    if (ka !== kb) row.differences.push('hreflang ' + loc);
  }
  row.urls = ma.size;
  row.differences = row.differences.slice(0, 10);
  files.push(row);
}

const bad = files.filter((f) => f.differences.length);
const report = { comparedAt: new Date().toISOString(), files: files.length, identical: files.length - bad.length, differing: bad.length, urls, failures: bad.slice(0, 20) };
await writeFile(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ files: report.files, identical: report.identical, differing: report.differing, urls, examples: bad.slice(0, 3).map((b) => ({ id: b.id, d: b.differences.slice(0, 3) })) }, null, 1));
process.exit(bad.length ? 1 : 0);
