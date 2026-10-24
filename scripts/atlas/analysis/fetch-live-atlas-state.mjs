// Fetch the live state that scripts/atlas/analysis/atlas-reconciliation.py reads with --live:
// the sitemap index and every child, then every URL in the sitemap plus every cohort URL, with
// HTTP status, rel=canonical, robots meta and X-Robots-Tag. Read only; it changes nothing.
//
// Usage: node scripts/atlas/analysis/fetch-live-atlas-state.mjs <main checkout> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';

const [repo, out] = process.argv.slice(2);
const get = async (u) => {
  let last;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(u, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (compatible; livdar-audit)' } });
      return { status: r.status, xrobots: r.headers.get('x-robots-tag'), location: r.headers.get('location'), text: await r.text() };
    } catch (e) { last = e; await new Promise((r) => setTimeout(r, 1500)); }
  }
  return { status: 0, error: String(last), text: '' };
};
const locs = (x) => [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

const idx = await get('https://livdar.com/sitemap.xml');
const children = locs(idx.text);
const sitemapOf = {};
const childStatus = {};
for (const c of children) {
  const r = await get(c);
  childStatus[c] = { status: r.status, urls: locs(r.text).length };
  for (const u of locs(r.text)) (sitemapOf[u] ||= []).push(c);
}
const cohort = {};
for (const c of ['001', '002', '003']) {
  for (const p of JSON.parse(readFileSync(`${repo}/data/atlas/cohorts/cohort-${c}-pages.json`, 'utf8')).pages) {
    cohort['https://livdar.com' + p.path] = { c, path: p.path, family: p.family, locale: p.locale };
  }
}
const queue = [...new Set([...Object.keys(sitemapOf), ...Object.keys(cohort)])];
const pages = {};
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const u = queue.pop();
    const r = await get(u);
    const canonical = (r.text.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/) || r.text.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/) || [])[1] || null;
    const robots = (r.text.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/) || [])[1] || null;
    pages[u] = { status: r.status, canonical, robots, xrobots: r.xrobots, location: r.location, error: r.error || null };
  }
}));
writeFileSync(out, JSON.stringify({ checked_at: new Date().toISOString(), index_status: idx.status, children, childStatus, sitemapOf, cohort, pages }));
console.log(JSON.stringify({ children: children.length, sitemap_urls: Object.keys(sitemapOf).length, checked: Object.keys(pages).length }));
