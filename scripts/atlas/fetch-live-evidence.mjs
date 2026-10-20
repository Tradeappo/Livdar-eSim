// Fetch every page of one cohort from production and record the response, as the evidence
// scripts/atlas/cohort-publish.mjs --live requires.
//
//   node scripts/atlas/fetch-live-evidence.mjs <cohort> <outJson>
//   e.g. node scripts/atlas/fetch-live-evidence.mjs 003 /tmp/live-003.json
//
// Records per page: status, x-vercel-cache, canonical, robots, hreflang count, and a problems
// list that is empty only when the page answered 200 with a self canonical and no noindex.
// Wrap the rows into data/atlas/launches/evidence-<date>.json with productionDeployment and
// commit (see the 2026-10-20 file for the shape) before passing it to --evidence.
import { readFileSync, writeFileSync } from 'node:fs';
const [cohort, out] = process.argv.slice(2);
if (!cohort || !out) { console.error('usage: fetch-live-evidence.mjs <cohort> <outJson>'); process.exit(2); }
const pages = JSON.parse(readFileSync('data/atlas/cohorts/cohort-' + cohort + '-pages.json', 'utf8')).pages;
const at = new Date().toISOString();
const attr = (t, n) => (t.match(new RegExp(n + '="([^"]*)"')) || [])[1];
async function get(u) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(u, { redirect: 'manual' });
      return { status: r.status, text: r.status === 200 ? await r.text() : '', cache: r.headers.get('x-vercel-cache') };
    } catch (e) {
      if (i >= 5) return { status: 0, text: '' };
      await new Promise((s) => setTimeout(s, 500 * 2 ** i));
    }
  }
}
const rows = [];
const q = [...pages];
await Promise.all(Array.from({ length: 10 }, async () => {
  while (q.length) {
    const p = q.shift();
    const r = await get('https://livdar.com' + p.path);
    const head = r.text.slice(0, r.text.indexOf('</head>'));
    const canon = (head.match(/<link[^>]*rel="canonical"[^>]*>/) || [''])[0];
    const robots = (head.match(/<meta[^>]*name="robots"[^>]*>/) || [''])[0];
    const ok = r.status === 200 && attr(canon, 'href') === 'https://livdar.com' + p.path && !/noindex/.test(attr(robots, 'content') || '');
    rows.push({ path: p.path, locale: p.locale, surface: p.surface, family: p.family, entity: String(p.entity), cohort: 'cohort-' + cohort,
      status: r.status, cache: r.cache, canonical: attr(canon, 'href') || null, robots: attr(robots, 'content') || null,
      hreflangCount: (head.match(/hrefLang="[^"]*"/gi) || []).length, problems: ok ? [] : ['check'] });
  }
}));
writeFileSync(out, JSON.stringify({ at, rows }, null, 1));
const by = {}; for (const r of rows) by[r.status] = (by[r.status] || 0) + 1;
console.log(JSON.stringify({ at, fetched: rows.length, byStatus: by, withProblems: rows.filter((r) => r.problems.length).length }));
