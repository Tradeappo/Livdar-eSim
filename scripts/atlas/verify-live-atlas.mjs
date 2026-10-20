// Verify every Atlas page of every registered cohort against a running origin.
//
//   node scripts/atlas/verify-live-atlas.mjs <repoDir> <baseUrl> [outJson] [--headers 'k: v']
//     https://livdar.com                      production
//     http://localhost:3117                   a local `next start` of a production build
//     https://<preview>.vercel.app --headers 'cookie: _vercel_jwt=...'   a protected preview
//
// Used to publish cohort 003 on 2026-10-20: 1,500 of 1,500 passed locally, on the preview
// (except noindex, which previews carry on purpose, lib/indexing.js) and in production.
// Checks per page: HTTP 200, self canonical on livdar.com, no noindex, the
// hreflang set equals the model's alternates (x-default included), every model
// internal link is present in the HTML, and the URL is in a child sitemap.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [repo, base, out] = process.argv.slice(2);
const hi = process.argv.indexOf('--headers');
const extra = hi > 0 ? Object.fromEntries([process.argv[hi + 1].split(/:\s*/)]) : {};
const SITE = 'https://livdar.com';
// What serving is SUPPOSED to emit: the cluster across every cohort, from the
// repository's own function, not the subset stored when a cohort was built.
const { alternatesFor } = await import(pathToFileURL(join(repo, 'lib/atlas/serve-pages.js')).href);
// The cohorts are read from MANIFESTS in the repository's own serve-pages.js, so this checks
// exactly what the site serves and needs no edit when a cohort is added.
const { MANIFESTS } = await import(pathToFileURL(join(repo, 'lib/atlas/serve-pages.js')).href);
const cohortIds = MANIFESTS.map((m) => (m.match(/cohort-(\d+)-pages/) || [])[1]).filter(Boolean);
const pages = cohortIds.flatMap((c) =>
  JSON.parse(readFileSync(join(repo, 'data/atlas/cohorts/cohort-' + c + '-pages.json'), 'utf8')).pages.map((p) => ({ ...p, _c: c })));

async function get(url, tries = 5) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: extra, redirect: 'manual' });
      return { status: r.status, text: r.status === 200 ? await r.text() : '', cache: r.headers.get('x-vercel-cache') };
    } catch (e) {
      if (i >= tries) return { status: 0, text: '', err: String(e.cause?.code || e.message) };
      await new Promise((s) => setTimeout(s, 500 * 2 ** i));
    }
  }
}
const local = (u) => u.replace(SITE, base);
const attr = (tag, name) => (tag.match(new RegExp(name + '="([^"]*)"')) || [])[1];
const dec = (s) => (s || '').replace(/&amp;/g, '&');

// sitemap membership
const index = await get(base + '/sitemap.xml');
const kids = [...index.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const inMap = new Set();
const kidStatus = {};
for (const k of kids) {
  const r = await get(local(k));
  kidStatus[r.status] = (kidStatus[r.status] || 0) + 1;
  for (const m of r.text.matchAll(/<loc>([^<]+)<\/loc>/g)) inMap.add(m[1]);
}

const fails = [];
const bad = (p, why) => fails.push({ cohort: p._c, path: p.path, why });
let done = 0;
async function check(p) {
  const r = await get(base + p.path);
  if (r.status !== 200) return bad(p, 'status ' + r.status + (r.err ? ' ' + r.err : ''));
  const h = r.text;
  const head = h.slice(0, h.indexOf('</head>') + 1 || 200000);
  const canon = [...head.matchAll(/<link[^>]*rel="canonical"[^>]*>/g)].map((m) => dec(attr(m[0], 'href')));
  if (canon.length !== 1 || canon[0] !== SITE + p.path) bad(p, 'canonical ' + JSON.stringify(canon));
  const robots = [...head.matchAll(/<meta[^>]*name="robots"[^>]*>/g)].map((m) => attr(m[0], 'content')).join(',');
  if (/noindex|nofollow/.test(robots)) bad(p, 'robots ' + robots);
  const alts = [...head.matchAll(/<link[^>]*rel="alternate"[^>]*hrefLang="[^"]*"[^>]*>|<link[^>]*hrefLang="[^"]*"[^>]*rel="alternate"[^>]*>/gi)]
    .map((m) => (attr(m[0], 'hrefLang') || attr(m[0], 'hreflang')) + ' ' + dec(attr(m[0], 'href'))).sort();
  const want = alternatesFor(p).map((a) => a.hreflang + ' ' + a.href).sort();
  if (JSON.stringify(alts) !== JSON.stringify(want)) bad(p, 'hreflang got ' + alts.length + ' want ' + want.length);
  const body = h.slice(h.indexOf('<body'));
  const missingLinks = (p.links || []).filter((l) => !body.includes('href="' + l.href + '"'));
  if (missingLinks.length) bad(p, missingLinks.length + ' internal links missing, first ' + missingLinks[0].href);
  if (!inMap.has(SITE + p.path)) bad(p, 'not in any child sitemap');
}
const queue = [...pages];
await Promise.all(Array.from({ length: 12 }, async () => {
  while (queue.length) { await check(queue.shift()); done++; }
}));

const byCohort = {};
for (const p of pages) byCohort[p._c] = byCohort[p._c] || { pages: 0, failing: new Set() };
for (const p of pages) byCohort[p._c].pages++;
for (const f of fails) byCohort[f.cohort].failing.add(f.path);
const summary = {
  base, checkedAt: new Date().toISOString(), pages: pages.length,
  sitemap: { children: kids.length, childStatus: kidStatus, uniqueLocs: inMap.size },
  byCohort: Object.fromEntries(Object.entries(byCohort).map(([c, v]) => [c, { pages: v.pages, failing: v.failing.size }])),
  failures: fails.length, byReason: fails.reduce((a, f) => { const k = f.why.replace(/[0-9]+|\/[^ ]*|\[.*\]/g, '#'); a[k] = (a[k] || 0) + 1; return a; }, {}),
  sample: fails.slice(0, 15),
};
if (out) writeFileSync(out, JSON.stringify({ ...summary, allFailures: fails }, null, 1));
console.log(JSON.stringify(summary, null, 1));
process.exit(fails.length ? 1 : 0);
